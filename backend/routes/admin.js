const express = require('express');
const router = express.Router();

// FIX: Require Log at the TOP — it was being used at L119 but only required at L136
const Log  = require('../models/Log');
const User = require('../models/User');
const Product = require('../models/Product');
const Order   = require('../models/Order');
const Booking = require('../models/Booking');
const Listing = require('../models/Listing');
const { protect, authorize } = require('../middleware/auth');

// Apply auth + role to all admin routes
router.use(protect);
router.use(authorize('Admin'));

// @desc    Get all users
// @route   GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('[ADMIN] GET /users error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'Admin') return res.status(403).json({ success: false, message: 'Cannot delete an Admin account' });

    await user.deleteOne();
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('[ADMIN] DELETE /users/:id error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get all orders
// @route   GET /api/admin/orders
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name');
    res.json(orders);
  } catch (error) {
    console.error('[ADMIN] GET /orders error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get all bookings
// @route   GET /api/admin/bookings
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate('user', 'id name')
      .populate('provider', 'id name');
    res.json(bookings);
  } catch (error) {
    console.error('[ADMIN] GET /bookings error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Approve a listing
// @route   PUT /api/admin/listings/:id/approve
router.put('/listings/:id/approve', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });

    listing.status = 'Active';
    const updatedListing = await listing.save();
    res.json(updatedListing);
  } catch (error) {
    console.error('[ADMIN] PUT /listings/:id/approve error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Assign provider to a booking
// @route   PUT /api/admin/bookings/:id/assign
router.put('/bookings/:id/assign', async (req, res) => {
  try {
    const { providerId } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    booking.provider = providerId;
    booking.status = 'Confirmed';
    const updatedBooking = await booking.save();
    res.json(updatedBooking);
  } catch (error) {
    console.error('[ADMIN] PUT /bookings/:id/assign error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get all pending doctor approvals
// @route   GET /api/admin/doctors/pending
router.get('/doctors/pending', async (req, res) => {
  try {
    const doctors = await User.find({ role: 'Doctor', 'doctorProfile.isVerified': false }).select('-password');
    res.json(doctors);
  } catch (error) {
    console.error('[ADMIN] GET /doctors/pending error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Verify/Approve a doctor
// @route   PUT /api/admin/doctors/:id/verify
router.put('/doctors/:id/verify', async (req, res) => {
  try {
    const doctor = await User.findById(req.params.id);
    if (!doctor || doctor.role !== 'Doctor') {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // FIX: Log was used here before being required — now Log is required at top
    doctor.doctorProfile = doctor.doctorProfile || {};
    doctor.doctorProfile.isVerified = true;
    await doctor.save();

    await Log.create({
      user: req.user._id,
      action: 'DOCTOR_APPROVE',
      details: `Approved doctor: ${doctor.name}`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    }).catch((e) => console.error('Log error:', e.message));

    res.json({ success: true, message: 'Doctor approved successfully', doctor });
  } catch (error) {
    console.error('[ADMIN] PUT /doctors/:id/verify error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get all audit logs
// @route   GET /api/admin/logs
router.get('/logs', async (req, res) => {
  try {
    const logs = await Log.find({})
      .populate('user', 'name role email')
      .sort({ createdAt: -1 })
      .limit(500);
    res.json(logs);
  } catch (error) {
    console.error('[ADMIN] GET /logs error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
