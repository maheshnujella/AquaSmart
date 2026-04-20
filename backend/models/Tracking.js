const mongoose = require('mongoose');

const trackingSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  deliveryAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  currentLocation: {
    lat: Number,
    lng: Number
  },
  history: [
    {
      lat: Number,
      lng: Number,
      timestamp: { type: Date, default: Date.now }
    }
  ],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Tracking', trackingSchema);
