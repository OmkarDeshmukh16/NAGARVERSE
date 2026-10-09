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

// Helper to match text in demo places
function matchDemoQuery(place, q) {
  if (!q) return true
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean)
  const target = `${place.name} ${place.description || ''} ${place.address || ''} ${(place.tags || []).join(' ')} ${place.category || ''}`.toLowerCase()
  return terms.some(term => target.includes(term))
}

// Unified query function for places
async function queryPlaces({ category, q, sortBy = 'relevance', lat = 18.5204, lng = 73.8567, limit = 40 }) {
  const latF = parseFloat(lat) || 18.5204
  const lngF = parseFloat(lng) || 73.8567
  const mongoose = require('mongoose')
  let places = []
  let isDemoSource = false

  // 1. Try DB first if connected
  if (mongoose.connection.readyState === 1) {
    try {
      const query = {}
      if (category && category !== 'all') query.category = category
      if (q) {
        query.$or = [
          { name: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { tags: { $in: [new RegExp(q, 'i')] } },
        ]
      }
      places = await Place.find(query).limit(+limit).lean()
    } catch {
      // Fall through to external/demo
    }
  }

  // 2. If DB empty and category provided, try Overpass OSM
  if (places.length === 0 && (!q || q.length < 3)) {
    const osmPlaces = await fetchFromOSM(category && category !== 'all' ? category : 'food', latF, lngF)
    if (osmPlaces && osmPlaces.length > 0) {
      places = osmPlaces.slice(0, +limit)
    }
  }

  // 3. Fallback to curated demo places
  if (places.length === 0) {
    isDemoSource = true
    places = DEMO_PLACES.filter(p => {
      if (category && category !== 'all' && p.category !== category) return false
      if (q && !matchDemoQuery(p, q)) return false
      return true
    })

    // If still empty but query was specific, return all demo places matching query
    if (places.length === 0 && q) {
      places = DEMO_PLACES.filter(p => matchDemoQuery(p, q))
    }
  }

  // Calculate distance
  const withDistance = places.map(p => {
    const coords = p.location?.coordinates
    if (!coords || coords.length < 2) return p
    const [pLng, pLat] = coords
    const R = 6371000
    const dLat = (pLat - latF) * Math.PI / 180
    const dLng = (pLng - lngF) * Math.PI / 180
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(latF * Math.PI / 180) * Math.cos(pLat * Math.PI / 180) * Math.sin(dLng / 2) ** 2
    const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return { ...p, distance: Math.round(distance), isDemo: p.isDemo ?? isDemoSource }
  })

  // Sort
  if (sortBy === 'distance') withDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0))
  else if (sortBy === 'rating') withDistance.sort((a, b) => (b.rating || 0) - (a.rating || 0))

  return {
    places: withDistance,
    total: withDistance.length,
    isDemo: isDemoSource || withDistance.some(p => p.isDemo),
  }
}

// GET /api/places
router.get('/', async (req, res, next) => {
  try {
    const result = await queryPlaces(req.query)
    res.json(result)
  } catch (err) {
    next(err)
  }
})

// GET /api/places/search (documented alias)
router.get('/search', async (req, res, next) => {
  try {
    const result = await queryPlaces(req.query)
    res.json(result)
  } catch (err) {
    next(err)
  }
})

// GET /api/places/nearby (documented alias)
router.get('/nearby', async (req, res, next) => {
  try {
    const result = await queryPlaces({ ...req.query, sortBy: 'distance' })
    res.json(result)
  } catch (err) {
    next(err)
  }
})

// GET /api/places/saved
router.get('/saved', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).lean()
    if (!user) return res.status(404).json({ error: 'User not found' })
    const savedIds = user.savedPlaces || []

    let dbPlaces = []
    const mongoose = require('mongoose')
    if (mongoose.connection.readyState === 1 && savedIds.length > 0) {
      const validObjectIds = savedIds.filter(id => mongoose.isValidObjectId(id))
      const stringIds = savedIds.filter(id => !mongoose.isValidObjectId(id))
      dbPlaces = await Place.find({
        $or: [
          { _id: { $in: validObjectIds } },
          { osmId: { $in: stringIds.map(s => s.replace('osm_', '')) } },
        ],
      }).lean()
    }

    const demoMatches = DEMO_PLACES.filter(p => savedIds.includes(p._id))
    const allSaved = [...dbPlaces, ...demoMatches]

    res.json({ places: allSaved, total: allSaved.length })
  } catch (err) { next(err) }
})

// POST /api/places/save
router.post('/save', auth, async (req, res, next) => {
  try {
    const { placeId } = req.body
    if (!placeId) return res.status(400).json({ error: 'placeId required' })
    await User.findByIdAndUpdate(req.user.id, { $addToSet: { savedPlaces: String(placeId) } })
    res.json({ success: true, message: 'Place saved' })
  } catch (err) { next(err) }
})

// GET /api/places/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params

    // 1. Check in-memory demo places first
    const demo = DEMO_PLACES.find(p => p._id === id)
    if (demo) return res.json({ place: { ...demo, isDemo: true } })

    // 2. Safe check in MongoDB if valid ObjectId
    const mongoose = require('mongoose')
    if (mongoose.connection.readyState === 1) {
      if (mongoose.isValidObjectId(id)) {
        const place = await Place.findById(id).lean()
        if (place) return res.json({ place })
      }
      if (id.startsWith('osm_')) {
        const place = await Place.findOne({ osmId: id.replace('osm_', '') }).lean()
        if (place) return res.json({ place })
      }
    }

    return res.status(404).json({ error: 'Place not found' })
  } catch (err) { next(err) }
})

router.queryPlaces = queryPlaces
router.DEMO_PLACES = DEMO_PLACES

module.exports = router

