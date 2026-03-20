const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Product = require('../models/Product');

router.get('/product/:productId', async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId).populate('reviews.user', 'name avatar');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, reviews: product.reviews, rating: product.rating, numReviews: product.numReviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
