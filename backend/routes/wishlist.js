const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist', 'name price discountPrice images rating category');
    res.json({ success: true, wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/:productId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const productId = req.params.productId;
    const index = user.wishlist.indexOf(productId);
    if (index > -1) {
      user.wishlist.splice(index, 1);
    } else {
      user.wishlist.push(productId);
    }
    await user.save();
    const updated = await User.findById(req.user._id).populate('wishlist', 'name price discountPrice images rating category');
    res.json({ success: true, wishlist: updated.wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
