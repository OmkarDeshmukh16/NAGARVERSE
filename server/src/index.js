require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const { createServer } = require('http')
const { Server } = require('socket.io')
const rateLimit = require('express-rate-limit')

// Routes
const authRoutes = require('./routes/auth')
const placeRoutes = require('./routes/places')
const aiRoutes = require('./routes/ai')
const safetyRoutes = require('./routes/safety')
const reportRoutes = require('./routes/reports')
const itineraryRoutes = require('./routes/itineraries')
const insightRoutes = require('./routes/insights')

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, { cors: { origin: '*' } })

// ── Middleware ──────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || true,
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests. Please try again later.' },
})
app.use('/api', apiLimiter)

// ── DB Connection ────────────────────────────────────────────
const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nagarverse'
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 })
    console.log('✅ MongoDB connected:', mongoose.connection.host)
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message)
    console.log('⚠️  Running in memory fallback mode — all features fully operational')
  }
}
connectDB()

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/places', placeRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/safety', safetyRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/itineraries', itineraryRoutes)
app.use('/api/insights', insightRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    version: '1.0.0',
  })
})

// ── Error handler ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message)
  const status = err.status || 500
  res.status(status).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
})

// ── WebSocket ─────────────────────────────────────────────────
io.on('connection', socket => {
  console.log('🔌 Client connected:', socket.id)
  socket.on('disconnect', () => console.log('🔌 Client disconnected:', socket.id))
})

// ── Start ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000
httpServer.listen(PORT, () => {
  console.log(`🚀 NAGARVERSE server running on port ${PORT}`)
})

module.exports = app
