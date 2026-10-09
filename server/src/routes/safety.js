const express = require('express')
const router = express.Router()
const Incident = require('../models/Incident')

// ==============================================================================
// 1. CURATED / SEEDED INCIDENTS WITH ACCURATE VERIFICATION & TIMESTAMPS
// ==============================================================================
const SAMPLE_INCIDENTS = [
  {
    _id: 'inc-1',
    category: 'poor_lighting',
    description: 'Non-functioning streetlights along canal road after 8 PM.',
    location: { type: 'Point', coordinates: [73.8340, 18.5074] }, // Kothrud
    locationName: 'Karve Road / Canal Junction, Kothrud',
    severity: 'medium',
    verificationStatus: 'verified',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(), // 4 hours ago
    aiSummary: 'Lighting failure reported along 400m stretch. Moderate night hazard.',
    source: 'citizen_submission',
  },
  {
    _id: 'inc-2',
    category: 'road_hazard',
    description: 'Deep road cavity and debris after recent pipeline laying.',
    location: { type: 'Point', coordinates: [73.8507, 18.5314] }, // Shivajinagar
    locationName: 'Near Shimla Office, Shivajinagar',
    severity: 'high',
    verificationStatus: 'verified',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(), // 12 hours ago
    aiSummary: 'Unmarked trench on outer vehicular lane. High risk for two-wheelers.',
    source: 'citizen_submission',
  },
  {
    _id: 'inc-3',
    category: 'traffic',
    description: 'Heavy bottleneck due to signal sync error during peak hours.',
    location: { type: 'Point', coordinates: [73.8567, 18.5018] }, // Swargate
    locationName: 'Jedhe Chowk Flyover ramp, Swargate',
    severity: 'medium',
    verificationStatus: 'under_review',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    aiSummary: 'Signal failure causing 25-minute queueing towards Satara Road.',
    source: 'citizen_submission',
  },
  {
    _id: 'inc-4',
    category: 'flooding',
    description: 'Water accumulation on low-lying subway entrance.',
    location: { type: 'Point', coordinates: [73.9143, 18.5679] }, // Viman Nagar
    locationName: 'Symbiosis Road Underpass, Viman Nagar',
    severity: 'low',
    verificationStatus: 'resolved',
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString(), // 36 hours ago
    aiSummary: 'Subway water logging cleared by municipal suction pump.',
    source: 'citizen_submission',
  },
  {
    _id: 'inc-5',
    category: 'harassment',
    description: 'Poorly patrolled deserted stretch near secluded park perimeter after dark.',
    location: { type: 'Point', coordinates: [73.7438, 18.5912] }, // Hinjewadi Phase 1
    locationName: 'Wipro Circle to Blue Ridge Service Lane, Hinjewadi',
    severity: 'high',
    verificationStatus: 'verified',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(), // 18 hours ago
    aiSummary: 'Reported lack of security presence along tech-park perimeter. Advisory active.',
    source: 'citizen_submission',
  },
  {
    _id: 'inc-6',
    category: 'road_hazard',
    description: 'Uncovered storm water manhole cover on footpath.',
    location: { type: 'Point', coordinates: [73.8425, 18.5204] }, // FC Road
    locationName: 'Near Goodluck Cafe, FC Road',
    severity: 'critical',
    verificationStatus: 'verified',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(), // 8 hours ago
    aiSummary: 'Pedestrian hazard on high-density foot corridor. Barricade requested.',
    source: 'citizen_submission',
  },
]

// ==============================================================================
// 2. TRANSPARENT ROUTE SAFETY SCORING ENGINE
// ==============================================================================

