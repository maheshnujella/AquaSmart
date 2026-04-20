const mongoose = require('mongoose');

const marketPriceSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['Fish', 'Prawn'],
    required: true
  },
  type: {
    type: String, // e.g., Vannamei, Rohu, Catla
    required: true
  },
  count: {
    type: Number, // for prawns: 10, 20, 30, 40 etc.
    default: 0
  },
  price: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  source: {
    type: String,
    enum: ['API', 'Admin', 'Aggregated'],
    default: 'Admin'
  }
});

module.exports = mongoose.model('MarketPrice', marketPriceSchema);
