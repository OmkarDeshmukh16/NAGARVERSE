const mongoose = require('mongoose')

const itinerarySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  summary: String,
  city: { type: String, default: 'Pune' },
  stops: [{
    name: String,
    description: String,
    time: String,
    duration: String,
    estimatedCost: String,
    travelTime: String,
    placeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Place' },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: [Number],
    },
  }],
  form: mongoose.Schema.Types.Mixed,
  notes: String,
  isPublic: { type: Boolean, default: false },
}, { timestamps: true })

module.exports = mongoose.model('Itinerary', itinerarySchema)
