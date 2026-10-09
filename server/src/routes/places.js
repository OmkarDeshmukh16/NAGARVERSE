const express = require('express')
const axios = require('axios')
const Place = require('../models/Place')
const auth = require('../middleware/auth')
const User = require('../models/User')

const router = express.Router()

// Demo places for when DB is empty or OSM fails
const DEMO_PLACES = [
  { _id: 'demo1', name: 'Shabree Restaurant', category: 'food', address: 'FC Road, Pune', rating: 4.5, priceRange: '₹200–₹500', description: 'Authentic Maharashtrian thali with seasonal specials.', location: { type: 'Point', coordinates: [73.8407, 18.5204] }, tags: ['maharashtrian', 'thali', 'veg'], isDemo: true, openHours: '11 AM–10 PM' },
  { _id: 'demo2', name: 'Vada Pav Corner', category: 'food', address: 'Near Shaniwar Wada, Pune', rating: 4.3, priceRange: '₹20', description: 'Pune\'s most iconic street food — freshly made vada pav.', location: { type: 'Point', coordinates: [73.8553, 18.5193] }, tags: ['street food', 'vada pav', 'quick bite'], isDemo: true, openHours: '8 AM–8 PM' },
  { _id: 'demo3', name: 'Shaniwar Wada', category: 'heritage', address: 'Shaniwar Peth, Pune', rating: 4.7, description: '18th-century fortification and seat of Peshwa rulers.', location: { type: 'Point', coordinates: [73.8553, 18.5193] }, tags: ['heritage', 'history', 'maratha'], isDemo: true, openHours: '8 AM–6:30 PM' },
  { _id: 'demo4', name: 'The Westin Pune', category: 'hotel', address: 'Koregaon Park, Pune', rating: 4.8, priceRange: '₹4,500/night', description: 'Five-star luxury hotel with city views and world-class amenities.', location: { type: 'Point', coordinates: [73.8949, 18.5406] }, tags: ['luxury', '5-star', 'pool'], isDemo: true },
  { _id: 'demo5', name: 'Aga Khan Palace', category: 'heritage', address: 'Nagar Road, Pune', rating: 4.6, description: 'Historic palace with significance to Indian independence movement.', location: { type: 'Point', coordinates: [73.9012, 18.5529] }, tags: ['heritage', 'gandhi', 'museum'], isDemo: true, openHours: '9 AM–5:30 PM' },
  { _id: 'demo6', name: 'Sinhagad Fort', category: 'heritage', address: '35 km from Pune city', rating: 4.9, description: 'Ancient hill fort at 1312m elevation with breathtaking views.', location: { type: 'Point', coordinates: [73.7557, 18.3661] }, tags: ['fort', 'trekking', 'history'], isDemo: true, openHours: '5 AM–8 PM' },
  { _id: 'demo7', name: 'Phoenix Mall', category: 'shopping', address: 'Nagar Road, Pune', rating: 4.2, description: 'Premier shopping destination with 300+ stores and food court.', location: { type: 'Point', coordinates: [73.9054, 18.5540] }, tags: ['mall', 'shopping', 'food court'], isDemo: true, openHours: '11 AM–10 PM' },
  { _id: 'demo8', name: 'Lala Coffee', category: 'cafe', address: 'Koregaon Park, Pune', rating: 4.4, priceRange: '₹150–₹400', description: 'Artisanal coffee shop with specialty brews and cozy ambiance.', location: { type: 'Point', coordinates: [73.8930, 18.5380] }, tags: ['coffee', 'cafe', 'cozy'], isDemo: true, openHours: '8 AM–11 PM' },
]

