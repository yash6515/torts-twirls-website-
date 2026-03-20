const Product = require('../models/Product');
const Order   = require('../models/Order');
const User    = require('../models/User');

/* ─── PRODUCTS ─── */

const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id, { isActive: false }, { new: true }
    );
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─── ORDERS ─── */

const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const query = {};
    if (status) query.status = status;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments(query);

    let ordersQuery = Order.find(query)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const orders = await ordersQuery;

    res.json({
      success: true,
      orders,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update order status only
const updateOrderStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    const updateFields = { status };
    if (adminNotes !== undefined) updateFields.adminNotes = adminNotes;
    if (status === 'delivered') updateFields['shippingDetails.deliveredAt'] = new Date();

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    ).populate('user', 'name email phone');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order, message: 'Order status updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update shipping details (courier, tracking, estimated delivery, dispatch)
const updateShippingDetails = async (req, res) => {
  try {
    const {
      courierName,
      trackingNumber,
      trackingUrl,
      estimatedDelivery,
      dispatchedAt,
      shippingNotes,
    } = req.body;

    const shippingFields = {};
    if (courierName      !== undefined) shippingFields['shippingDetails.courierName']       = courierName;
    if (trackingNumber   !== undefined) shippingFields['shippingDetails.trackingNumber']     = trackingNumber;
    if (trackingUrl      !== undefined) shippingFields['shippingDetails.trackingUrl']        = trackingUrl;
    if (estimatedDelivery !== undefined) shippingFields['shippingDetails.estimatedDelivery'] = estimatedDelivery ? new Date(estimatedDelivery) : null;
    if (dispatchedAt     !== undefined) shippingFields['shippingDetails.dispatchedAt']       = dispatchedAt ? new Date(dispatchedAt) : null;
    if (shippingNotes    !== undefined) shippingFields['shippingDetails.shippingNotes']      = shippingNotes;

    // Auto-advance to 'shipped' if tracking is being added and status is still confirmed/processing
    let statusUpdate = {};
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (trackingNumber && ['confirmed', 'processing'].includes(order.status)) {
      statusUpdate.status = 'shipped';
    }

    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: { ...shippingFields, ...statusUpdate } },
      { new: true }
    ).populate('user', 'name email phone');

    res.json({ success: true, order: updated, message: 'Shipping details updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─── DASHBOARD ─── */

const getDashboardStats = async (req, res) => {
  try {
    const [
      totalOrders,
      revenueAgg,
      totalProducts,
      totalUsers,
      recentOrders,
      topProducts,
      monthlyRevenue,
      ordersByStatus,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        { $match: { isPaid: true } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
      Product.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'user' }),
      Order.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(5),
      Product.find({ isActive: true }).sort({ soldCount: -1 }).limit(5),
      Order.aggregate([
        { $match: { isPaid: true } },
        {
          $group: {
            _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
            revenue: { $sum: '$totalPrice' },
            orders:  { $sum: 1 },
          },
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 6 },
      ]),
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    res.json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue:   revenueAgg[0]?.total || 0,
        totalProducts,
        totalUsers,
        recentOrders,
        topProducts,
        monthlyRevenue,
        ordersByStatus,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createProduct, updateProduct, deleteProduct,
  getAllOrders, getOrderById, updateOrderStatus, updateShippingDetails,
  getDashboardStats, getAllUsers,
};
