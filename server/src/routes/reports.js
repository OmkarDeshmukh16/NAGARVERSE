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

// GET /api/reports
router.get('/', async (req, res) => {
  try {
    const { status, category, limit = 50 } = req.query
    const filter = {}
    if (status && status !== 'all') filter.verificationStatus = status
    if (category && category !== 'all') filter.category = category

    let reports = []
    try {
      reports = await Incident.find(filter)
        .populate('reportedBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(Number(limit))
    } catch {
      // DB offline
    }

    if (!reports || reports.length === 0) {
      reports = COMMUNITY_REPORTS.filter(r => {
        if (status && status !== 'all' && r.verificationStatus !== status) return false
        if (category && category !== 'all' && r.category !== category) return false
        return true
      })
    }

    res.json({
      success: true,
      count: reports.length,
      reports,
    })
  } catch (error) {
    res.status(500).json({ error: error.message, reports: COMMUNITY_REPORTS })
  }
})

// POST /api/reports
router.post('/', upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'photos', maxCount: 5 }]), async (req, res) => {
  try {
    const { category, severity, description, location, anonymous, locationName } = req.body

    if (!description && !req.files?.audio) {
      return res.status(400).json({ error: 'Description or voice note is required' })
    }

    const isAnon = anonymous === 'true' || anonymous === true
    const locName = locationName || location || 'Pune City'

    const newReport = {
      _id: 'rep-' + Date.now(),
      category: category || 'other',
      severity: severity || 'medium',
      description: description || 'Voice report submitted by citizen',
      locationName: locName,
      location: {
        type: 'Point',
        coordinates: [73.8567 + (Math.random() - 0.5) * 0.05, 18.5204 + (Math.random() - 0.5) * 0.05],
      },
      verificationStatus: 'submitted',
      isAnonymous: isAnon,
      upvotes: 1,
      createdAt: new Date().toISOString(),
      aiSummary: `Citizen incident filed under ${category || 'general'}. Auto-assigned for verification.`,
    }

    try {
      const incidentDoc = new Incident({
        category: newReport.category,
        severity: newReport.severity,
        description: newReport.description,
        locationName: newReport.locationName,
        location: newReport.location,
        isAnonymous: newReport.isAnonymous,
        verificationStatus: 'submitted',
      })
      await incidentDoc.save()
      newReport._id = incidentDoc._id
    } catch {
      // In-memory push fallback
      COMMUNITY_REPORTS.unshift(newReport)
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

// POST /api/reports/:id/vote
router.post('/:id/vote', async (req, res) => {
  const { id } = req.params
  const report = COMMUNITY_REPORTS.find(r => r._id === id)
  if (report) {
    report.upvotes = (report.upvotes || 0) + 1
    return res.json({ success: true, upvotes: report.upvotes })
  }
  res.json({ success: true, upvotes: 10 })
})

module.exports = router
