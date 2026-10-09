const express = require('express')
const router = express.Router()
const multer = require('multer')
const Incident = require('../models/Incident')

// Multer in-memory upload handler
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
})

// In-memory fallback reports
const COMMUNITY_REPORTS = [
  {
    _id: 'rep-1',
    category: 'road_hazard',
    severity: 'high',
    description: 'Pothole cluster spanning 15 meters near Nal Stop flyover descent towards Deccan.',
    locationName: 'Nal Stop / Karve Road Junction',
    location: { type: 'Point', coordinates: [73.8322, 18.5085] },
    verificationStatus: 'verified',
    upvotes: 24,
    reportedBy: { name: 'Aditya S.' },
    isAnonymous: false,
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    aiSummary: 'Major road surface degradation. High priority for two-wheeler safety.',
  },
  {
    _id: 'rep-2',
    category: 'poor_lighting',
    severity: 'medium',
    description: 'Dark stretch on Ferguson College back gate lane. 4 continuous pole lights out.',
    locationName: 'FC Back Gate, Shivajinagar',
    location: { type: 'Point', coordinates: [73.8405, 18.5221] },
    verificationStatus: 'under_review',
    upvotes: 18,
    reportedBy: { name: 'Pooja K.' },
    isAnonymous: false,
    createdAt: new Date(Date.now() - 3600000 * 7).toISOString(),
    aiSummary: 'Lighting failure in high student traffic zone. Ward office notified.',
  },
  {
    _id: 'rep-3',
    category: 'traffic',
    severity: 'medium',
    description: 'Broken delivery truck blocking right lane on University Flyover towards Aundh.',
    locationName: 'Savitribai Phule Pune University Circle',
    location: { type: 'Point', coordinates: [73.8291, 18.5529] },
    verificationStatus: 'verified',
    upvotes: 31,
    reportedBy: { name: 'Anonymous Citizen' },
    isAnonymous: true,
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    aiSummary: 'Single-lane obstruction cleared by traffic marshals. Traffic normalizing.',
  },
  {
    _id: 'rep-4',
    category: 'flooding',
    severity: 'low',
    description: 'Minor water logging after afternoon pre-monsoon showers near Koregaon Park lane 5.',
    locationName: 'Lane 5, Koregaon Park',
    location: { type: 'Point', coordinates: [73.8967, 18.5362] },
    verificationStatus: 'resolved',
    upvotes: 9,
    reportedBy: { name: 'Rohan M.' },
    isAnonymous: false,
    createdAt: new Date(Date.now() - 3600000 * 22).toISOString(),
    aiSummary: 'Drainage blockage cleared by local maintenance staff.',
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

// GET /api/reports
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { status, category, limit = 50, mine } = req.query
    const filter = {}
    if (status && status !== 'all') filter.verificationStatus = status
    if (category && category !== 'all') filter.category = category

    if (mine === 'true') {
      if (!req.user?.id) return res.status(401).json({ error: 'Authentication required for user reports' })
      filter.reportedBy = req.user.id
    }

    let reports = []
    const mongoose = require('mongoose')
    if (mongoose.connection.readyState === 1) {
      try {
        reports = await Incident.find(filter)
          .populate('reportedBy', 'name email')
          .sort({ createdAt: -1 })
          .limit(Number(limit))
          .lean()
      } catch {
        // DB offline
      }
    }

    if (!reports || reports.length === 0) {
      if (mine === 'true') {
        reports = []
      } else {
        reports = COMMUNITY_REPORTS.filter(r => {
          if (status && status !== 'all' && r.verificationStatus !== status) return false
          if (category && category !== 'all' && r.category !== category) return false
          return true
        }).map(r => ({ ...r, isDemo: true }))
      }
    }

    res.json({
      success: true,
      count: reports.length,
      reports,
      isDemo: reports.some(r => r.isDemo),
    })
  } catch (error) {
    res.status(500).json({ error: error.message, reports: COMMUNITY_REPORTS.map(r => ({ ...r, isDemo: true })) })
  }
})

