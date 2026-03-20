const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema({
  label: {
    type: String,
    default: 'Home',
    trim: true,
  },
  type: {
    type: String,
    enum: ['home', 'work', 'other'],
    default: 'home',
  },
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  addressLine1: { type: String, required: true, trim: true },
  addressLine2: { type: String, default: '', trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  pincode: { type: String, required: true, trim: true },
  isDefault: { type: Boolean, default: false },
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  phone:    { type: String, default: '', trim: true },
  avatar:   { type: String, default: '' },
  role:     { type: String, enum: ['user', 'admin'], default: 'user' },
  addresses: [addressSchema],
  wishlist:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  isActive:  { type: Boolean, default: true },
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
