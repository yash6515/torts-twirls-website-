const express = require('express');
const router  = express.Router();
const {
  createProduct, updateProduct, deleteProduct,
  getAllOrders, getOrderById, updateOrderStatus, updateShippingDetails,
  getAllUsers, getUserDetail, updateUserRole, toggleUserStatus, adminResetUserPassword,
  getDashboardStats,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

// All routes require admin authentication
router.use(protect, admin);

// ── Dashboard ──
router.get('/stats', getDashboardStats);

// ── Products ──
router.post  ('/products',     createProduct);
router.put   ('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// ── Orders ──
router.get('/orders',                    getAllOrders);
router.get('/orders/:id',                getOrderById);
router.put('/orders/:id/status',         updateOrderStatus);
router.put('/orders/:id/shipping',       updateShippingDetails);

// ── Users ──
router.get  ('/users',                         getAllUsers);
router.get  ('/users/:id',                     getUserDetail);
router.put  ('/users/:id/role',                updateUserRole);
router.put  ('/users/:id/status',              toggleUserStatus);
router.put  ('/users/:id/reset-password',      adminResetUserPassword);

module.exports = router;
