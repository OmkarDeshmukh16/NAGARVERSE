const express = require('express')
const axios = require('axios')
const router = express.Router()

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`

// LLM provider abstraction
async function callLLM(prompt) {
  if (!GEMINI_API_KEY) {
    return null // trigger demo mode
  }
  try {
    const res = await axios.post(GEMINI_URL, {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 1500 },
    }, { timeout: 20000 })
    return res.data?.candidates?.[0]?.content?.parts?.[0]?.text || null
  } catch (err) {
    console.error('LLM error:', err.message)
    return null
  }
}

// Rule-based demo fallback
function demoResponse(message) {
  const lower = message.toLowerCase()
  if (lower.includes('food') || lower.includes('eat') || lower.includes('restaurant')) {
    return {
      reply: '🍽️ **Top food spots in Pune:**\n\n1. **Shabree Restaurant** (FC Road) — Best Maharashtrian thali, ₹200–500\n2. **Vaishali** (FC Road) — Iconic South Indian breakfast\n3. **Kayani Bakery** — Legendary Shrewsbury biscuits\n4. **Vada Pav Corner** (near Shaniwar Wada) — Authentic street food\n\n*Note: This is demo mode. Configure a Gemini API key for AI-powered recommendations.*',
      isDemo: true,
    }
  }
  if (lower.includes('heritage') || lower.includes('history') || lower.includes('landmark')) {
    return {
      reply: '🏛️ **Heritage gems of Pune:**\n\n1. **Shaniwar Wada** — 18th-century Peshwa fort palace\n2. **Aga Khan Palace** — Gandhi memorial & independence history\n3. **Sinhagad Fort** — 1312m hill fort, famous Battle of Sinhagad\n4. **Raja Dinkar Kelkar Museum** — 20,000+ artifacts\n\n*Note: AI demo mode active. Set GEMINI_API_KEY for full intelligence.*',
      isDemo: true,
    }
  }
  if (lower.includes('safe') || lower.includes('route') || lower.includes('area')) {
    return {
      reply: '🛡️ **Safety tips for Pune:**\n\nGenerally considered safer areas: Koregaon Park, Aundh, Baner, Viman Nagar\n\n⚠️ Safety labels are based on community reports — not an absolute guarantee. Always exercise caution.\n\n*Demo mode: Set GEMINI_API_KEY for real-time safety analysis.*',
      isDemo: true,
    }
  }
  if (lower.includes('weather')) {
    return {
      reply: '🌤️ Pune typically enjoys a pleasant climate. October–March is ideal for visiting. Current weather data requires an Open-Meteo API key.\n\n*Demo mode active.*',
      isDemo: true,
    }
  }
  return {
    reply: `I'm Navi, your AI city guide for Pune! 🌆\n\nIn demo mode, I can help with:\n• **Food & Restaurants** — Try asking about food near Shaniwar Wada\n• **Heritage places** — Ask about historical landmarks\n• **Safety tips** — Ask about safer areas\n• **Hotels** — Ask about accommodation options\n\nFor full AI capabilities, configure a **Gemini API key** in the server *.env* file.`,
    isDemo: true,
  }
}

// POST /api/ai/chat
router.post('/chat', async (req, res, next) => {
  try {
    const { message, history = [] } = req.body
    if (!message) return res.status(400).json({ error: 'Message required' })

    const contextPrompt = `You are Navi, an AI city guide for Pune, Maharashtra, India. You help users discover places, plan trips, understand safety, and navigate the city.

IMPORTANT RULES:
- Ground recommendations in real facts about Pune's actual places and neighborhoods
- Do NOT invent specific prices, ratings, or review counts
- If data is uncertain, say "approximately" or "based on general knowledge"
- Distinguish clearly between verified facts and general estimates
- For safety, use "lower reported risk" not "safe"
- Keep responses concise but helpful (max 200 words)
- Use markdown formatting with **bold** for place names

Previous conversation:
${history.map(m => `${m.role === 'user' ? 'User' : 'Navi'}: ${m.content}`).join('\n')}

User: ${message}
Navi:`

    const llmResponse = await callLLM(contextPrompt)

    if (!llmResponse) {
      const demo = demoResponse(message)
      return res.json({ reply: demo.reply, isDemo: true, demoMode: true })
    }

    res.json({ reply: llmResponse, isDemo: false })
  } catch (err) {
    next(err)
  }
})

