const express = require('express')
const axios = require('axios')
const Incident = require('../models/Incident')
const router = express.Router()

// GET /api/insights/overview
router.get('/overview', async (req, res) => {
  const currentHour = new Date().getHours()
  const isPeak = (currentHour >= 8 && currentHour <= 11) || (currentHour >= 17 && currentHour <= 21)

  let activeReports = 6
  let isDatabaseConnected = false

  const mongoose = require('mongoose')
  if (mongoose.connection.readyState === 1) {
    try {
      const count = await Incident.countDocuments({ verificationStatus: { $ne: 'resolved' } })
      activeReports = count
      isDatabaseConnected = true
    } catch {
      // Fallback to sample count
    }
  }

  const activityByHour = Array.from({ length: 12 }, (_, i) => {
    const hour = (i * 2) % 24
    const peak = (hour >= 8 && hour <= 11) || (hour >= 17 && hour <= 21)
    return {
      time: `${hour.toString().padStart(2, '0')}:00`,
      reports: peak ? Math.floor(Math.random() * 8) + 12 : Math.floor(Math.random() * 4) + 2,
      searches: peak ? Math.floor(Math.random() * 80) + 120 : Math.floor(Math.random() * 40) + 30,
    }
  })

  res.json({
    success: true,
    activeReports,
    dailySearches: 1840,
    activeUsers: 640,
    routesGenerated: 215,
    activityByHour,
    categoryBreakdown: [
      { category: 'Food & Cafes', count: 340 },
      { category: 'Heritage', count: 180 },
      { category: 'Hotels', count: 120 },
      { category: 'Parks & Nature', count: 85 },
      { category: 'Shopping', count: 210 },
      { category: 'Transit Hubs', count: 95 },
    ],
    isDemo: true,
    source: isDatabaseConnected
      ? 'Live database incident counts combined with illustrative urban search activity'
      : 'Sample community incident records and illustrative urban search activity',
    disclaimer: 'Search volume and route counts are illustrative demo indicators. Incident counts reflect actual community reports in the system.',
  })
})

// GET /api/insights/weather
router.get('/weather', async (req, res) => {
  try {
    // Open-Meteo free API for Pune coordinates (lat: 18.5204, lon: 73.8567)
    const response = await axios.get(
      'https://api.open-meteo.com/v1/forecast?latitude=18.5204&longitude=73.8567&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m',
      { timeout: 3500 }
    )

    const curr = response.data.current
    let condition = 'Clear'
    const code = curr.weather_code
    if (code >= 1 && code <= 3) condition = 'Cloudy'
    else if (code >= 51 && code <= 67) condition = 'Rain'
    else if (code >= 80) condition = 'Rain'

    res.json({
      temperature: Math.round(curr.temperature_2m),
      condition,
      humidity: curr.relative_humidity_2m,
      windSpeed: Math.round(curr.wind_speed_10m),
      feelsLike: Math.round(curr.apparent_temperature),
      isDemo: false,
      source: 'Open-Meteo Public Forecast API',
    })
  } catch {
    // Graceful Pune climate fallback
    res.json({
      temperature: 28,
      condition: 'Partly Cloudy',
      humidity: 48,
      windSpeed: 12,
      feelsLike: 29,
      isDemo: true,
      source: 'Pune Seasonal Climate Estimate (Demo Fallback)',
    })
  }
})

// GET /api/insights/traffic
router.get('/traffic', (req, res) => {
  const currentHour = new Date().getHours()
  const isPeak = (currentHour >= 8 && currentHour <= 11) || (currentHour >= 17 && currentHour <= 21)
  const congestionLevel = isPeak ? 2 : 1

  res.json({
    congestionLevel,
    description: isPeak
      ? 'Peak commute pattern typically observed near Swargate, Nal Stop, and Hinjewadi flyover corridors.'
      : 'Off-peak steady vehicular pattern along major Pune arterial routes.',
    isDemo: true,
    source: 'Time-of-day heuristic pattern (Illustrative Model)',
    methodology: 'Historical typical commute windows for Pune junctions. Does NOT represent live GPS fleet telemetry or municipal traffic camera feeds.',
    lastCalculated: new Date().toISOString(),
  })
})

module.exports = router
