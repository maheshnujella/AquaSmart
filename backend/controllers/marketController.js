const MarketPrice = require('../models/MarketPrice');

// @desc    Get market price trends for a specific category/type/count
// @route   GET /api/market/prices
// @access  Public
const getMarketPrices = async (req, res) => {
  try {
    const { category, type, count } = req.query;
    const query = {};
    if (category) query.category = category;
    if (type) query.type = type;
    if (count) query.count = Number(count);

    const prices = await MarketPrice.find(query).sort({ date: -1 }).limit(50);
    res.json(prices || []);
  } catch (error) {
    res.status(500).json([]);
  }
};

const getMarketPriceById = async (req, res) => {
  try {
    const item = await MarketPrice.findById(req.params.id);
    if (!item) return res.status(404).json({ data: [], analysis: 'Not found', recommendation: 'N/A' });

    const prices = await MarketPrice.find({
      category: item.category,
      type: item.type,
      count: item.count
    }).sort({ date: -1 }).limit(7);

    const chronologicalData = (prices || []).reverse();
    
    // Default safe values
    let latestPrice = 0;
    let percentageChange = 0;
    let trendType = 'Stable';
    let analysisText = 'Not enough data for analysis.';
    let recommendation = 'Monitor market closely.';

    if (prices && prices.length >= 2) {
      latestPrice = prices[0].price;
      const oldestPrice = prices[prices.length - 1].price;
      percentageChange = (((latestPrice - oldestPrice) / oldestPrice) * 100).toFixed(1);

      const recent = prices.slice(0, 5);
      const isUptrend = recent.every((p, i) => i === recent.length - 1 || p.price >= recent[i + 1].price);
      const isDowntrend = recent.every((p, i) => i === recent.length - 1 || p.price <= recent[i + 1].price);

      if (isUptrend && latestPrice > oldestPrice) {
        trendType = 'Uptrend';
        analysisText = 'Prices are steadily increasing over the last 5 days.';
        recommendation = 'Based on latest trends, consider selling within the next 48 hours for better profit.';
      } else if (isDowntrend && latestPrice < oldestPrice) {
        trendType = 'Downtrend';
        analysisText = 'Prices are continuously decreasing.';
        recommendation = 'Prices are dropping. Selling now may reduce loss.';
      } else {
        trendType = 'Fluctuating';
        analysisText = 'Prices are unstable with ups and downs.';
        recommendation = 'Market is unpredictable. Monitor closely before selling.';
      }
    }

    res.json({
      _id: item._id,
      category: item.category,
      type: item.type,
      count: item.count,
      currentPrice: latestPrice || item.price,
      percentageChange,
      trend: trendType,
      analysis: analysisText,
      recommendation: recommendation,
      data: chronologicalData
    });
  } catch (error) {
    res.status(500).json({ data: [], error: true });
  }
};

// @desc    Admin: Update or add daily price
// @route   POST /api/market/prices
// @access  Private/Admin
const updateMarketPrice = async (req, res) => {
  try {
    const { category, type, count, price, source } = req.body;

    const newPrice = await MarketPrice.create({
      category,
      type,
      count: count || 0,
      price,
      source: source || 'Admin',
      date: new Date()
    });

    res.status(201).json(newPrice);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Seed function for initial demo data
const seedMarketData = async () => {
  const count = await MarketPrice.countDocuments();
  if (count > 0) return;

  const prawnTypes = [
    { type: 'Vannamei', count: 30, prices: [450, 460, 455, 470, 475] },
    { type: 'Vannamei', count: 40, prices: [380, 390, 385, 400, 410] }
  ];

  const now = new Date();
  for (const item of prawnTypes) {
    for (let i = 0; i < item.prices.length; i++) {
      await MarketPrice.create({
        category: 'Prawn',
        type: item.type,
        count: item.count,
        price: item.prices[i],
        date: new Date(now.getTime() - (4 - i) * 24 * 60 * 60 * 1000),
        source: 'Aggregated'
      });
    }
  }
  console.log('Market data seeded');
};

const getMarketTrends = async (req, res) => {
  try {
    const { type, count } = req.query;
    const query = { type: new RegExp(type, 'i') };
    if (count) query.count = Number(count);

    const prices = await MarketPrice.find(query).sort({ date: -1 }).limit(7);
    
    if (prices.length === 0) {
      return res.json({ currentPrice: 0, history: [], trend: 'Stable', analysis: 'No data', recommendation: 'N/A' });
    }

    const chronologicalData = [...prices].reverse();
    const latestPrice = prices[0].price;
    const oldestPrice = prices[prices.length - 1].price;
    const percentageChange = (((latestPrice - oldestPrice) / oldestPrice) * 100).toFixed(1);

    // Trend Logic
    let trendType = 'Stable';
    let analysisText = 'Market prices are holding steady.';
    let recommendation = 'Market is stable. You may sell anytime.';

    const recent = prices.slice(0, 5);
    const isUptrend = recent.every((p, i) => i === recent.length - 1 || p.price >= recent[i + 1].price);
    const isDowntrend = recent.every((p, i) => i === recent.length - 1 || p.price <= recent[i + 1].price);

    if (isUptrend && latestPrice > oldestPrice) {
      trendType = 'Uptrend';
      analysisText = 'Prices have increased steadily over the last 5 days.';
      recommendation = 'Based on latest trends, we recommend selling within the next 48 hours for maximum profit.';
    } else if (isDowntrend && latestPrice < oldestPrice) {
      trendType = 'Downtrend';
      analysisText = 'Prices have decreased steadily over the last 5 days.';
      recommendation = 'Prices are dropping. Selling now may reduce loss.';
    } else if (prices.length >= 2) {
      trendType = 'Fluctuating';
      analysisText = 'Prices are unstable with ups and downs.';
      recommendation = 'Market is unpredictable. Monitor closely before selling.';
    }

    res.json({
      currentPrice: latestPrice,
      trend: trendType,
      analysis: analysisText,
      recommendation: recommendation,
      percentageChange,
      history: chronologicalData.map(d => ({
        date: new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        price: d.price
      }))
    });
  } catch (error) {
    res.status(500).json({ history: [] });
  }
};

module.exports = {
  getMarketPrices,
  getMarketPriceById,
  getMarketTrends,
  updateMarketPrice,
  seedMarketData
};
