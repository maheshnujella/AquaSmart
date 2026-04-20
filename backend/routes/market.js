const express = require('express');
const router = express.Router();
const { 
  getMarketPrices, 
  getMarketPriceById, 
  getMarketTrends, 
  updateMarketPrice 
} = require('../controllers/marketController');
const { protect, authorize } = require('../middleware/auth');

router.get('/prices', getMarketPrices);
router.get('/prices/:id', getMarketPriceById);
router.get('/trends', getMarketTrends);
router.post('/prices', protect, authorize('Admin'), updateMarketPrice);

module.exports = router;
