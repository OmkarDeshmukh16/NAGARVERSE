const mongoose = require('mongoose')

const incidentSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['road_hazard', 'poor_lighting', 'flooding', 'traffic', 'harassment', 'crime', 'other'],
    required: true,
  },
  description: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: [Number], // [lng, lat]
  },
  locationName: String,
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  verificationStatus: {
    type: String,
    enum: ['submitted', 'under_review', 'verified', 'rejected', 'resolved'],
    default: 'submitted',
  },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isAnonymous: { type: Boolean, default: false },
  photos: [String],
  audioUrl: String,
  aiSummary: String,
  city: { type: String, default: 'Pune' },
}, { timestamps: true })

incidentSchema.index({ location: '2dsphere' })

module.exports = mongoose.model('Incident', incidentSchema)