/**
 * Calculates a documented, deterministic safety risk score (1.0 - 9.9).
 * Lower score = lower reported risk.
 *
 * FORMULA:
 * RiskScore = clamp(BaseRoadRisk + IncidentPenalty + LightingPenalty - PassiveSurveillanceBonus, 1.0, 9.9)
 *
 * @param {Object} params
 * @param {string} params.roadType - 'primary_arterial' | 'transit_corridor' | 'secondary_urban' | 'inner_alley'
 * @param {Array} params.corridorIncidents - Array of incident objects near route
 * @param {boolean} params.isNightTime - Whether current time is during nighttime
 * @param {boolean} params.hasTransitHubs - Whether route aligns with metro/transit stations
 * @param {boolean} params.hasCommercialFrontage - Whether route has active commercial shopfronts
 * @param {boolean} params.hasMissingLightingData - Whether lighting data is missing
 * @returns {Object} Score details, evidence breakdown, and data confidence
 */
function calculateRouteRiskScore({
  roadType = 'secondary_urban',
  corridorIncidents = [],
  isNightTime = false,
  hasTransitHubs = false,
  hasCommercialFrontage = false,
  hasMissingLightingData = false,
} = {}) {
  // 1. Base Road Type Risk (w_road = 0.25 scale)
  const ROAD_BASE_RISK = {
    primary_arterial: 1.2,
    transit_corridor: 1.5,
    secondary_urban: 2.4,
    inner_alley: 3.8,
  }
  const baseRoadRisk = ROAD_BASE_RISK[roadType] || 2.4

  // 2. Incident Penalty Calculation with Time Decay & Verification Weights
  const SEVERITY_WEIGHTS = {
    critical: 2.5,
    high: 1.6,
    medium: 0.8,
    low: 0.3,
  }

  const VERIFICATION_WEIGHTS = {
    verified: 1.0,
    under_review: 0.5,
    unverified: 0.5,
    resolved: 0.1,
  }

  let incidentPenalty = 0
  let verifiedCount = 0
  let unverifiedCount = 0
  let lightingIncidentsCount = 0

  const now = Date.now()

  corridorIncidents.forEach(inc => {
    const sevWeight = SEVERITY_WEIGHTS[inc.severity] || 0.5
    const verWeight = VERIFICATION_WEIGHTS[inc.verificationStatus] || 0.5

    if (inc.verificationStatus === 'verified') {
      verifiedCount++
    } else if (inc.verificationStatus !== 'resolved') {
      unverifiedCount++
    }

    if (inc.category === 'poor_lighting') {
      lightingIncidentsCount++
    }

    // Time Decay: Incidents decay over 60 days to a floor weight of 0.2
    const incDate = inc.createdAt ? new Date(inc.createdAt).getTime() : now
    const ageInDays = Math.max(0, (now - incDate) / (1000 * 60 * 60 * 24))
    const timeDecay = Math.max(0.2, 1.0 - (ageInDays / 60))

    incidentPenalty += sevWeight * verWeight * timeDecay
  })

  // 3. Lighting Penalty
  let lightingPenalty = 0
  if (lightingIncidentsCount > 0) {
    const nightMultiplier = isNightTime ? 1.8 : 1.0
    lightingPenalty = lightingIncidentsCount * 0.9 * nightMultiplier
  } else if (hasMissingLightingData) {
    // Missing data handling: apply a small uncertainty penalty if lighting data is unverified
    lightingPenalty = 0.3
  }

  // 4. Passive Surveillance & Transit Infrastructure Bonus
  let passiveBonus = 0
  if (hasTransitHubs) passiveBonus += 0.8
  if (hasCommercialFrontage) passiveBonus += 0.5

  // 5. Total Risk Calculation (Clamped to 1.0 - 9.9)
  const rawScore = baseRoadRisk + incidentPenalty + lightingPenalty - passiveBonus
  const riskScore = Math.round(Math.max(1.0, Math.min(9.9, rawScore)) * 10) / 10

  // 6. Data Confidence & Missing Data Handling
  // Note: 0 reports does NOT equate to safety!
  let confidencePercentage = 75
  let confidenceLevel = 'Moderate'
  let missingDataNotes = []

  if (hasMissingLightingData) {
    confidencePercentage -= 15
    missingDataNotes.push('No municipal street-lighting sensor data available; relies on citizen dark-spot reports.')
  }

  if (corridorIncidents.length === 0) {
    // Zero reports warning: unmonitored or unpopulated sector
    confidencePercentage -= 20
    confidenceLevel = 'Low (Unmonitored Sector)'
    missingDataNotes.push('Zero community reports recorded along this corridor. This indicates a lack of citizen submissions, NOT guaranteed safety.')
  } else if (verifiedCount > 0) {
    confidencePercentage = Math.min(95, confidencePercentage + 10)
    confidenceLevel = 'High'
  }

  if (missingDataNotes.length === 0) {
    missingDataNotes.push('Scored using community incident reports and road hierarchy. No live CCTV telemetry is accessed.')
  }

  return {
    riskScore,
    confidenceLevel,
    confidencePercentage,
    evidence: {
      roadType,
      baseRoadRisk,
      totalIncidents: corridorIncidents.length,
      verifiedIncidents: verifiedCount,
      unverifiedIncidents: unverifiedCount,
      lightingIncidentsCount,
      isNightTime,
      lightingPenalty: Math.round(lightingPenalty * 10) / 10,
      incidentPenalty: Math.round(incidentPenalty * 10) / 10,
      passiveSurveillanceBonus: passiveBonus,
      missingDataNotes: missingDataNotes.join(' '),
    },
    scoringFormula: 'Risk = clamp(BaseRoadRisk + IncidentPenalty * Decay * Verification + LightingPenalty * NightMultiplier - PassiveBonus, 1.0, 9.9)',
    limitations: 'Advisory estimate based on community reporting and urban road classification. Unreported hazards may exist. Absence of reports does not equal confirmed safety.',
  }
}

