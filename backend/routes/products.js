const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Log = require('../models/Log');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get all products (optionally filter by category)
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.subCategory) filter.subCategory = req.query.subCategory;
    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('[PRODUCTS] GET / error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json(product);
  } catch (error) {
    console.error('[PRODUCTS] GET /:id error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
// FIX: Removed duplicate POST '/' route — only one handler now
router.post('/', protect, authorize('Admin'), async (req, res) => {
  try {
    const { name, price, category, subCategory, stock, description, image } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ success: false, message: 'Name, price and category are required' });
    }

    const product = await Product.create({
      name,
      price,
      category,
      subCategory: subCategory || '',
      stock: stock !== undefined ? stock : 0,
      description: description || '',
      image: image || '',
      user: req.user._id,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('[PRODUCTS] POST / error:', error.message);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    const { name, price, description, image, category, subCategory, stock } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    let priceChanged = false;
    const oldPrice = product.price;

    if (price !== undefined && Number(price) !== Number(product.price)) {
      priceChanged = true;
      product.price = price;
    }

    product.name        = name        || product.name;
    product.description = description || product.description;
    product.image       = image       || product.image;
    product.category    = category    || product.category;
    product.subCategory = subCategory || product.subCategory;
    product.stock       = stock !== undefined ? stock : product.stock;

    const updatedProduct = await product.save();

    if (priceChanged) {
      await Log.create({
        user: req.user._id,
        action: 'PRICE_UPDATE',
        details: `Price of "${product.name}" changed from ₹${oldPrice} → ₹${product.price}`,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      }).catch((e) => console.error('Log error:', e.message));
    }

    res.json(updatedProduct);
  } catch (error) {
    console.error('[PRODUCTS] PUT /:id error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    await product.deleteOne();

    await Log.create({
      user: req.user._id,
      action: 'PRODUCT_DELETE',
      details: `Deleted product: "${product.name}"`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    }).catch((e) => console.error('Log error:', e.message));

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('[PRODUCTS] DELETE /:id error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
