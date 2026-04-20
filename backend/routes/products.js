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
    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
router.post('/', protect, authorize('Admin'), async (req, res) => {
  try {
    const product = new Product({
      name: 'Sample name',
      price: 0,
      user: req.user._id,
      image: '/images/sample.jpg',
      category: 'Feed',
      stock: 0,
      description: 'Sample description',
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    const { name, price, description, image, category, subCategory, stock } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      let priceChanged = false;
      let oldPrice = product.price;

      if (price !== undefined && Number(price) !== Number(product.price)) {
        priceChanged = true;
        product.price = price;
      }

      product.name = name || product.name;
      product.description = description || product.description;
      product.image = image || product.image;
      product.category = category || product.category;
      product.subCategory = subCategory || product.subCategory;
      product.stock = stock !== undefined ? stock : product.stock;

      const updatedProduct = await product.save();

      if (priceChanged) {
        await Log.create({
          adminId: req.user._id,
          action: 'PRICE_UPDATE',
          details: `Price of product ${product.name} changed from ${oldPrice} to ${product.price}`,
          targetId: product._id
        });
      }

      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    await product.deleteOne();

    await Log.create({
      user: req.user._id,
      action: 'PRODUCT_DELETE',
      details: `Deleted product: ${product.name}`,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create a product (accepts full body, not a dummy)
// @route   POST /api/products
// @access  Private/Admin
router.post('/', protect, authorize('Admin'), async (req, res) => {
  try {
    const { name, price, category, subCategory, stock, description, image } = req.body;
    const product = await Product.create({
      name, price, category, subCategory, stock, description,
      image: image || '',
      user: req.user._id,
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
