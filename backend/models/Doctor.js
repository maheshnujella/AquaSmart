const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  specialty: {
    type: String,
    required: true,
    enum: ['Fish Consultation', 'Prawns Consultation', 'General Aqua Vet']
  },
  experience: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  about: {
    type: String,
    required: true
  },
  available: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);
