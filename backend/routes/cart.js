// cart routes
const express = require('express');
const cartRouter = express.Router();
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

cartRouter.get('/', protect, getCart);
cartRouter.post('/', protect, addToCart);
cartRouter.put('/:itemId', protect, updateCartItem);
cartRouter.delete('/:itemId', protect, removeFromCart);
cartRouter.delete('/', protect, clearCart);

module.exports = cartRouter;