// POST /api/ai/itinerary
router.post('/itinerary', async (req, res, next) => {
  try {
    const { startLocation, duration, budget, interests, travelMode, groupType, accessibilityNeeds, safetyPreference } = req.body

    const prompt = `Create a practical ${duration}-hour Pune city itinerary for ${groupType} traveler(s).

Details:
- Start: ${startLocation}
- Budget: ${budget}  
- Interests: ${interests?.join(', ')}
- Travel mode: ${travelMode}
- Accessibility needs: ${accessibilityNeeds ? 'Yes' : 'No'}
- Safety preference: ${safetyPreference}

Return ONLY valid JSON (no markdown) in this exact format:
{
  "title": "Your trip title",
  "summary": "Brief overview",
  "stops": [
    {
      "name": "Place name",
      "description": "Brief description",
      "time": "10:00 AM",
      "duration": "1.5 hours",
      "estimatedCost": "₹100",
      "travelTime": "15 min by auto"
    }
  ],
  "notes": "Important tips or caveats"
}`

    const llmResponse = await callLLM(prompt)

    if (!llmResponse) {
      // Demo itinerary
      return res.json({
        itinerary: {
          title: `${duration}-Hour ${interests?.[0] || 'Heritage'} Tour of Pune`,
          summary: `A curated ${duration}-hour ${budget} tour starting from ${startLocation}`,
          stops: [
            { name: 'Shaniwar Wada', description: 'Start at the iconic 18th-century Peshwa fort', time: '9:00 AM', duration: '1.5 hours', estimatedCost: '₹5', travelTime: '20 min by auto' },
            { name: 'Dagdusheth Halwai Temple', description: 'Beautiful temple just 500m away', time: '10:45 AM', duration: '30 min', estimatedCost: 'Free', travelTime: '5 min walk' },
            { name: 'Vaishali Restaurant', description: 'Iconic breakfast spot for South Indian food', time: '11:30 AM', duration: '1 hour', estimatedCost: '₹150', travelTime: '15 min by auto' },
            { name: 'Aga Khan Palace', description: 'Historic palace and Gandhi memorial', time: '1:00 PM', duration: '2 hours', estimatedCost: '₹25', travelTime: '30 min by auto' },
          ],
          notes: 'Demo itinerary — configure Gemini API for personalized AI-generated plans. Estimates are approximate.',
          isDemo: true,
        },
      })
    }

    try {
      const clean = llmResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const itinerary = JSON.parse(clean)
      res.json({ itinerary })
    } catch {
      res.json({ itinerary: { title: 'Pune Day Plan', summary: llmResponse, stops: [], notes: 'Parsed from AI response' } })
    }
  } catch (err) {
    next(err)
  }
})

// POST /api/ai/compare
router.post('/compare', async (req, res, next) => {
  try {
    const { locations, weights } = req.body
    if (!locations || locations.length < 2) return res.status(400).json({ error: 'Need at least 2 locations' })

    const prompt = `Compare these Pune neighborhoods on a scale of 0-10 for each metric. Base scores on publicly available knowledge about Pune.

Neighborhoods: ${locations.join(', ')}
Metrics: safety (lower reported risk), affordability, accessibility, publicTransport, greenSpaces, cleanliness, nightLife

Return ONLY valid JSON (no markdown):
{
  "results": [
    {
      "location": "neighborhood name",
      "scores": {
        "safety": 7,
        "affordability": 6,
        "accessibility": 8,
        "publicTransport": 7,
        "greenSpaces": 5,
        "cleanliness": 7,
        "nightLife": 8
      },
      "summary": "One sentence characterization"
    }
  ],
  "notes": "Transparency note about data sources"
}`

    const llmResponse = await callLLM(prompt)

    if (!llmResponse) {
      // Demo comparison
      const demoScores = (loc) => ({
        safety: Math.floor(Math.random() * 4) + 5,
        affordability: Math.floor(Math.random() * 5) + 4,
        accessibility: Math.floor(Math.random() * 3) + 6,
        publicTransport: Math.floor(Math.random() * 4) + 5,
        greenSpaces: Math.floor(Math.random() * 5) + 3,
        cleanliness: Math.floor(Math.random() * 3) + 5,
        nightLife: Math.floor(Math.random() * 5) + 4,
      })
      return res.json({
        comparison: {
          results: locations.map(loc => ({
            location: loc,
            scores: demoScores(loc),
            summary: `${loc} — Scores are illustrative demo data.`,
          })),
          notes: 'Demo data — configure Gemini API for real AI-based comparison.',
          isDemo: true,
        },
      })
    }

    try {
      const clean = llmResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const comparison = JSON.parse(clean)
      res.json({ comparison })
    } catch {
      res.status(500).json({ error: 'Could not parse comparison results' })
    }
  } catch (err) {
    next(err)
  }
})

// POST /api/ai/summarize-report
router.post('/summarize-report', async (req, res, next) => {
  try {
    const { description, category } = req.body
    const prompt = `Summarize this citizen incident report in 1-2 sentences and suggest the best category.
Report: "${description}"
Current category: ${category}
Return JSON: {"summary": "...", "suggestedCategory": "road_hazard|poor_lighting|flooding|traffic|harassment|crime|other"}`

    const response = await callLLM(prompt)
    if (!response) return res.json({ summary: description.slice(0, 100), suggestedCategory: category })

    try {
      const clean = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      res.json(JSON.parse(clean))
    } catch {
      res.json({ summary: description.slice(0, 100), suggestedCategory: category })
    }
  } catch (err) {
    next(err)
  }
})

module.exports = router
