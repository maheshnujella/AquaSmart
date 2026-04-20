const mongoose = require('mongoose');

const doctorRequestSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serviceType: {
    type: String,
    enum: ['Water Testing', 'Soil Testing', 'Field Visit'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  images: [String],
  location: {
    lat: Number,
    lng: Number,
    address: String
  },
  distance: { type: Number, default: 0 },
  baseCost: { type: Number, required: true },
  travelCost: { type: Number, default: 0 },
  totalCost: { type: Number, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  scheduledDate: Date,
  report: {
    content: String,
    file: String // Uploaded report file
  },
  feedback: {
    rating: {
      accuracy: { type: Number, min: 1, max: 5 },
      responseTime: { type: Number, min: 1, max: 5 },
      helpfulness: { type: Number, min: 1, max: 5 }
    },
    comment: String,
    createdAt: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('DoctorRequest', doctorRequestSchema);
