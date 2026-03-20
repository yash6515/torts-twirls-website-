const express = require('express');
const router  = express.Router();
const {
  createProduct, updateProduct, deleteProduct,
  getAllOrders, getOrderById, updateOrderStatus, updateShippingDetails,
  getDashboardStats, getAllUsers,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

// All routes require admin
router.use(protect, admin);

// Dashboard
router.get('/stats', getDashboardStats);

// Users
router.get('/users', getAllUsers);

// Products
router.post  ('/products',     createProduct);
router.put   ('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Orders
router.get ('/orders',                    getAllOrders);
router.get ('/orders/:id',                getOrderById);
router.put ('/orders/:id/status',         updateOrderStatus);
router.put ('/orders/:id/shipping',       updateShippingDetails);

module.exports = router;
