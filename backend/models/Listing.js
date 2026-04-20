const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User' // Farmer selling the crop
  },
  title: {
    type: String,
    required: [true, 'Please add a listing title']
  },
  cropType: {
    type: String,
    required: [true, 'Please specify crop type (Fish, Shrimp, etc.)']
  },
  quantity: {
    type: Number,
    required: [true, 'Please add available quantity in kg/tons']
  },
  pricePerUnit: {
    type: Number,
    required: [true, 'Please add expected price per unit']
  },
  location: {
    type: String,
    required: [true, 'Please add farm location']
  },
  description: {
    type: String
  },
  images: [
    { type: String }
  ],
  status: {
    type: String,
    enum: ['Pending Approval', 'Active', 'Sold', 'Inactive'],
    default: 'Pending Approval' // Admin must approve
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Listing', listingSchema);
