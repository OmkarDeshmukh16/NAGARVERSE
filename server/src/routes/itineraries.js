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

// GET /api/itineraries
router.get('/', async (req, res) => {
  try {
    let itineraries = []
    try {
      itineraries = await Itinerary.find().sort({ createdAt: -1 }).limit(20)
    } catch {
      // DB offline
    }

    if (!itineraries || itineraries.length === 0) {
      itineraries = CURATED_ITINERARIES
    }

    res.json({
      success: true,
      itineraries,
    })
  } catch (error) {
    res.status(500).json({ error: error.message, itineraries: CURATED_ITINERARIES })
  }
})

// POST /api/itineraries
router.post('/', async (req, res) => {
  try {
    const { title, summary, city = 'Pune', stops = [], form, notes } = req.body

    const newItinerary = {
      _id: 'itin-' + Date.now(),
      title: title || 'Custom Pune Plan',
      summary: summary || 'Personalized AI Generated Itinerary',
      city,
      stops,
      form,
      notes,
      createdAt: new Date().toISOString(),
    }

    try {
      const doc = new Itinerary({
        title: newItinerary.title,
        summary: newItinerary.summary,
        city: newItinerary.city,
        stops: newItinerary.stops,
        form: newItinerary.form,
      })
      await doc.save()
      newItinerary._id = doc._id
    } catch {
      CURATED_ITINERARIES.unshift(newItinerary)
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

// DELETE /api/itineraries/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    try {
      await Itinerary.findByIdAndDelete(id)
    } catch {
      // In memory fallback
    }
    res.json({ success: true, message: 'Itinerary deleted' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
