const { test, describe, before, after } = require('node:test')
const assert = require('node:assert/strict')
const http = require('node:http')

process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test_secret_for_navi_assistant_tests'
// Intentionally leave GEMINI_API_KEY empty to test demo/degraded mode
delete process.env.GEMINI_API_KEY

const app = require('../src/index')
const aiRouter = require('../src/routes/ai')

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

describe('Navi AI Assistant: Grounding, Guardrails & Degradation', () => {

  test('POST /api/ai/chat returns grounded recommendations with destination IDs and coordinates in demo mode', async () => {
    const res = await fetch(`${baseUrl}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Recommend top heritage spots and food places in Pune' }),
    })

    assert.equal(res.status, 200)
    const data = await res.json()

    // Explicit demo and degraded flags
    assert.equal(data.isDemo, true)
    assert.equal(data.degradedMode, true)
    assert.ok(data.reply.includes('[Demo Mode / Local Service Grounding Active]'))

    // Structured places
    assert.ok(Array.isArray(data.places))
    assert.ok(data.places.length > 0)
    const place = data.places[0]
    assert.ok(place._id, 'Place must have a destination ID')
    assert.ok(place.name, 'Place must have a name')
    assert.ok(place.location?.coordinates, 'Place must have coordinates')
    assert.equal(place.location.coordinates.length, 2)
    assert.ok(place.sourceMetadata, 'Place must have sourceMetadata')
    assert.ok(place.sourceMetadata.name)

    // Map action
    assert.ok(data.mapAction, 'Must supply primary map action')
    assert.equal(typeof data.mapAction.lat, 'number')
    assert.equal(typeof data.mapAction.lng, 'number')
    assert.ok(data.mapAction.label)

    // Grounding verification
    assert.ok(data.grounding)
    assert.ok(typeof data.grounding.placesRetrieved === 'number')
    assert.ok(data.grounding.weatherSource)
  })

  test('POST /api/ai/chat retrieves live weather and citizen reports context', async () => {
    const res = await fetch(`${baseUrl}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'What is the weather and are there any active road hazards or reports?' }),
    })

    assert.equal(res.status, 200)
    const data = await res.json()
    assert.ok(data.reply)
    // Check that weather or safety was handled
    assert.ok(
      data.reply.toLowerCase().includes('weather') ||
      data.reply.toLowerCase().includes('safety') ||
      data.reply.toLowerCase().includes('reports')
    )
    assert.ok(data.grounding.weatherSource)
  })

  test('POST /api/ai/itinerary returns structured itinerary with place IDs, coordinates, and notes', async () => {
    const res = await fetch(`${baseUrl}/api/ai/itinerary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startLocation: 'Deccan Gymkhana',
        duration: 4,
        budget: 'moderate',
        interests: ['heritage', 'food'],
        travelMode: 'auto',
      }),
    })

    assert.equal(res.status, 200)
    const data = await res.json()
    assert.ok(data.itinerary)
    assert.ok(data.itinerary.title)
    assert.ok(Array.isArray(data.itinerary.stops))
    assert.ok(data.itinerary.stops.length > 0)

    const stop = data.itinerary.stops[0]
    assert.ok(stop.placeId, 'Stop must have destination ID')
    assert.ok(stop.name, 'Stop must have place name')
    assert.ok(stop.location?.coordinates, 'Stop must have valid coordinates')
    assert.ok(stop.time, 'Stop must have scheduled time')
    assert.ok(stop.duration, 'Stop must have duration')
    assert.ok(stop.sourceMetadata, 'Stop must include source metadata')
  })

  test('Output Validator: sanitizes unsafe safety claims and enforces cautionary note', () => {
    const rawAiOutput = 'The area around Deccan is completely safe and 100% safe with zero crime.'
    const result = aiRouter.validateAndSanitizeOutput({
      text: rawAiOutput,
      retrievedPlaces: [],
      weather: { source: 'Open-Meteo' },
      incidents: [{ locationName: 'Karve Road' }],
    })

    // Absolute claims must be sanitized
    assert.ok(!result.reply.includes('100% safe'), 'Must not contain 100% safe')
    assert.ok(!result.reply.includes('completely safe'), 'Must not contain completely safe')
    assert.ok(result.reply.includes('lower reported risk'), 'Must use cautious risk phrasing')
    assert.ok(result.reply.includes('Safety Note: Safety assessments are based on community reports'))
  })

  test('Output Validator: rejects unsupported locations not present in retrieved dataset', () => {
    const retrieved = [
      { _id: 'demo1', name: 'Shabree Restaurant', category: 'food', location: { coordinates: [73.84, 18.52] } },
      { _id: 'demo3', name: 'Shaniwar Wada', category: 'heritage', location: { coordinates: [73.85, 18.51] } },
    ]

    // AI hallucinates a non-existent place "Atlantis Sky Garden" and mentions real "Shabree Restaurant"
    const aiText = 'I recommend **Shabree Restaurant** for thali, and also visit **Atlantis Sky Garden** on Mars.'
    const result = aiRouter.validateAndSanitizeOutput({
      text: aiText,
      retrievedPlaces: retrieved,
      weather: null,
      incidents: [],
    })

    // Structured places should ONLY contain Shabree Restaurant; Atlantis Sky Garden must be rejected
    assert.equal(result.places.length, 1)
    assert.equal(result.places[0]._id, 'demo1')
    assert.equal(result.places[0].name, 'Shabree Restaurant')
    assert.ok(!result.places.some(p => p.name.includes('Atlantis')))
  })

  test('Degradation Resilience: getGroundedContext handles external network or service failures without crashing', async () => {
    // Calling getGroundedContext with arbitrary query should return gracefully even if OSM or Open-Meteo fails
    const ctx = await aiRouter.getGroundedContext({ query: 'non-existent-random-query-xyz', category: null })
    assert.ok(ctx)
    assert.ok(Array.isArray(ctx.places))
    assert.ok(ctx.places.length > 0, 'Must fall back to curated places')
    assert.ok(ctx.weather, 'Must provide fallback weather')
    assert.ok(ctx.weather.temperature)
    assert.ok(Array.isArray(ctx.incidents))
    assert.ok(ctx.incidents.length > 0, 'Must fall back to community reports')
    assert.equal(typeof ctx.degradedMode, 'boolean')
  })

})
