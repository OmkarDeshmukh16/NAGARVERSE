const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  avatar: { type: String },
  preferences: {
    interests: [String],
    travelMode: { type: String, default: 'walking' },
    budgetRange: { type: String, default: 'moderate' },
    accessibility: { type: Boolean, default: false },
  },
  savedPlaces: [{ type: String }],
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)