// ==============================================================================
// 3. GET /api/safety/incidents
// ==============================================================================
router.get('/incidents', async (req, res) => {
  try {
    const { severity, category, status } = req.query
    const query = {}

    if (severity && severity !== 'all') query.severity = severity
    if (category && category !== 'all') query.category = category
    if (status && status !== 'all') query.verificationStatus = status

    let incidents = []
    let isDemo = false

    const mongoose = require('mongoose')
    if (mongoose.connection.readyState === 1) {
      try {
        incidents = await Incident.find(query).sort({ createdAt: -1 }).limit(100).lean()
      } catch {
        // Fall back
      }
    }

    if (!incidents || incidents.length === 0) {
      isDemo = true
      incidents = SAMPLE_INCIDENTS.filter(inc => {
        if (severity && severity !== 'all' && inc.severity !== severity) return false
        if (category && category !== 'all' && inc.category !== category) return false
        if (status && status !== 'all' && inc.verificationStatus !== status) return false
        return true
      })
    }

    res.json({
      success: true,
      count: incidents.length,
      incidents,
      source: isDemo ? 'sample_curated' : 'database',
      isDemo,
      disclaimer: 'Incident reports are submitted by community members. "Verified" status indicates validation by community consensus or review. Absence of reports does not indicate absence of risk.',
    })
  } catch (error) {
    res.status(500).json({ error: error.message, incidents: SAMPLE_INCIDENTS, isDemo: true })
  }
})

