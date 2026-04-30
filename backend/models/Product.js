const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  name: {
    type: String,
    required: [true, 'Please add a product name']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: ['Feed', 'Medicine', 'Mineral']
  },
  subCategory: {
    type: String, // e.g., 'Fish Feed', 'Shrimp Feed', 'Fish Medicine', 'Water Treatment'
  },
  // Feed hierarchy
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FeedCompany',
  },
  feedSubcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FeedSubcategory',
  },
  companyName: {
    type: String, // denormalized for quick display
  },
  feedSubcategoryName: {
    type: String, // denormalized for quick display
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price']
  },
  stock: {
    type: Number,
    required: [true, 'Please add stock count'],
    default: 0
  },
  image: {
    type: String,
    default: 'no-photo.jpg'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', productSchema);
