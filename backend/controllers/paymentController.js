const Order = require('../models/Order');

const createRazorpayOrder = async (req, res) => {
  try {
    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const { amount } = req.body;
    const options = {
      amount: Math.round(amount * 100), // paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    res.json({ success: true, order, key: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const verifyRazorpayPayment = async (req, res) => {
  try {
    const crypto = require('crypto');
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    const order = await Order.findByIdAndUpdate(orderId, {
      isPaid: true,
      paidAt: Date.now(),
      status: 'confirmed',
      paymentResult: {
        id: razorpay_payment_id,
        orderId: razorpay_order_id,
        signature: razorpay_signature,
        status: 'captured'
      }
    }, { new: true });

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createStripeIntent = async (req, res) => {
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const { amount } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'inr',
      metadata: { userId: req.user._id.toString() }
    });
    res.json({ success: true, clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createRazorpayOrder, verifyRazorpayPayment, createStripeIntent };