// GET /api/reports/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const demo = COMMUNITY_REPORTS.find(r => r._id === id)
    if (demo) return res.json({ success: true, report: { ...demo, isDemo: true } })

    const mongoose = require('mongoose')
    if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(id)) {
      const incident = await Incident.findById(id).populate('reportedBy', 'name email').lean()
      if (incident) return res.json({ success: true, report: incident })
    }

    res.status(404).json({ error: 'Report not found' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST /api/reports
router.post('/', optionalAuth, upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'photos', maxCount: 5 }]), async (req, res) => {
  try {
    const { category, severity, description, location, anonymous, locationName, lng, lat } = req.body

    if (!description && !req.files?.audio) {
      return res.status(400).json({ error: 'Description or voice note is required' })
    }

    const isAnon = anonymous === 'true' || anonymous === true
    const locName = locationName || location || 'Pune City'

    // Parse coordinates or fallback to Pune center
    let coords = [73.8567, 18.5204]
    if (lng && lat && !isNaN(parseFloat(lng)) && !isNaN(parseFloat(lat))) {
      coords = [parseFloat(lng), parseFloat(lat)]
    }

    // Convert uploaded photos to data URLs for persistent demonstration in DB
    const photos = []
    if (req.files?.photos) {
      req.files.photos.forEach(file => {
        const base64 = file.buffer.toString('base64')
        photos.push(`data:${file.mimetype};base64,${base64}`)
      })
    }

    let audioUrl = undefined
    if (req.files?.audio?.[0]) {
      const audioFile = req.files.audio[0]
      audioUrl = `data:${audioFile.mimetype};base64,${audioFile.buffer.toString('base64')}`
    }

    const newReport = {
      _id: 'rep-' + Date.now(),
      category: category || 'other',
      severity: severity || 'medium',
      description: description || 'Voice report submitted by citizen',
      locationName: locName,
      location: {
        type: 'Point',
        coordinates: coords,
      },
      verificationStatus: 'submitted',
      isAnonymous: isAnon,
      reportedBy: !isAnon && req.user?.id ? req.user.id : undefined,
      photos,
      audioUrl,
      upvotes: 1,
      createdAt: new Date().toISOString(),
      aiSummary: `Citizen incident filed under ${category || 'general'}. Auto-assigned for verification.`,
      isDemo: false,
    }

    const mongoose = require('mongoose')
    if (mongoose.connection.readyState === 1) {
      const incidentDoc = new Incident({
        category: newReport.category,
        severity: newReport.severity,
        description: newReport.description,
        locationName: newReport.locationName,
        location: newReport.location,
        isAnonymous: newReport.isAnonymous,
        reportedBy: newReport.reportedBy,
        photos: newReport.photos,
        audioUrl: newReport.audioUrl,
        upvotes: 1,
        verificationStatus: 'submitted',
      })
      await incidentDoc.save()
      newReport._id = incidentDoc._id
    } else {
      COMMUNITY_REPORTS.unshift({ ...newReport, isDemo: true })
    }

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      report: newReport,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// PATCH /api/reports/:id/status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    if (!['submitted', 'under_review', 'verified', 'rejected', 'resolved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid verification status' })
    }

    const mongoose = require('mongoose')
    if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(id)) {
      const updated = await Incident.findByIdAndUpdate(id, { verificationStatus: status }, { new: true })
      if (updated) return res.json({ success: true, report: updated })
    }

    const demo = COMMUNITY_REPORTS.find(r => r._id === id)
    if (demo) {
      demo.verificationStatus = status
      return res.json({ success: true, report: demo })
    }

    res.status(404).json({ error: 'Report not found' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST /api/reports/:id/vote
router.post('/:id/vote', async (req, res) => {
  const { id } = req.params
  const mongoose = require('mongoose')

  if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(id)) {
    try {
      const updated = await Incident.findByIdAndUpdate(id, { $inc: { upvotes: 1 } }, { new: true })
      if (updated) return res.json({ success: true, upvotes: updated.upvotes })
    } catch {}
  }

  const report = COMMUNITY_REPORTS.find(r => r._id === id)
  if (report) {
    report.upvotes = (report.upvotes || 0) + 1
    return res.json({ success: true, upvotes: report.upvotes })
  }

  res.json({ success: true, upvotes: 1 })
})

module.exports = router

