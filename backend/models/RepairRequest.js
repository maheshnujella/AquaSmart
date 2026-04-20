const mongoose = require('mongoose');

const repairRequestSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  category: {
    type: String,
    enum: ['Generator', 'Fan sets', 'Electrical', 'Other'],
    required: true
  },
  issueTitle: String,
  description: {
    type: String,
    required: true
  },
  images: [String],
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: String
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  distance: { type: Number, default: 0 },
  estimatedCost: Number,
  finalCost: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('RepairRequest', repairRequestSchema);
