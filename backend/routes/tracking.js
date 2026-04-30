const express = require('express');
const router  = express.Router();
const Order   = require('../models/Order');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get last known location / tracking info for an order
// @route   GET /api/tracking/:orderId
// @access  Private
router.get('/:orderId', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('deliveryAgent', 'name phone deliveryProfile');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Authorization: customer can see their own order, delivery boy can see assigned
    const isCustomer = order.user.toString() === req.user._id.toString();
    const isDelivery = order.deliveryAgent &&
      order.deliveryAgent._id.toString() === req.user._id.toString();
    const isAdmin    = req.user.role === 'Admin';

    if (!isCustomer && !isDelivery && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    res.json({
      success: true,
      data: {
        orderId: order._id,
        status:  order.status,
        deliveryAgent: order.deliveryAgent,
        shippingAddress: order.shippingAddress,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Delivery boy updates their location (persists to DB + emits socket)
// @route   POST /api/tracking/:orderId/update
// @access  Private/Delivery
router.post('/:orderId/update', protect, authorize('Delivery', 'Admin'), async (req, res) => {
  try {
    const { lat, lng } = req.body;
    if (!lat || !lng) return res.status(400).json({ success: false, message: 'lat and lng required' });

    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Emit real-time update via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`order:${req.params.orderId}`).emit(`locationUpdate:${req.params.orderId}`, {
        orderId: req.params.orderId,
        lat, lng,
        timestamp: new Date().toISOString(),
        agentName: req.user.name,
      });
    }

    res.json({ success: true, message: 'Location updated and broadcast' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
