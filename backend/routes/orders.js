const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrderById, updateOrderPayment, requestReturn } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createOrder);
router.get('/my', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/pay', protect, updateOrderPayment);
router.post('/:id/return', protect, requestReturn);

module.exports = router;
