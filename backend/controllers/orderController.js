const Order = require('../models/Order');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { 
      orderItems, 
      shippingAddress, 
      paymentMethod,
      mrpTotal,
      discount,
      orderType = 'Product'
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    // 1. Determine Vehicle Type
    let vehicleType = 'Bike';
    const itemCount = orderItems.reduce((acc, item) => acc + item.qty, 0);
    const hasBulkFeed = orderItems.some(item => item.name.toLowerCase().includes('feed'));

    if (hasBulkFeed || itemCount > 10) {
      vehicleType = 'Lorry';
    } else if (itemCount >= 3) {
      vehicleType = 'Auto/Van';
    }

    // 2. Pricing Logic (STRICT FORMULA)
    const handlingFee = 20;
    const platformFee = 15;
    const deliveryCharges = vehicleType === 'Bike' ? 40 : vehicleType === 'Auto/Van' ? 150 : 500;
    const gst = mrpTotal * 0.05; // 5% GST

    const totalAmount = (mrpTotal - discount) + handlingFee + platformFee + deliveryCharges + gst;

    const order = new Order({
      user: req.user._id,
      orderType,
      orderItems,
      shippingAddress,
      paymentMethod,
      pricing: {
        mrpTotal,
        discount,
        handlingFee,
        platformFee,
        deliveryCharges,
        gst,
        totalAmount
      },
      status: 'Pending'
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Accept order (Shopkeeper)
// @route   PUT /api/orders/:id/accept
// @access  Private/Shopkeeper
const acceptOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = 'Accepted';
    order.shop = req.user._id;
    
    // Logic to assign delivery agent could go here or in a separate step
    // For now, let's say it's accepted and ready for delivery assignment
    
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark Delivered / Generate OTP
// @route   PUT /api/orders/:id/deliver-request
// @access  Private/Delivery
const requestDeliveryCompletion = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    order.otpVerification = {
      otp: hashedOtp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 mins
      attempts: 0,
      verified: false
    };

    await order.save();

    // In a real app, send OTP via SMS/Notification
    // For demo, we'll return it or log it
    console.log(`OTP for Order ${order._id}: ${otp}`);

    res.json({ message: 'OTP generated and sent to customer', otp_debug: otp });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify OTP and complete delivery
// @route   PUT /api/orders/:id/verify-otp
// @access  Private/Delivery
const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order || !order.otpVerification) {
      return res.status(404).json({ message: 'Order or OTP session not found' });
    }

    if (order.otpVerification.verified) {
      return res.status(400).json({ message: 'Order already verified' });
    }

    if (new Date() > order.otpVerification.expiresAt) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    if (order.otpVerification.attempts >= 3) {
      return res.status(400).json({ message: 'Max attempts reached' });
    }

    const isMatch = await bcrypt.compare(otp, order.otpVerification.otp);
    if (isMatch) {
      order.otpVerification.verified = true;
      order.status = 'Delivered';
      await order.save();
      res.json({ message: 'Delivery verified successfully', order });
    } else {
      order.otpVerification.attempts += 1;
      await order.save();
      res.status(400).json({ message: 'Invalid OTP' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user shop deliveryAgent');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createOrder,
  acceptOrder,
  requestDeliveryCompletion,
  verifyOtp,
  getMyOrders,
  getOrderById
};
