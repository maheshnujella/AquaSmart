const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Shopkeeper
  },
  deliveryAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  orderType: {
    type: String,
    required: true,
    enum: ['Product', 'Diesel', 'Marketplace']
  },
  orderItems: [
    {
      name: { type: String, required: true },
      qty: { type: Number, required: true },
      image: { type: String },
      price: { type: Number, required: true },
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }
    }
  ],
  shippingAddress: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String },
    country: { type: String },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'Online'],
    required: true,
    default: 'COD'
  },
  upiApp: {
    type: String,
    enum: ['PhonePe', 'GPay', 'Paytm', 'Other'],
  },
  pricing: {
    mrpTotal:       { type: Number, default: 0 },
    discount:       { type: Number, default: 0 },
    handlingFee:    { type: Number, default: 0 },
    platformFee:    { type: Number, default: 0 },
    deliveryCharges:{ type: Number, default: 0 },
    gst:            { type: Number, default: 0 },
    totalAmount:    { type: Number, required: true }
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false
  },
  paidAt: Date,
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Accepted', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled', 'Refunded'],
    default: 'Pending'
  },
  otpVerification: {
    otp: String, // Hashed
    expiresAt: Date,
    attempts: { type: Number, default: 0 },
    verified: { type: Boolean, default: false }
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'In Escrow', 'Refunded', 'Failed'],
    default: 'Pending'
  },
  transactionId: String,
  refundDetails: {
    refundId: String,
    amount: Number,
    reason: String,
    status: { type: String, enum: ['Requested', 'Processed', 'Rejected'] }
  },
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    createdAt: { type: Date, default: Date.now }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);
