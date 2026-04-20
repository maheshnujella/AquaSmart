const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User' // The farmer booking the service
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // The Doctor or Technician assigned
  },
  serviceType: {
    type: String,
    required: true,
    enum: ['Consultation', 'Repair']
  },
  details: {
    type: String,
    required: true // Issue description
  },
  bookingDate: {
    type: Date,
    required: true
  },
  timeSlot: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  notes: {
    type: String // Notes from doctor/technician
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Booking', bookingSchema);
