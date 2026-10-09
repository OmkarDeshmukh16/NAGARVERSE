const express = require('express')
const router = express.Router()
const Itinerary = require('../models/Itinerary')
const auth = require('../middleware/auth')

// Curated Pune itineraries as fallbacks
const CURATED_ITINERARIES = [
  {
    _id: 'itin-1',
    title: 'Pune Heritage & Maratha Empire Trail',
    summary: 'A curated full-day journey across the historic heart of the Peshwas and freedom struggle.',
    city: 'Pune',
    stops: [
      {
        name: 'Shaniwar Wada',
        time: '09:00 AM',
        duration: '1.5 hours',
        description: 'Seat of the Peshwa rulers built in 1732 with majestic Delhi Darwaza and fountain gardens.',
        estimatedCost: '₹50 entry',
        travelTime: '15 min walk to next stop',
      },
      {
        name: 'Vishrambaug Wada',
        time: '11:00 AM',
        duration: '1 hour',
        description: 'Spectacular Maratha timber craftsmanship, carved teakwood pillars, and museum artifacts.',
        estimatedCost: '₹20 entry',
        travelTime: '10 min auto rickshaw',
      },
      {
        name: 'Sujata Mastani & Tulshibaug',
        time: '12:30 PM',
        duration: '1.5 hours',
        description: 'Authentic Pune ice-cream mastani followed by vibrant bazaar stroll through old wada markets.',
        estimatedCost: '₹150 for Mastani',
        travelTime: '20 min drive',
      },
      {
        name: 'Sinhagad Fort Sunset',
        time: '04:30 PM',
        duration: '3 hours',
        description: 'Cliffside citadel with panoramic Sahyadri views, Tanaji Malusare memorial, and piping hot Kanda Bhajji & Pithla Bhakri.',
        estimatedCost: '₹200 food & parking',
        travelTime: 'Finish',
      },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'itin-2',
    title: 'Cafes, Culture & Modern Pune Pulse',
    summary: 'Explore indie cafes, art spaces, and buzzing evening vibes from FC Road to Koregaon Park.',
    city: 'Pune',
    stops: [
      {
        name: 'FC Road & Cafe Goodluck',
        time: '08:30 AM',
        duration: '1.5 hours',
        description: 'Iconic bun maska and Irani chai surrounded by morning university buzz.',
        estimatedCost: '₹120',
        travelTime: '15 min drive',
      },
      {
        name: 'Raja Dinkar Kelkar Museum',
        time: '10:30 AM',
        duration: '2 hours',
        description: 'Mesmerizing personal collection of 20,000+ Indian artifacts including Mastani Mahal recreations.',
        estimatedCost: '₹100',
        travelTime: '20 min drive',
      },
      {
        name: 'Koregaon Park Cafe Trail',
        time: '02:00 PM',
        duration: '3 hours',
        description: 'Shaded leafy banyan tree boulevards with specialty coffee roasters and artisan bakeries.',
        estimatedCost: '₹400',
        travelTime: 'Finish',
      },
    ],
    createdAt: new Date().toISOString(),
  },
]

const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET || 'nagarverse_secret_key_change_in_prod'

function optionalAuth(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '')
  if (!token) return next()
  try {
    req.user = jwt.verify(token, JWT_SECRET)
  } catch {}
  next()
}

// GET /api/itineraries
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { mine } = req.query
    let itineraries = []

    const mongoose = require('mongoose')
    if (mongoose.connection.readyState === 1) {
      try {
        const query = {}
        if (mine === 'true') {
          if (!req.user?.id) return res.status(401).json({ error: 'Authentication required for user itineraries' })
          query.user = req.user.id
        }
        itineraries = await Itinerary.find(query).sort({ createdAt: -1 }).limit(20).lean()
      } catch {
        // Fallback
      }
    }

    if (!itineraries || itineraries.length === 0) {
      if (mine === 'true') {
        itineraries = []
      } else {
        itineraries = CURATED_ITINERARIES.map(it => ({ ...it, isDemo: true }))
      }
    }

    res.json({
      success: true,
      itineraries,
      isDemo: itineraries.some(i => i.isDemo),
    })
  } catch (error) {
    res.status(500).json({ error: error.message, itineraries: CURATED_ITINERARIES.map(it => ({ ...it, isDemo: true })) })
  }
})

// GET /api/itineraries/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const curated = CURATED_ITINERARIES.find(i => i._id === id)
    if (curated) return res.json({ success: true, itinerary: { ...curated, isDemo: true } })

    const mongoose = require('mongoose')
    if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(id)) {
      const it = await Itinerary.findById(id).lean()
      if (it) return res.json({ success: true, itinerary: it })
    }

    res.status(404).json({ error: 'Itinerary not found' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST /api/itineraries
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { title, summary, city = 'Pune', stops = [], form, notes } = req.body

    const newItinerary = {
      _id: 'itin-' + Date.now(),
      user: req.user?.id,
      title: title || 'Custom Pune Plan',
      summary: summary || 'Personalized AI Generated Itinerary',
      city,
      stops,
      form,
      notes,
      createdAt: new Date().toISOString(),
      isDemo: false,
    }

    const mongoose = require('mongoose')
    if (mongoose.connection.readyState === 1) {
      const doc = new Itinerary({
        user: req.user?.id,
        title: newItinerary.title,
        summary: newItinerary.summary,
        city: newItinerary.city,
        stops: newItinerary.stops,
        form: newItinerary.form,
        notes: newItinerary.notes,
      })
      await doc.save()
      newItinerary._id = doc._id
    } else {
      CURATED_ITINERARIES.unshift({ ...newItinerary, isDemo: true })
    }

    res.status(201).json({
      success: true,
      message: 'Itinerary saved successfully',
      itinerary: newItinerary,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// DELETE /api/itineraries/:id (Protected with auth)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params
    const mongoose = require('mongoose')
    if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(id)) {
      const existing = await Itinerary.findById(id)
      if (existing) {
        if (existing.user && existing.user.toString() !== req.user.id) {
          return res.status(403).json({ error: 'Unauthorized to delete this itinerary' })
        }
        await Itinerary.findByIdAndDelete(id)
        return res.json({ success: true, message: 'Itinerary deleted' })
      }
    }

    // In-memory fallback removal
    const idx = CURATED_ITINERARIES.findIndex(i => i._id === id)
    if (idx !== -1) {
      CURATED_ITINERARIES.splice(idx, 1)
      return res.json({ success: true, message: 'Itinerary deleted from demo session' })
    }

    res.json({ success: true, message: 'Itinerary removed' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router

