const Cart = require('../models/Cart');
const Product = require('../models/Product');

const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name price discountPrice images stock');
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, size = 'queen', color = '' } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    if (product.stock < quantity) return res.status(400).json({ success: false, message: 'Insufficient stock' });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

    const itemIndex = cart.items.findIndex(item =>
      item.product.toString() === productId && item.size === size && item.color === color
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity, size, color });
    }

    await cart.save();
    cart = await Cart.findById(cart._id).populate('items.product', 'name price discountPrice images stock');
    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found in cart' });

    if (quantity <= 0) {
      cart.items.pull(req.params.itemId);
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    const updatedCart = await Cart.findById(cart._id).populate('items.product', 'name price discountPrice images stock');
    res.json({ success: true, cart: updatedCart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    cart.items.pull(req.params.itemId);
    await cart.save();
    const updatedCart = await Cart.findById(cart._id).populate('items.product', 'name price discountPrice images stock');
    res.json({ success: true, cart: updatedCart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
