const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:     String,
  image:    String,
  price:    Number,
  quantity: { type: Number, required: true, min: 1 },
  size:     String,
  color:    String,
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  orderItems: [orderItemSchema],

  shippingAddress: {
    name:         { type: String, required: true },
    phone:        { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: String,
    city:         { type: String, required: true },
    state:        { type: String, required: true },
    pincode:      { type: String, required: true },
  },

  // ── Admin-managed shipping details ──
  shippingDetails: {
    courierName:       { type: String, default: '' },      // e.g. "Delhivery", "BlueDart"
    trackingNumber:    { type: String, default: '' },
    trackingUrl:       { type: String, default: '' },      // full URL to track
    estimatedDelivery: { type: Date, default: null },
    dispatchedAt:      { type: Date, default: null },
    deliveredAt:       { type: Date, default: null },
    shippingNotes:     { type: String, default: '' },      // internal notes
  },

  paymentMethod: {
    type: String,
    required: true,
    enum: ['razorpay', 'stripe', 'cod'],
  },
  paymentResult: {
    id:         String,
    status:     String,
    updateTime: String,
    orderId:    String,
    signature:  String,
  },

  itemsPrice:    { type: Number, required: true, default: 0 },
  shippingPrice: { type: Number, required: true, default: 0 },
  taxPrice:      { type: Number, required: true, default: 0 },
  totalPrice:    { type: Number, required: true, default: 0 },

  isPaid:   { type: Boolean, default: false },
  paidAt:   Date,

  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'],
  },

  returnStatus: {
    type: String,
    enum: ['none', 'pending', 'approved', 'rejected'],
    default: 'none',
  },
  returnReason:    { type: String, default: '' },
  returnRequestedAt: { type: Date, default: null },
  returnProcessedAt: { type: Date, default: null },

  customerNotes:  { type: String, default: '' },  // from customer at checkout
  adminNotes:     { type: String, default: '' },  // internal admin notes
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