// ==============================================================================
// 4. POST /api/safety/routes
// Returns transparent, scored route comparisons with evidence breakdowns
// ==============================================================================
router.post('/routes', async (req, res) => {
  try {
    const { origin, destination } = req.body
    if (!origin || !destination) {
      return res.status(400).json({ error: 'Origin and destination are required' })
    }

    // Determine if nighttime in local timezone (IST, UTC+5:30)
    const currentHourUTC = new Date().getUTCHours()
    const currentHourIST = (currentHourUTC + 5.5) % 24
    const isNightTime = currentHourIST >= 19 || currentHourIST < 6

    // Fetch active incidents to correlate against candidate routes
    let allIncidents = []
    const mongoose = require('mongoose')
    if (mongoose.connection.readyState === 1) {
      try {
        allIncidents = await Incident.find({ verificationStatus: { $ne: 'resolved' } }).lean()
      } catch {
        allIncidents = SAMPLE_INCIDENTS
      }
    } else {
      allIncidents = SAMPLE_INCIDENTS
    }

    // Candidate Route 1: Arterial Main Road Corridor (FC Road - Ganeshkhind Road)
    // Filter incidents located along Shivajinagar / FC Road / Ganeshkhind sector
    const route1Incidents = allIncidents.filter(inc =>
      inc.locationName?.toLowerCase().includes('fc road') ||
      inc.locationName?.toLowerCase().includes('goodluck') ||
      inc.locationName?.toLowerCase().includes('shivajinagar')
    )
    const score1 = calculateRouteRiskScore({
      roadType: 'primary_arterial',
      corridorIncidents: route1Incidents,
      isNightTime,
      hasTransitHubs: true,
      hasCommercialFrontage: true,
      hasMissingLightingData: false,
    })

    // Candidate Route 2: Express Direct Route via Inner Connecting By-lanes
    // Filter incidents in interior Kothrud / canal / Swargate by-lanes
    const route2Incidents = allIncidents.filter(inc =>
      inc.locationName?.toLowerCase().includes('canal') ||
      inc.locationName?.toLowerCase().includes('kothrud') ||
      inc.locationName?.toLowerCase().includes('swargate')
    )
    const score2 = calculateRouteRiskScore({
      roadType: 'inner_alley',
      corridorIncidents: route2Incidents,
      isNightTime,
      hasTransitHubs: false,
      hasCommercialFrontage: false,
      hasMissingLightingData: true,
    })

    // Candidate Route 3: Transit & Metro Parallel Corridor
    // Parallel to Pune Metro line with station staff and passenger footfall
    const route3Incidents = allIncidents.filter(inc =>
      inc.locationName?.toLowerCase().includes('metro') ||
      inc.category === 'flooding'
    )
    const score3 = calculateRouteRiskScore({
      roadType: 'transit_corridor',
      corridorIncidents: route3Incidents,
      isNightTime,
      hasTransitHubs: true,
      hasCommercialFrontage: false,
      hasMissingLightingData: false,
    })

    const routes = [
      {
        id: 'route-1',
        name: 'FC Road - Ganeshkhind Arterial Corridor',
        distance: '7.4 km',
        duration: '22 mins',
        riskScore: score1.riskScore,
        confidenceLevel: score1.confidenceLevel,
        confidencePercentage: score1.confidencePercentage,
        incidents: route1Incidents.length,
        reason: 'Optimal route via arterial main roads with high pedestrian footfall, active commercial storefronts, and broad sidewalks.',
        features: ['Primary Arterial Road', 'High Pedestrian Footfall', 'Commercial Frontage', 'Wide Sidewalks'],
        color: '#10b981',
        coordinates: [
          [73.8407, 18.5204],
          [73.8445, 18.5245],
          [73.8485, 18.5290],
          [73.8525, 18.5330],
          [73.8567, 18.5380],
        ],
        evidence: score1.evidence,
        scoringFormula: score1.scoringFormula,
        limitations: score1.limitations,
      },
      {
        id: 'route-2',
        name: 'Inner By-Lane Direct Route',
        distance: '6.1 km',
        duration: '17 mins',
        riskScore: score2.riskScore,
        confidenceLevel: score2.confidenceLevel,
        confidencePercentage: score2.confidencePercentage,
        incidents: route2Incidents.length,
        reason: 'Shortest driving distance via inner connecting lanes. Reduced sightlines and citizen-reported dark spots.',
        features: ['Shortest Distance', 'Inner Connecting Lanes', 'Lower Night Footfall', 'Variable Lighting Reports'],
        color: '#f59e0b',
        coordinates: [
          [73.8407, 18.5204],
          [73.8450, 18.5190],
          [73.8510, 18.5230],
          [73.8550, 18.5290],
          [73.8567, 18.5380],
        ],
        evidence: score2.evidence,
        scoringFormula: score2.scoringFormula,
        limitations: score2.limitations,
      },
      {
        id: 'route-3',
        name: 'Metro & Public Transit Corridor',
        distance: '8.2 km',
        duration: '26 mins',
        riskScore: score3.riskScore,
        confidenceLevel: score3.confidenceLevel,
        confidencePercentage: score3.confidencePercentage,
        incidents: route3Incidents.length,
        reason: 'Parallels Pune Metro Line 1 alignment with station concourse illumination and regular commuter presence.',
        features: ['Metro Station Alignment', 'Station Concourse Lighting', 'Commuter Footfall', 'Dedicated Crossings'],
        color: '#3b82f6',
        coordinates: [
          [73.8407, 18.5204],
          [73.8360, 18.5215],
          [73.8330, 18.5280],
          [73.8410, 18.5350],
          [73.8567, 18.5380],
        ],
        evidence: score3.evidence,
        scoringFormula: score3.scoringFormula,
        limitations: score3.limitations,
      },
    ]

    res.json({
      success: true,
      origin,
      destination,
      routes,
      meta: {
        scoringModel: 'NAGARVERSE Multi-Factor Route Risk Engine v1.2',
        formula: 'Risk = clamp(BaseRoadRisk + IncidentPenalty * Decay * Verification + LightingPenalty * Night - PassiveBonus, 1.0, 9.9)',
        coverageNotice: 'Absence of citizen incident reports along a corridor indicates an absence of reports, NOT guaranteed safety.',
        isNightTimeActive: isNightTime,
      },
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ==============================================================================
// 5. GET /api/safety/stats
// Transparent aggregated community safety statistics (no fabricated municipal data)
// ==============================================================================
router.get('/stats', async (req, res) => {
  try {
    let totalReports = SAMPLE_INCIDENTS.length
    let verifiedIncidents = SAMPLE_INCIDENTS.filter(i => i.verificationStatus === 'verified').length
    let underReviewReports = SAMPLE_INCIDENTS.filter(i => i.verificationStatus === 'under_review').length
    let resolvedReports = SAMPLE_INCIDENTS.filter(i => i.verificationStatus === 'resolved').length
    let lightingIssues = SAMPLE_INCIDENTS.filter(i => i.category === 'poor_lighting').length
    let activeAlerts = SAMPLE_INCIDENTS.filter(i => i.severity === 'high' || i.severity === 'critical').length
    let isDemo = true

    const mongoose = require('mongoose')
    if (mongoose.connection.readyState === 1) {
      try {
        const count = await Incident.countDocuments()
        if (count > 0) {
          totalReports = count
          verifiedIncidents = await Incident.countDocuments({ verificationStatus: 'verified' })
          underReviewReports = await Incident.countDocuments({ verificationStatus: 'under_review' })
          resolvedReports = await Incident.countDocuments({ verificationStatus: 'resolved' })
          lightingIssues = await Incident.countDocuments({ category: 'poor_lighting', verificationStatus: { $ne: 'resolved' } })
          activeAlerts = await Incident.countDocuments({
            severity: { $in: ['high', 'critical'] },
            verificationStatus: { $ne: 'resolved' },
          })
          isDemo = false
        }
      } catch {
        // Fall back to sample counts
      }
    }

    // Community Safety Index (0-100) based on resolution rate and open hazards density
    const resolutionRatio = totalReports > 0 ? (resolvedReports / totalReports) : 0.5
    const hazardPenalty = Math.min(30, activeAlerts * 4)
    const communitySafetyIndex = Math.max(40, Math.min(95, Math.round(75 + (resolutionRatio * 20) - hazardPenalty)))

    res.json({
      success: true,
      cityScore: communitySafetyIndex,
      totalReports,
      verifiedIncidents,
      underReviewReports,
      resolvedReports,
      activeAlerts,
      reportedLightingIssues: lightingIssues,
      isDemo,
      methodology: 'Community-reported incident resolution ratio and active severity density.',
      disclaimer: 'Based strictly on citizen submissions. Does not represent official police dispatch or municipal power grid telemetry.',
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Attach scoring function and sample dataset for unit and integration testing
router.calculateRouteRiskScore = calculateRouteRiskScore
router.SAMPLE_INCIDENTS = SAMPLE_INCIDENTS

module.exports = router