// Fetch from OpenStreetMap Overpass API
async function fetchFromOSM(category, lat, lng, radius = 5000) {
  const tagMap = {
    food: 'amenity~"restaurant|fast_food|food_court"',
    cafe: 'amenity=cafe',
    hotel: 'tourism~"hotel|guest_house|hostel"',
    heritage: 'historic',
    park: 'leisure=park',
    shopping: 'shop',
    hospital: 'amenity~"hospital|clinic|pharmacy"',
    transit: 'public_transport',
  }
  const tag = tagMap[category] || 'amenity'
  const query = `[out:json][timeout:10];(node[${tag}](around:${radius},${lat},${lng}););out center 20;`

  try {
    const res = await axios.post('https://overpass-api.de/api/interpreter',
      `data=${encodeURIComponent(query)}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Nagarverse-App/1.0 (Pune City Exploration; contact@nagarverse.local)'
        },
        timeout: 6000
      }
    )
    return (res.data.elements || []).map(el => ({
      _id: `osm_${el.id}`,
      name: el.tags?.name || el.tags?.['name:en'] || 'Unknown',
      category,
      address: [el.tags?.['addr:housenumber'], el.tags?.['addr:street'], el.tags?.['addr:suburb']].filter(Boolean).join(', '),
      location: { type: 'Point', coordinates: [el.lon || el.center?.lon, el.lat || el.center?.lat] },
      openHours: el.tags?.opening_hours,
      phone: el.tags?.phone,
      website: el.tags?.website,
      tags: Object.values(el.tags || {}).slice(0, 5),
      osmId: String(el.id),
      isDemo: false,
      sourceMetadata: { name: 'OpenStreetMap', fetchedAt: new Date(), reliability: 'community-verified' },
    })).filter(p => p.name !== 'Unknown' && p.location.coordinates[0] && p.location.coordinates[1])
  } catch (err) {
    return null
  }
}

// GET /api/places
router.get('/', async (req, res, next) => {
  try {
    const { category, q, sortBy = 'relevance', lat = 18.5204, lng = 73.8567, limit = 40, page = 1 } = req.query
    const latF = parseFloat(lat), lngF = parseFloat(lng)

    // Try DB first if connected
    let places = []
    const mongoose = require('mongoose')
    if (mongoose.connection.readyState === 1) {
      try {
        const query = {}
        if (category) query.category = category
        if (q) query.$text = { $search: q }

        places = await Place.find(query).limit(+limit).lean()
      } catch (dbErr) {
        // Fallback
      }
    }

    // If DB empty, try OSM
    if (places.length === 0 && !q) {
      const osmPlaces = await fetchFromOSM(category || 'food', latF, lngF)
      if (osmPlaces && osmPlaces.length > 0) {
        places = osmPlaces.slice(0, +limit)
      }
    }

    // If still empty, use demo data
    if (places.length === 0) {
      places = DEMO_PLACES.filter(p => !category || p.category === category)
    }

    // Add distance
    const withDistance = places.map(p => {
      const coords = p.location?.coordinates
      if (!coords || coords.length < 2) return p
      const [pLng, pLat] = coords
      const R = 6371000
      const dLat = (pLat - latF) * Math.PI / 180
      const dLng = (pLng - lngF) * Math.PI / 180
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(latF * Math.PI / 180) * Math.cos(pLat * Math.PI / 180) * Math.sin(dLng / 2) ** 2
      const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      return { ...p, distance }
    })

    // Sort
    if (sortBy === 'distance') withDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0))
    else if (sortBy === 'rating') withDistance.sort((a, b) => (b.rating || 0) - (a.rating || 0))

    res.json({ places: withDistance, total: withDistance.length, isDemo: places.some(p => p.isDemo) })
  } catch (err) {
    next(err)
  }
})

// GET /api/places/saved
router.get('/saved', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('savedPlaces')
    res.json({ places: user?.savedPlaces || [] })
  } catch (err) { next(err) }
})

// POST /api/places/save
router.post('/save', auth, async (req, res, next) => {
  try {
    const { placeId } = req.body
    await User.findByIdAndUpdate(req.user.id, { $addToSet: { savedPlaces: placeId } })
    res.json({ message: 'Place saved' })
  } catch (err) { next(err) }
})

// GET /api/places/:id
router.get('/:id', async (req, res, next) => {
  try {
    const place = await Place.findById(req.params.id).lean()
    if (!place) {
      const demo = DEMO_PLACES.find(p => p._id === req.params.id)
      if (demo) return res.json({ place: demo })
      return res.status(404).json({ error: 'Place not found' })
    }
    res.json({ place })
  } catch (err) { next(err) }
})

module.exports = router
