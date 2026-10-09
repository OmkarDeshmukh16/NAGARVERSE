const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const auth = require('../middleware/auth')

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'nagarverse_secret_key_change_in_prod'

function signToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' })
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' })

    const existing = await User.findOne({ email })
    if (existing) return res.status(409).json({ message: 'Email already registered' })

    const hashed = await bcrypt.hash(password, 12)
    const user = await User.create({ name, email, password: hashed })
    const token = signToken(user)

    res.status(201).json({
      token,
      user: { _id: user._id, name: user.name, email: user.email },
    })
  } catch (err) {
    next(err)
  }
})

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' })

    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ message: 'Invalid credentials' })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' })

    const token = signToken(user)
    res.json({ token, user: { _id: user._id, name: user.name, email: user.email } })
  } catch (err) {
    next(err)
  }
})

// GET /api/auth/me
router.get('/me', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ user })
  } catch (err) {
    next(err)
  }
})

module.exports = router
