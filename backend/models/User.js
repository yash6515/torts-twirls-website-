const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const crypto   = require('crypto');

const addressSchema = new mongoose.Schema({
  label:        { type: String, default: 'Home', trim: true },
  type:         { type: String, enum: ['home', 'work', 'other'], default: 'home' },
  name:         { type: String, required: true, trim: true },
  phone:        { type: String, required: true, trim: true },
  addressLine1: { type: String, required: true, trim: true },
  addressLine2: { type: String, default: '', trim: true },
  city:         { type: String, required: true, trim: true },
  state:        { type: String, required: true, trim: true },
  pincode:      { type: String, required: true, trim: true },
  isDefault:    { type: Boolean, default: false },
}, { timestamps: true });

const loginHistorySchema = new mongoose.Schema({
  ip:        { type: String, default: '' },
  userAgent: { type: String, default: '' },
  location:  { type: String, default: '' },
  status:    { type: String, enum: ['success', 'failed'], default: 'success' },
  loginAt:   { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  phone:    { type: String, default: '', trim: true },
  avatar:   { type: String, default: '' },
  role:     { type: String, enum: ['user', 'admin'], default: 'user' },

  addresses:    [addressSchema],
  wishlist:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],

  isActive:     { type: Boolean, default: true },
  isBanned:     { type: Boolean, default: false },

  // Password reset
  resetPasswordToken:   { type: String, default: undefined },
  resetPasswordExpires: { type: Date,   default: undefined },

  // Login tracking
  lastLogin:    { type: Date, default: null },
  loginHistory: { type: [loginHistorySchema], default: [], select: false },
  loginCount:   { type: Number, default: 0 },

}, { timestamps: true });

// ── Hash password before save ──
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Generate a password reset token (plain token returned, hashed stored)
userSchema.methods.createPasswordResetToken = function () {
  const plainToken  = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken   = crypto.createHash('sha256').update(plainToken).digest('hex');
  this.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
  return plainToken;
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  delete obj.loginHistory;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
