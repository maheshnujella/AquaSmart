const express = require('express');
const router = express.Router();

const Log            = require('../models/Log');
const User           = require('../models/User');
const Product        = require('../models/Product');
const Order          = require('../models/Order');
const Booking        = require('../models/Booking');
const Listing        = require('../models/Listing');
const Doctor         = require('../models/Doctor');
const RepairService  = require('../models/RepairService');
const Payment        = require('../models/Payment');
const FeedCompany    = require('../models/FeedCompany');
const FeedSubcategory = require('../models/FeedSubcategory');
const { protect, authorize } = require('../middleware/auth');

// Apply auth + Admin role to ALL admin routes
router.use(protect);
router.use(authorize('Admin'));

// ═══════════════════════════════════════════════════════════════════════════════
// USERS
// ═══════════════════════════════════════════════════════════════════════════════

// @route   GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error('[ADMIN] GET /users:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'Admin') return res.status(403).json({ success: false, message: 'Cannot delete an Admin account' });
    await user.deleteOne();
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    console.error('[ADMIN] DELETE /users/:id:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ORDERS
// ═══════════════════════════════════════════════════════════════════════════════

// @route   GET /api/admin/orders
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'id name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('[ADMIN] GET /orders:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/admin/orders/:id/status
router.put('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const VALID = ['Pending', 'Accepted', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled', 'Refunded'];
    if (!status || !VALID.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${VALID.join(', ')}` });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.status = status;
    const updated = await order.save();

    await Log.create({
      user: req.user._id,
      action: 'ORDER_STATUS_UPDATE',
      details: `Order ${order._id} status → ${status}`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    }).catch(() => {});

    res.json({ success: true, message: `Order status updated to ${status}`, order: updated });
  } catch (err) {
    console.error('[ADMIN] PUT /orders/:id/status:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// BOOKINGS
// ═══════════════════════════════════════════════════════════════════════════════

// @route   GET /api/admin/bookings
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate('user', 'id name')
      .populate('provider', 'id name');
    res.json(bookings);
  } catch (err) {
    console.error('[ADMIN] GET /bookings:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/admin/bookings/:id/assign
router.put('/bookings/:id/assign', async (req, res) => {
  try {
    const { providerId } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    booking.provider = providerId;
    booking.status = 'Confirmed';
    const updated = await booking.save();
    res.json(updated);
  } catch (err) {
    console.error('[ADMIN] PUT /bookings/:id/assign:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/admin/listings/:id/approve
router.put('/listings/:id/approve', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    listing.status = 'Active';
    const updated = await listing.save();
    res.json(updated);
  } catch (err) {
    console.error('[ADMIN] PUT /listings/:id/approve:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// FEEDS  (Product model, category = 'Feed')
// ═══════════════════════════════════════════════════════════════════════════════

// @route   GET /api/admin/feeds
router.get('/feeds', async (req, res) => {
  try {
    const feeds = await Product.find({ category: 'Feed' }).sort({ createdAt: -1 });
    res.json({ success: true, data: feeds });
  } catch (err) {
    console.error('[ADMIN] GET /feeds:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/admin/feeds
router.post('/feeds', async (req, res) => {
  try {
    const { name, subCategory, description, price, stock, image } = req.body;
    if (!name || !price) return res.status(400).json({ success: false, message: 'Name and price are required' });

    const feed = await Product.create({
      name,
      category: 'Feed',
      subCategory: subCategory || '',
      description: description || '',
      price: Number(price),
      stock: stock !== undefined ? Number(stock) : 0,
      image: image || '',
      user: req.user._id,
    });

    await Log.create({ user: req.user._id, action: 'FEED_CREATE', details: `Created feed: ${name}`, ip: req.ip, userAgent: req.get('User-Agent') }).catch(() => {});
    res.status(201).json({ success: true, data: feed });
  } catch (err) {
    console.error('[ADMIN] POST /feeds:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/admin/feeds/:id
router.put('/feeds/:id', async (req, res) => {
  try {
    const { name, subCategory, description, price, stock, image } = req.body;
    const feed = await Product.findOne({ _id: req.params.id, category: 'Feed' });
    if (!feed) return res.status(404).json({ success: false, message: 'Feed not found' });

    if (name)        feed.name        = name;
    if (subCategory) feed.subCategory = subCategory;
    if (description) feed.description = description;
    if (price !== undefined) feed.price = Number(price);
    if (stock !== undefined) feed.stock = Number(stock);
    if (image)       feed.image       = image;

    const updated = await feed.save();
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('[ADMIN] PUT /feeds/:id:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/admin/feeds/:id
router.delete('/feeds/:id', async (req, res) => {
  try {
    const feed = await Product.findOne({ _id: req.params.id, category: 'Feed' });
    if (!feed) return res.status(404).json({ success: false, message: 'Feed not found' });
    await feed.deleteOne();
    await Log.create({ user: req.user._id, action: 'FEED_DELETE', details: `Deleted feed: ${feed.name}`, ip: req.ip, userAgent: req.get('User-Agent') }).catch(() => {});
    res.json({ success: true, message: 'Feed deleted successfully' });
  } catch (err) {
    console.error('[ADMIN] DELETE /feeds/:id:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// MEDICINES  (Product model, category = 'Medicine')
// ═══════════════════════════════════════════════════════════════════════════════

// @route   GET /api/admin/medicines
router.get('/medicines', async (req, res) => {
  try {
    const medicines = await Product.find({ category: 'Medicine' }).sort({ createdAt: -1 });
    res.json({ success: true, data: medicines });
  } catch (err) {
    console.error('[ADMIN] GET /medicines:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/admin/medicines
router.post('/medicines', async (req, res) => {
  try {
    const { name, subCategory, description, price, stock, image } = req.body;
    if (!name || !price) return res.status(400).json({ success: false, message: 'Name and price are required' });

    const medicine = await Product.create({
      name,
      category: 'Medicine',
      subCategory: subCategory || '',
      description: description || '',
      price: Number(price),
      stock: stock !== undefined ? Number(stock) : 0,
      image: image || '',
      user: req.user._id,
    });

    await Log.create({ user: req.user._id, action: 'MEDICINE_CREATE', details: `Created medicine: ${name}`, ip: req.ip, userAgent: req.get('User-Agent') }).catch(() => {});
    res.status(201).json({ success: true, data: medicine });
  } catch (err) {
    console.error('[ADMIN] POST /medicines:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/admin/medicines/:id
router.put('/medicines/:id', async (req, res) => {
  try {
    const { name, subCategory, description, price, stock, image } = req.body;
    const medicine = await Product.findOne({ _id: req.params.id, category: 'Medicine' });
    if (!medicine) return res.status(404).json({ success: false, message: 'Medicine not found' });

    if (name)        medicine.name        = name;
    if (subCategory) medicine.subCategory = subCategory;
    if (description) medicine.description = description;
    if (price !== undefined) medicine.price = Number(price);
    if (stock !== undefined) medicine.stock = Number(stock);
    if (image)       medicine.image       = image;

    const updated = await medicine.save();
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('[ADMIN] PUT /medicines/:id:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/admin/medicines/:id
router.delete('/medicines/:id', async (req, res) => {
  try {
    const medicine = await Product.findOne({ _id: req.params.id, category: 'Medicine' });
    if (!medicine) return res.status(404).json({ success: false, message: 'Medicine not found' });
    await medicine.deleteOne();
    await Log.create({ user: req.user._id, action: 'MEDICINE_DELETE', details: `Deleted medicine: ${medicine.name}`, ip: req.ip, userAgent: req.get('User-Agent') }).catch(() => {});
    res.json({ success: true, message: 'Medicine deleted successfully' });
  } catch (err) {
    console.error('[ADMIN] DELETE /medicines/:id:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// REPAIR SERVICES
// ═══════════════════════════════════════════════════════════════════════════════

// @route   GET /api/admin/repair-services
router.get('/repair-services', async (req, res) => {
  try {
    const services = await RepairService.find({}).sort({ createdAt: -1 });
    res.json({ success: true, data: services });
  } catch (err) {
    console.error('[ADMIN] GET /repair-services:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/admin/repair-services
router.post('/repair-services', async (req, res) => {
  try {
    const { name, type, description, price, isAvailable, image } = req.body;
    if (!name || !type || !price) return res.status(400).json({ success: false, message: 'Name, type and price are required' });

    const service = await RepairService.create({ name, type, description: description || '', price: Number(price), isAvailable: isAvailable !== false, image: image || '' });
    await Log.create({ user: req.user._id, action: 'REPAIR_SERVICE_CREATE', details: `Created repair service: ${name}`, ip: req.ip, userAgent: req.get('User-Agent') }).catch(() => {});
    res.status(201).json({ success: true, data: service });
  } catch (err) {
    console.error('[ADMIN] POST /repair-services:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/admin/repair-services/:id
router.put('/repair-services/:id', async (req, res) => {
  try {
    const service = await RepairService.findById(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Repair service not found' });

    const { name, type, description, price, isAvailable, image } = req.body;
    if (name)        service.name        = name;
    if (type)        service.type        = type;
    if (description) service.description = description;
    if (price !== undefined)       service.price       = Number(price);
    if (isAvailable !== undefined) service.isAvailable = isAvailable;
    if (image)       service.image       = image;

    const updated = await service.save();
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('[ADMIN] PUT /repair-services/:id:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/admin/repair-services/:id
router.delete('/repair-services/:id', async (req, res) => {
  try {
    const service = await RepairService.findById(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Repair service not found' });
    await service.deleteOne();
    await Log.create({ user: req.user._id, action: 'REPAIR_SERVICE_DELETE', details: `Deleted repair service: ${service.name}`, ip: req.ip, userAgent: req.get('User-Agent') }).catch(() => {});
    res.json({ success: true, message: 'Repair service deleted successfully' });
  } catch (err) {
    console.error('[ADMIN] DELETE /repair-services/:id:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// DOCTORS (Doctor model — separate from User.role=Doctor)
// ═══════════════════════════════════════════════════════════════════════════════

// @route   GET /api/admin/doctors
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await Doctor.find({}).sort({ createdAt: -1 });
    res.json({ success: true, data: doctors });
  } catch (err) {
    console.error('[ADMIN] GET /doctors:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/admin/doctors/pending  (existing — pending User.role=Doctor approvals)
router.get('/doctors/pending', async (req, res) => {
  try {
    const doctors = await User.find({ role: 'Doctor', 'doctorProfile.isVerified': false }).select('-password');
    res.json(doctors);
  } catch (err) {
    console.error('[ADMIN] GET /doctors/pending:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/admin/doctors
router.post('/doctors', async (req, res) => {
  try {
    const { name, specialty, experience, image, about, available } = req.body;
    if (!name || !specialty || !experience || !image || !about) {
      return res.status(400).json({ success: false, message: 'name, specialty, experience, image and about are required' });
    }

    const doctor = await Doctor.create({ name, specialty, experience: Number(experience), image, about, available: available !== false });
    await Log.create({ user: req.user._id, action: 'DOCTOR_CREATE', details: `Created doctor profile: ${name}`, ip: req.ip, userAgent: req.get('User-Agent') }).catch(() => {});
    res.status(201).json({ success: true, data: doctor });
  } catch (err) {
    console.error('[ADMIN] POST /doctors:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/admin/doctors/:id
router.put('/doctors/:id', async (req, res) => {
  try {
    // First try Doctor model, then fallback to User model (for verify flow)
    const doctor = await Doctor.findById(req.params.id);
    if (doctor) {
      const { name, specialty, experience, image, about, available } = req.body;
      if (name)       doctor.name       = name;
      if (specialty)  doctor.specialty  = specialty;
      if (experience !== undefined) doctor.experience = Number(experience);
      if (image)      doctor.image      = image;
      if (about)      doctor.about      = about;
      if (available !== undefined) doctor.available = available;

      const updated = await doctor.save();
      return res.json({ success: true, data: updated });
    }

    // Fallback: User model doctor verify
    const userDoctor = await User.findById(req.params.id);
    if (!userDoctor || userDoctor.role !== 'Doctor') {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    userDoctor.doctorProfile = userDoctor.doctorProfile || {};
    userDoctor.doctorProfile.isVerified = true;
    await userDoctor.save();

    await Log.create({ user: req.user._id, action: 'DOCTOR_APPROVE', details: `Approved doctor: ${userDoctor.name}`, ip: req.ip, userAgent: req.get('User-Agent') }).catch(() => {});
    res.json({ success: true, message: 'Doctor approved successfully', doctor: userDoctor });
  } catch (err) {
    console.error('[ADMIN] PUT /doctors/:id:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/admin/doctors/:id/verify  (keep existing route alias)
router.put('/doctors/:id/verify', async (req, res) => {
  try {
    const doctor = await User.findById(req.params.id);
    if (!doctor || doctor.role !== 'Doctor') {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    doctor.doctorProfile = doctor.doctorProfile || {};
    doctor.doctorProfile.isVerified = true;
    await doctor.save();
    await Log.create({ user: req.user._id, action: 'DOCTOR_APPROVE', details: `Approved doctor: ${doctor.name}`, ip: req.ip, userAgent: req.get('User-Agent') }).catch(() => {});
    res.json({ success: true, message: 'Doctor approved successfully', doctor });
  } catch (err) {
    console.error('[ADMIN] PUT /doctors/:id/verify:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/admin/doctors/:id
router.delete('/doctors/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    await doctor.deleteOne();
    await Log.create({ user: req.user._id, action: 'DOCTOR_DELETE', details: `Deleted doctor: ${doctor.name}`, ip: req.ip, userAgent: req.get('User-Agent') }).catch(() => {});
    res.json({ success: true, message: 'Doctor deleted successfully' });
  } catch (err) {
    console.error('[ADMIN] DELETE /doctors/:id:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// AUDIT LOGS
// ═══════════════════════════════════════════════════════════════════════════════

// @route   GET /api/admin/logs
router.get('/logs', async (req, res) => {
  try {
    const logs = await Log.find({})
      .populate('user', 'name role email')
      .sort({ createdAt: -1 })
      .limit(500);
    res.json(logs);
  } catch (err) {
    console.error('[ADMIN] GET /logs:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// FEED COMPANIES
// ═══════════════════════════════════════════════════════════════════════════════

// @route GET /api/admin/feed-companies
router.get('/feed-companies', async (req, res) => {
  try {
    const companies = await FeedCompany.find({}).sort({ name: 1 });
    res.json({ success: true, data: companies });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route POST /api/admin/feed-companies
router.post('/feed-companies', async (req, res) => {
  try {
    const { name, logo, description } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Company name is required' });
    const company = await FeedCompany.create({ name, logo: logo || '', description: description || '', createdBy: req.user._id });
    await Log.create({ user: req.user._id, action: 'FEED_COMPANY_CREATE', details: `Created feed company: ${name}`, ip: req.ip, userAgent: req.get('User-Agent') }).catch(() => {});
    res.status(201).json({ success: true, data: company });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, message: 'Company name already exists' });
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route PUT /api/admin/feed-companies/:id
router.put('/feed-companies/:id', async (req, res) => {
  try {
    const { name, logo, description, isActive } = req.body;
    const company = await FeedCompany.findById(req.params.id);
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });
    if (name)        company.name        = name;
    if (logo !== undefined)        company.logo        = logo;
    if (description !== undefined) company.description = description;
    if (isActive !== undefined)    company.isActive    = isActive;
    const updated = await company.save();
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route DELETE /api/admin/feed-companies/:id
router.delete('/feed-companies/:id', async (req, res) => {
  try {
    const company = await FeedCompany.findById(req.params.id);
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });
    await company.deleteOne();
    // Clean up subcategories
    await FeedSubcategory.deleteMany({ company: req.params.id });
    await Log.create({ user: req.user._id, action: 'FEED_COMPANY_DELETE', details: `Deleted feed company: ${company.name}`, ip: req.ip, userAgent: req.get('User-Agent') }).catch(() => {});
    res.json({ success: true, message: 'Feed company deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// FEED SUBCATEGORIES
// ═══════════════════════════════════════════════════════════════════════════════

// @route GET /api/admin/feed-subcategories?company=:id
router.get('/feed-subcategories', async (req, res) => {
  try {
    const filter = req.query.company ? { company: req.query.company } : {};
    const subcategories = await FeedSubcategory.find(filter)
      .populate('company', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: subcategories });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route POST /api/admin/feed-subcategories
router.post('/feed-subcategories', async (req, res) => {
  try {
    const { company, name, description } = req.body;
    if (!company || !name) return res.status(400).json({ success: false, message: 'company and name are required' });
    const sub = await FeedSubcategory.create({ company, name, description: description || '', createdBy: req.user._id });
    await Log.create({ user: req.user._id, action: 'FEED_SUBCATEGORY_CREATE', details: `Created subcategory: ${name}`, ip: req.ip, userAgent: req.get('User-Agent') }).catch(() => {});
    const populated = await sub.populate('company', 'name');
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route PUT /api/admin/feed-subcategories/:id
router.put('/feed-subcategories/:id', async (req, res) => {
  try {
    const { name, description, isActive } = req.body;
    const sub = await FeedSubcategory.findById(req.params.id);
    if (!sub) return res.status(404).json({ success: false, message: 'Subcategory not found' });
    if (name)                sub.name        = name;
    if (description !== undefined) sub.description = description;
    if (isActive !== undefined)    sub.isActive    = isActive;
    const updated = await sub.save();
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route DELETE /api/admin/feed-subcategories/:id
router.delete('/feed-subcategories/:id', async (req, res) => {
  try {
    const sub = await FeedSubcategory.findById(req.params.id);
    if (!sub) return res.status(404).json({ success: false, message: 'Subcategory not found' });
    await sub.deleteOne();
    await Log.create({ user: req.user._id, action: 'FEED_SUBCATEGORY_DELETE', details: `Deleted subcategory: ${sub.name}`, ip: req.ip, userAgent: req.get('User-Agent') }).catch(() => {});
    res.json({ success: true, message: 'Subcategory deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PAYMENTS (Admin view)
// ═══════════════════════════════════════════════════════════════════════════════

// @route GET /api/admin/payments
router.get('/payments', async (req, res) => {
  try {
    const payments = await Payment.find({})
      .populate('order', 'orderType status pricing')
      .populate('user', 'name email phone')
      .populate('shopkeeper', 'name shopName')
      .populate('deliveryAgent', 'name phone')
      .sort({ createdAt: -1 });

    const totalRevenue      = payments.reduce((s, p) => s + (p.amount || 0), 0);
    const adminCommission   = payments.reduce((s, p) => s + (p.splitDetails?.adminAmount || 0), 0);
    const shopkeeperPayouts = payments.reduce((s, p) => s + (p.splitDetails?.shopkeeperAmount || 0), 0);
    const deliveryPayouts   = payments.reduce((s, p) => s + (p.splitDetails?.deliveryAmount || 0), 0);

    res.json({
      success: true,
      data: payments,
      stats: { totalRevenue, adminCommission, shopkeeperPayouts, deliveryPayouts },
    });
  } catch (err) {
    console.error('[ADMIN] GET /payments:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route GET /api/admin/stats/roles  — role breakdown for dashboard
router.get('/stats/roles', async (req, res) => {
  try {
    const roleGroups = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);
    const result = {};
    roleGroups.forEach(g => { result[g._id] = g.count; });
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route PUT /api/admin/orders/:id/assign-delivery
router.put('/orders/:id/assign-delivery', async (req, res) => {
  try {
    const { deliveryAgentId } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    order.deliveryAgent = deliveryAgentId;
    order.status = 'Processing';
    await order.save();
    res.json({ success: true, message: 'Delivery agent assigned', order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
