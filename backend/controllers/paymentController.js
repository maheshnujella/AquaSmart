const Order = require('../models/Order');
const Log = require('../models/Log');

// @desc    Initiate payment (Simulation)
// @route   POST /api/payments/initiate
// @access  Private
const initiatePayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);

    if (!order) return res.status(404).json({ message: 'Order not found' });

    // In a real app, integrate with Razorpay/Stripe here
    // simulated transactionId
    const transactionId = `TXN_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    order.paymentStatus = 'Paid';
    order.transactionId = transactionId;
    await order.save();

    res.json({ message: 'Payment successful', transactionId });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Request a refund
// @route   POST /api/payments/refund/request
// @access  Private
const requestRefund = async (req, res) => {
  try {
    const { orderId, reason } = req.body;
    const order = await Order.findById(orderId);

    if (!order || order.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Order not found or unauthorized' });
    }

    if (order.paymentStatus !== 'Paid' && order.paymentStatus !== 'In Escrow') {
      return res.status(400).json({ message: 'Refund only possible for paid orders' });
    }

    order.refundDetails = {
      refundId: `REF_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      amount: order.totalPrice,
      reason,
      status: 'Requested'
    };
    order.paymentStatus = 'Pending'; // Change status to indicate refund process
    await order.save();

    // Log the refund request
    await Log.create({
      user: req.user._id,
      action: 'REFUND_REQUEST',
      details: `Refund requested for order ${orderId}. Reason: ${reason}`,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({ message: 'Refund request submitted', refundDetails: order.refundDetails });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Admin: Process refund
// @route   PUT /api/payments/refund/process/:orderId
// @access  Private/Admin
const processRefund = async (req, res) => {
  try {
    const { status } = req.body; // 'Processed' or 'Rejected'
    const order = await Order.findById(req.params.orderId);

    if (!order || !order.refundDetails) {
      return res.status(404).json({ message: 'Refund request not found' });
    }

    order.refundDetails.status = status;
    if (status === 'Processed') {
      order.paymentStatus = 'Refunded';
    } else {
      order.paymentStatus = 'Paid'; // Revert back if rejected
    }

    await order.save();

    // Log the admin action
    await Log.create({
      user: req.user._id,
      action: `REFUND_${status.toUpperCase()}`,
      details: `Refund for order ${order._id} was ${status}`,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({ message: `Refund ${status}`, order });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  initiatePayment,
  requestRefund,
  processRefund
};
