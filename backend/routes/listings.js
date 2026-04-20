const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');
const { protect } = require('../middleware/auth');

// @desc    Get all active listings
// @route   GET /api/listings
// @access  Public
router.get('/', async (req, res) => {
  try {
    const listings = await Listing.find({ status: 'Active' }).populate('seller', 'name email');
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create a listing
// @route   POST /api/listings
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { title, cropType, quantity, pricePerUnit, location, description } = req.body;

    const listing = new Listing({
      seller: req.user._id,
      title,
      cropType,
      quantity,
      pricePerUnit,
      location,
      description
    });

    const createdListing = await listing.save();
    res.status(201).json(createdListing);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Get user's listings
// @route   GET /api/listings/mylistings
// @access  Private
router.get('/mylistings', protect, async (req, res) => {
  try {
    const listings = await Listing.find({ seller: req.user._id });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
