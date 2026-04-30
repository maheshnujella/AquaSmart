const express = require('express');
const router  = express.Router();
const Order   = require('../models/Order');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get orders assigned to logged-in delivery boy
// @route   GET /api/delivery/orders
// @access  Private/Delivery
router.get('/orders', protect, authorize('Delivery', 'Admin'), async (req, res) => {
  try {
    const orders = await Order.find({ deliveryAgent: req.user._id })
      .populate('user', 'name phone')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Mark order as picked up / Out for Delivery
// @route   PUT /api/delivery/orders/:id/pickup
// @access  Private/Delivery
router.put('/orders/:id/pickup', protect, authorize('Delivery', 'Admin'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (order.deliveryAgent?.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Not assigned to this order' });
    }

    order.status = 'Out for Delivery';
    await order.save();

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`order:${order._id}`).emit(`orderStatus:${order._id}`, { status: 'Out for Delivery' });
    }

    res.json({ success: true, message: 'Order marked as Out for Delivery', order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get all pending/processing orders (for delivery boy to see available)
// @route   GET /api/delivery/available
// @access  Private/Delivery
router.get('/available', protect, authorize('Delivery', 'Admin'), async (req, res) => {
  try {
    const orders = await Order.find({ status: { $in: ['Accepted', 'Processing'] }, deliveryAgent: { $exists: false } })
      .populate('user', 'name phone')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
