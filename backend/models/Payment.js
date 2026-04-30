const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  upiApp: {
    type: String,
    enum: ['PhonePe', 'GPay', 'Paytm', 'Other'],
    required: true,
  },
  transactionId: {
    type: String,
    required: true,
    unique: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  // Payment split breakdown
  splitDetails: {
    shopkeeperAmount: { type: Number, default: 0 }, // product amount
    deliveryAmount:   { type: Number, default: 0 }, // delivery charges
    adminAmount:      { type: Number, default: 0 }, // platform fee + commission
  },
  // Recipients
  shopkeeper: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  deliveryAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['Initiated', 'Pending', 'Success', 'Failed', 'Refunded'],
    default: 'Pending',
  },
  upiRef: String, // simulated UPI reference number
  failureReason: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Payment', paymentSchema);
