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
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─── ORDERS ─── */

const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = {};
    if (status) query.status = status;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ success: true, orders, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
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

const updateOrderStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const updateFields = { status };
    if (adminNotes !== undefined) updateFields.adminNotes = adminNotes;
    if (status === 'delivered') updateFields['shippingDetails.deliveredAt'] = new Date();

    const order = await Order.findByIdAndUpdate(req.params.id, { $set: updateFields }, { new: true })
      .populate('user', 'name email phone');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order, message: 'Order status updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateShippingDetails = async (req, res) => {
  try {
    const { courierName, trackingNumber, trackingUrl, estimatedDelivery, dispatchedAt, shippingNotes } = req.body;
    const shippingFields = {};
    if (courierName        !== undefined) shippingFields['shippingDetails.courierName']       = courierName;
    if (trackingNumber     !== undefined) shippingFields['shippingDetails.trackingNumber']     = trackingNumber;
    if (trackingUrl        !== undefined) shippingFields['shippingDetails.trackingUrl']        = trackingUrl;
    if (estimatedDelivery  !== undefined) shippingFields['shippingDetails.estimatedDelivery']  = estimatedDelivery ? new Date(estimatedDelivery) : null;
    if (dispatchedAt       !== undefined) shippingFields['shippingDetails.dispatchedAt']       = dispatchedAt ? new Date(dispatchedAt) : null;
    if (shippingNotes      !== undefined) shippingFields['shippingDetails.shippingNotes']      = shippingNotes;

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    let statusUpdate = {};
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

/* ─── USERS ─── */

// Get ALL users (both user + admin roles) with pagination + search
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, status } = req.query;
    const query = {};

    if (role) query.role = role;
    if (status === 'active')   query.isActive = true,  query.isBanned = false;
    if (status === 'inactive') query.isActive = false;
    if (status === 'banned')   query.isBanned = true;

    if (search) {
      query.$or = [
        { name:  new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') },
      ];
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password -resetPasswordToken -resetPasswordExpires -loginHistory')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Attach order count per user
    const userIds = users.map(u => u._id);
    const orderCounts = await Order.aggregate([
      { $match: { user: { $in: userIds } } },
      { $group: { _id: '$user', count: { $sum: 1 }, totalSpent: { $sum: '$totalPrice' } } },
    ]);
    const orderCountMap = {};
    orderCounts.forEach(o => { orderCountMap[o._id.toString()] = { count: o.count, totalSpent: o.totalSpent }; });

    const enrichedUsers = users.map(u => ({
      ...u.toObject(),
      orderCount: orderCountMap[u._id.toString()]?.count || 0,
      totalSpent: orderCountMap[u._id.toString()]?.totalSpent || 0,
    }));

    res.json({ success: true, users: enrichedUsers, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single user with full detail + order history + login history
const getUserDetail = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -resetPasswordToken -resetPasswordExpires +loginHistory');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Recent orders
    const orders = await Order.find({ user: req.params.id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('_id totalPrice status createdAt orderItems paymentMethod isPaid');

    // Aggregate stats
    const stats = await Order.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent:  { $sum: '$totalPrice' },
          paidOrders:  { $sum: { $cond: ['$isPaid', 1, 0] } },
        },
      },
    ]);

    res.json({
      success: true,
      user,
      orders,
      stats: stats[0] || { totalOrders: 0, totalSpent: 0, paidOrders: 0 },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update user role (user <-> admin)
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role))
      return res.status(400).json({ success: false, message: 'Role must be user or admin' });

    // Prevent admin from demoting themselves
    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ success: false, message: 'You cannot change your own role' });

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true })
      .select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, user, message: `User role updated to ${role}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Toggle user active/banned status
const toggleUserStatus = async (req, res) => {
  try {
    const { action } = req.body; // 'activate' | 'deactivate' | 'ban' | 'unban'

    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ success: false, message: 'You cannot change your own status' });

    const update = {};
    let message = '';

    if (action === 'activate')   { update.isActive = true;  update.isBanned = false; message = 'User activated'; }
    if (action === 'deactivate') { update.isActive = false;                           message = 'User deactivated'; }
    if (action === 'ban')        { update.isBanned = true;  update.isActive = false;  message = 'User banned'; }
    if (action === 'unban')      { update.isBanned = false; update.isActive = true;   message = 'User unbanned'; }

    if (!message) return res.status(400).json({ success: false, message: 'Invalid action' });

    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, user, message });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin reset a user's password
const adminResetUserPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'User password reset successfully' });
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
      newUsersThisMonth,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([{ $match: { isPaid: true } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
      Product.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'user' }),
      Order.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(5),
      Product.find({ isActive: true }).sort({ soldCount: -1 }).limit(5),
      Order.aggregate([
        { $match: { isPaid: true } },
        { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, revenue: { $sum: '$totalPrice' }, orders: { $sum: 1 } } },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 6 },
      ]),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      User.countDocuments({
        role: 'user',
        createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      }),
    ]);

    res.json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue:     revenueAgg[0]?.total || 0,
        totalProducts,
        totalUsers,
        newUsersThisMonth,
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

module.exports = {
  createProduct, updateProduct, deleteProduct,
  getAllOrders, getOrderById, updateOrderStatus, updateShippingDetails,
  getAllUsers, getUserDetail, updateUserRole, toggleUserStatus, adminResetUserPassword,
  getDashboardStats,
};
