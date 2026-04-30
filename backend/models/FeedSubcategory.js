const mongoose = require('mongoose');

const feedSubcategorySchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FeedCompany',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Subcategory name is required'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('FeedSubcategory', feedSubcategorySchema);
