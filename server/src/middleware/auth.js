const jwt = require('jsonwebtoken')

module.exports = function auth(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'nagarverse_secret_key_change_in_prod')
    req.user = decoded
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token.' })
  }
}
