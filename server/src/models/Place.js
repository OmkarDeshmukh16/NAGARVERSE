const mongoose = require('mongoose')

const placeSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  category: {
    type: String,
    enum: ['food', 'cafe', 'hotel', 'heritage', 'park', 'shopping', 'hospital', 'transit', 'other'],
    required: true,
    index: true,
  },
  description: String,
  address: String,
  city: { type: String, default: 'Pune' },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' }, // [lng, lat]
  },
  rating: { type: Number, min: 0, max: 5 },
  priceRange: String,
  openHours: String,
  phone: String,
  website: String,
  tags: [String],
  images: [String],
  isDemo: { type: Boolean, default: false },
  osmId: String,
  sourceMetadata: {
    name: { type: String, default: 'OpenStreetMap' },
    fetchedAt: Date,
    reliability: String,
  },
  accessibilityInfo: String,
  heritageInfo: String,
}, { timestamps: true })

placeSchema.index({ location: '2dsphere' })
placeSchema.index({ name: 'text', description: 'text', tags: 'text' })

module.exports = mongoose.model('Place', placeSchema)
