const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  action: {
    type: String,
    required: true
  },
  details: mongoose.Schema.Types.Mixed,
  ip: String,
  userAgent: String
}, { timestamps: true });

module.exports = mongoose.model('Log', logSchema);
