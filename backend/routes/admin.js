const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Booking = require('../models/Booking');
const Listing = require('../models/Listing');
const { protect, authorize } = require('../middleware/auth');

// Apply middleware to all admin routes
router.use(protect);
router.use(authorize('Admin'));

// @desc    Get all users
// @route   GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete a user (Admin only, cannot delete self or other Admins)
// @route   DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'Admin') return res.status(403).json({ message: 'Cannot delete an Admin account' });
    await user.deleteOne();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get all orders
// @route   GET /api/admin/orders
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get all bookings
// @route   GET /api/admin/bookings
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find({}).populate('user', 'id name').populate('provider', 'id name');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Approve a listing
// @route   PUT /api/admin/listings/:id/approve
router.put('/listings/:id/approve', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (listing) {
      listing.status = 'Active';
      const updatedListing = await listing.save();
      res.json(updatedListing);
    } else {
      res.status(404).json({ message: 'Listing not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Assign a provider to a booking
// @route   PUT /api/admin/bookings/:id/assign
router.put('/bookings/:id/assign', async (req, res) => {
    try {
      const { providerId } = req.body;
      const booking = await Booking.findById(req.params.id);
      
      if (booking) {
        booking.provider = providerId;
        booking.status = 'Confirmed';
        const updatedBooking = await booking.save();
        res.json(updatedBooking);
      } else {
        res.status(404).json({ message: 'Booking not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

// @desc    Get all pending doctor approvals
// @route   GET /api/admin/doctors/pending
router.get('/doctors/pending', async (req, res) => {
  try {
    const doctors = await User.find({ role: 'Doctor', isVerified: false });
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Verify/Approve a doctor
// @route   PUT /api/admin/doctors/:id/verify
router.put('/doctors/:id/verify', async (req, res) => {
  try {
    const doctor = await User.findById(req.params.id);
    if (doctor && doctor.role === 'Doctor') {
      doctor.isVerified = true;
      await doctor.save();

      // Log the approval
      await Log.create({
        user: req.user._id,
        action: 'DOCTOR_APPROVE',
        details: `Approved doctor ${doctor.name}`,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({ message: 'Doctor approved successfully', doctor });
    } else {
      res.status(404).json({ message: 'Doctor not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

const Log = require('../models/Log');

// ... existing routes ...

// @desc    Get all audit logs
// @route   GET /api/admin/logs
router.get('/logs', async (req, res) => {
  try {
    const logs = await Log.find({}).populate('user', 'name role email').sort({ createdAt: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
