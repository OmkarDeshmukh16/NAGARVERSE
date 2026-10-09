const express = require('express')
const axios = require('axios')
const router = express.Router()

// GET /api/insights/overview
router.get('/overview', (req, res) => {
  const currentHour = new Date().getHours()
  const activityByHour = Array.from({ length: 12 }, (_, i) => {
    const hour = (i * 2) % 24
    const isPeak = (hour >= 8 && hour <= 11) || (hour >= 17 && hour <= 21)
    return {
      time: `${hour.toString().padStart(2, '0')}:00`,
      reports: isPeak ? Math.floor(Math.random() * 20) + 25 : Math.floor(Math.random() * 10) + 5,
      searches: isPeak ? Math.floor(Math.random() * 80) + 120 : Math.floor(Math.random() * 40) + 30,
    }
  })

  res.json({
    success: true,
    activeReports: 142,
    dailySearches: 3842,
    activeUsers: 1204,
    routesGenerated: 567,
    activityByHour,
    categoryBreakdown: [
      { category: 'Food & Cafes', count: 340 },
      { category: 'Heritage', count: 180 },
      { category: 'Hotels', count: 120 },
      { category: 'Parks & Nature', count: 85 },
      { category: 'Shopping', count: 210 },
      { category: 'Transit Hubs', count: 95 },
    ],
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
      ? 'Peak commute volume observed near Swargate, Nal Stop, and Hinjewadi flyover.'
      : 'Normal steady flow on arterial Pune roads and University circle.',
    isDemo: true,
  })
})

module.exports = router
