const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { protect, authorize } = require('../middleware/auth');

// @desc    Create a booking
// @route   POST /api/bookings
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { serviceType, details, bookingDate, timeSlot } = req.body;

    const booking = new Booking({
      user: req.user._id,
      serviceType,
      details,
      bookingDate,
      timeSlot
    });

    const createdBooking = await booking.save();
    res.status(201).json(createdBooking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Get user bookings
// @route   GET /api/bookings/mybookings
// @access  Private
router.get('/mybookings', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get provider bookings
// @route   GET /api/bookings/provider
// @access  Private/Service Provider
router.get('/provider', protect, authorize('Service Provider'), async (req, res) => {
  try {
    const bookings = await Booking.find({ provider: req.user._id });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
