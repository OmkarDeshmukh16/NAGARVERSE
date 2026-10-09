const { test, describe, before, after } = require('node:test')
const assert = require('node:assert/strict')
const http = require('node:http')

process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test_secret_for_safety_scoring'

const app = require('../src/index')
const safetyRouter = require('../src/routes/safety')

let server
let baseUrl

before(async () => {
  await new Promise(resolve => {
    server = http.createServer(app)
    server.listen(0, () => {
      const port = server.address().port
      baseUrl = `http://127.0.0.1:${port}`
      resolve()
    })
  })
})

after(async () => {
  if (server) {
    await new Promise(resolve => server.close(resolve))
  }
  const mongoose = require('mongoose')
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect()
  }
})

describe('NAGARVERSE Safety Indicators, Route Scoring & Data Governance', () => {

  test('Route Scoring Formula: Identical inputs produce deterministic consistent risk scores', () => {
    const input = {
      roadType: 'primary_arterial',
      corridorIncidents: [
        { severity: 'medium', verificationStatus: 'verified', createdAt: new Date().toISOString() },
      ],
      isNightTime: false,
      hasTransitHubs: true,
      hasCommercialFrontage: true,
    }

    const res1 = safetyRouter.calculateRouteRiskScore(input)
    const res2 = safetyRouter.calculateRouteRiskScore(input)

    assert.equal(res1.riskScore, res2.riskScore)
    assert.equal(res1.confidencePercentage, res2.confidencePercentage)
    assert.equal(typeof res1.riskScore, 'number')
    assert.ok(res1.scoringFormula)
  })

  test('Missing Data Handling: Zero incidents does NOT equate to zero risk, lowers confidence and tags unmonitored', () => {
    // Calling route scoring with 0 incidents (missing/unreported sector)
    const result = safetyRouter.calculateRouteRiskScore({
      roadType: 'inner_alley',
      corridorIncidents: [], // zero reports
      hasMissingLightingData: true,
    })

    // Must NOT be 0 risk
    assert.ok(result.riskScore >= 1.0, 'Risk score must be at least road baseline')
    assert.ok(result.riskScore >= 3.0, 'Inner alley must maintain higher base risk despite 0 reports')

    // Must flag low confidence and include missing data warning
    assert.equal(result.confidenceLevel, 'Low (Unmonitored Sector)')
    assert.ok(result.confidencePercentage <= 50, 'Confidence must be penalized for missing data')
    assert.ok(
      result.evidence.missingDataNotes.includes('Zero community reports recorded') ||
      result.evidence.missingDataNotes.includes('NOT guaranteed safety')
    )
  })

  test('Stale Data Handling: Older incidents decay in severity weight compared to fresh incidents', () => {
    const freshIncident = {
      severity: 'high',
      verificationStatus: 'verified',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    }

    const staleIncident = {
      severity: 'high',
      verificationStatus: 'verified',
      createdAt: new Date(Date.now() - 3600000 * 24 * 50).toISOString(), // 50 days ago
    }

    const freshScore = safetyRouter.calculateRouteRiskScore({
      roadType: 'secondary_urban',
      corridorIncidents: [freshIncident],
    })

    const staleScore = safetyRouter.calculateRouteRiskScore({
      roadType: 'secondary_urban',
      corridorIncidents: [staleIncident],
    })

    // The fresh incident must produce a strictly higher risk score than the stale incident
    assert.ok(
      freshScore.riskScore > staleScore.riskScore,
      `Fresh incident score (${freshScore.riskScore}) must be greater than stale incident score (${staleScore.riskScore})`
    )
    assert.ok(
      freshScore.evidence.incidentPenalty > staleScore.evidence.incidentPenalty,
      'Incident penalty must decay with age'
    )
  })

  test('Scoring Consistency: Higher severity and verified status strictly increase risk score', () => {
    const baseScore = safetyRouter.calculateRouteRiskScore({
      roadType: 'secondary_urban',
      corridorIncidents: [],
    })

    const unverifiedIncident = {
      severity: 'critical',
      verificationStatus: 'under_review',
      createdAt: new Date().toISOString(),
    }

    const verifiedIncident = {
      severity: 'critical',
      verificationStatus: 'verified',
      createdAt: new Date().toISOString(),
    }

    const unverifiedScore = safetyRouter.calculateRouteRiskScore({
      roadType: 'secondary_urban',
      corridorIncidents: [unverifiedIncident],
    })

    const verifiedScore = safetyRouter.calculateRouteRiskScore({
      roadType: 'secondary_urban',
      corridorIncidents: [verifiedIncident],
    })

    // Baseline < Unverified < Verified
    assert.ok(unverifiedScore.riskScore > baseScore.riskScore, 'Unverified incident should increase risk over baseline')
    assert.ok(verifiedScore.riskScore > unverifiedScore.riskScore, 'Verified incident should carry higher weight than unverified')
  })

  test('Night-time Multiplier: Lighting hazards receive higher penalty during nighttime', () => {
    const lightingIncident = {
      category: 'poor_lighting',
      severity: 'medium',
      verificationStatus: 'verified',
      createdAt: new Date().toISOString(),
    }

    const daytimeScore = safetyRouter.calculateRouteRiskScore({
      roadType: 'secondary_urban',
      corridorIncidents: [lightingIncident],
      isNightTime: false,
    })

    const nighttimeScore = safetyRouter.calculateRouteRiskScore({
      roadType: 'secondary_urban',
      corridorIncidents: [lightingIncident],
      isNightTime: true,
    })

    assert.ok(
      nighttimeScore.riskScore > daytimeScore.riskScore,
      'Nighttime lighting penalty must exceed daytime penalty'
    )
  })

  test('POST /api/safety/routes returns comparative routes with evidence and coverage disclaimers', async () => {
    const res = await fetch(`${baseUrl}/api/safety/routes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin: 'Shivajinagar', destination: 'Kothrud' }),
    })

    assert.equal(res.status, 200)
    const data = await res.json()

    assert.ok(data.success)
    assert.ok(Array.isArray(data.routes))
    assert.equal(data.routes.length, 3, 'Must return 3 comparative routes')

    const r1 = data.routes[0]
    assert.ok(r1.id)
    assert.ok(r1.name)
    assert.equal(typeof r1.riskScore, 'number')
    assert.ok(r1.evidence, 'Route must include evidence breakdown')
    assert.ok(r1.evidence.roadType)
    assert.equal(typeof r1.evidence.totalIncidents, 'number')
    assert.ok(r1.evidence.missingDataNotes)
    assert.ok(r1.scoringFormula)
    assert.ok(r1.limitations)
    assert.ok(data.meta.coverageNotice.includes('NOT guaranteed safety'))
  })

  test('GET /api/safety/stats removes fabricated emergency response averages and provides data provenance', async () => {
    const res = await fetch(`${baseUrl}/api/safety/stats`)
    assert.equal(res.status, 200)
    const data = await res.json()

    assert.ok(data.success)
    assert.equal(typeof data.cityScore, 'number')
    assert.equal(typeof data.totalReports, 'number')
    assert.equal(typeof data.verifiedIncidents, 'number')
    assert.equal(typeof data.underReviewReports, 'number')

    // Must NOT have unsupported claims like "emergencyResponseAvg: 6.4 mins"
    assert.equal(data.emergencyResponseAvg, undefined, 'Must not claim emergency response dispatch times')
    assert.ok(data.methodology, 'Must state transparent methodology')
    assert.ok(data.disclaimer, 'Must include citizen reporting disclaimer')
  })

})
