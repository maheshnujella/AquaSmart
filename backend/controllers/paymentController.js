const Order   = require('../models/Order');
const Payment = require('../models/Payment');
const Log     = require('../models/Log');

// ─── Helpers ──────────────────────────────────────────────────────────────────
const genTxnId  = () => `TXN${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
const genUpiRef = () => `UPI${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

// ─── Calculate split ──────────────────────────────────────────────────────────
// Product amount → Shopkeeper | Delivery charge → Delivery Boy | Rest → Admin
const calculateSplit = (pricing) => {
  const { mrpTotal = 0, discount = 0, deliveryCharges = 0, platformFee = 0, handlingFee = 0 } = pricing;
  const shopkeeperAmount = (mrpTotal - discount);          // what shopkeeper earns
  const deliveryAmount   = deliveryCharges;                 // delivery boy earnings
  const adminAmount      = platformFee + handlingFee;       // admin commission
  return { shopkeeperAmount, deliveryAmount, adminAmount };
};

// @desc    Initiate UPI payment (simulation)
// @route   POST /api/payments/initiate-upi
// @access  Private
const initiateUPIPayment = async (req, res) => {
  try {
    const { orderId, upiApp } = req.body;

    if (!orderId || !upiApp) {
      return res.status(400).json({ success: false, message: 'orderId and upiApp are required' });
    }

    const validApps = ['PhonePe', 'GPay', 'Paytm'];
    if (!validApps.includes(upiApp)) {
      return res.status(400).json({ success: false, message: 'Invalid UPI app. Choose PhonePe, GPay or Paytm' });
    }

    const order = await Order.findById(orderId).populate('shop deliveryAgent');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (order.paymentStatus === 'Paid') {
      return res.status(400).json({ success: false, message: 'Order is already paid' });
    }

    const amount = order.pricing?.totalAmount || 0;
    const split  = calculateSplit(order.pricing || {});
    const txnId  = genTxnId();

    // Deep-link UPI URIs (simulation — no real money moves)
    const upiUriMap = {
      PhonePe: `phonepe://pay?pa=aquasmart@ybl&pn=AquaSmart&am=${amount}&tn=${txnId}&cu=INR`,
      GPay:    `gpay://upi/pay?pa=aquasmart@oksbi&pn=AquaSmart&am=${amount}&tn=${txnId}&cu=INR`,
      Paytm:   `paytmmp://pay?pa=aquasmart@paytm&pn=AquaSmart&am=${amount}&tn=${txnId}&cu=INR`,
    };

    res.json({
      success: true,
      data: {
        transactionId: txnId,
        amount,
        upiApp,
        upiUri: upiUriMap[upiApp],
        splitDetails: split,
        orderId,
      },
    });
  } catch (err) {
    console.error('[PAYMENT] initiateUPIPayment:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Confirm payment & split settlement
// @route   POST /api/payments/confirm
// @access  Private
const confirmPayment = async (req, res) => {
  try {
    const { orderId, upiApp, transactionId } = req.body;

    const order = await Order.findById(orderId).populate('shop deliveryAgent');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (order.paymentStatus === 'Paid') {
      return res.status(400).json({ success: false, message: 'Order already paid' });
    }

    const amount = order.pricing?.totalAmount || 0;
    const split  = calculateSplit(order.pricing || {});
    const txnId  = transactionId || genTxnId();
    const upiRef = genUpiRef();

    // Create Payment record
    const payment = await Payment.create({
      order:         orderId,
      user:          req.user._id,
      upiApp:        upiApp || 'Other',
      transactionId: txnId,
      amount,
      splitDetails:  split,
      shopkeeper:    order.shop || undefined,
      deliveryAgent: order.deliveryAgent || undefined,
      status:        'Success',
      upiRef,
    });

    // Update order
    order.paymentStatus  = 'Paid';
    order.isPaid         = true;
    order.paidAt         = new Date();
    order.transactionId  = txnId;
    order.upiApp         = upiApp;
    await order.save();

    await Log.create({
      user:      req.user._id,
      action:    'PAYMENT_SUCCESS',
      details:   `Payment ₹${amount} via ${upiApp} for order ${orderId}. Split: Shopkeeper ₹${split.shopkeeperAmount}, Delivery ₹${split.deliveryAmount}, Admin ₹${split.adminAmount}`,
      ip:        req.ip,
      userAgent: req.get('User-Agent'),
    }).catch(() => {});

    res.json({
      success: true,
      message: 'Payment confirmed and settlement done',
      data: {
        payment,
        splitDetails: split,
        upiRef,
        transactionId: txnId,
      },
    });
  } catch (err) {
    console.error('[PAYMENT] confirmPayment:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get payment details for an order
// @route   GET /api/payments/order/:orderId
// @access  Private
const getOrderPayment = async (req, res) => {
  try {
    const payment = await Payment.findOne({ order: req.params.orderId })
      .populate('user', 'name email')
      .populate('shopkeeper', 'name shopName')
      .populate('deliveryAgent', 'name phone');

    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

    res.json({ success: true, data: payment });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Admin: Get all payments
// @route   GET /api/payments/all
// @access  Private/Admin
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find({})
      .populate('order', 'orderType status')
      .populate('user', 'name email phone')
      .populate('shopkeeper', 'name shopName')
      .populate('deliveryAgent', 'name phone')
      .sort({ createdAt: -1 });

    const totalRevenue       = payments.reduce((s, p) => s + (p.amount || 0), 0);
    const adminCommission    = payments.reduce((s, p) => s + (p.splitDetails?.adminAmount || 0), 0);
    const shopkeeperPayouts  = payments.reduce((s, p) => s + (p.splitDetails?.shopkeeperAmount || 0), 0);
    const deliveryPayouts    = payments.reduce((s, p) => s + (p.splitDetails?.deliveryAmount || 0), 0);

    res.json({
      success: true,
      data: payments,
      stats: { totalRevenue, adminCommission, shopkeeperPayouts, deliveryPayouts },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Initiate payment (backward-compat simulation — kept for old route)
// @route   POST /api/payments/initiate
// @access  Private
const initiatePayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const transactionId = genTxnId();
    order.paymentStatus = 'Paid';
    order.isPaid        = true;
    order.paidAt        = new Date();
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
      amount: order.pricing?.totalAmount,
      reason,
      status: 'Requested'
    };
    order.paymentStatus = 'Pending';
    await order.save();

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
    const { status } = req.body;
    const order = await Order.findById(req.params.orderId);

    if (!order || !order.refundDetails) {
      return res.status(404).json({ message: 'Refund request not found' });
    }

    order.refundDetails.status = status;
    if (status === 'Processed') {
      order.paymentStatus = 'Refunded';
    } else {
      order.paymentStatus = 'Paid';
    }

    await order.save();

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
  initiateUPIPayment,
  confirmPayment,
  getOrderPayment,
  getAllPayments,
  initiatePayment,
  requestRefund,
  processRefund,
};
