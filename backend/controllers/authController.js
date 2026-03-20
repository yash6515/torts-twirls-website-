const User = require('../models/User');
const jwt  = require('jsonwebtoken');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

/* ─── AUTH ─── */

const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });

    if (await User.findOne({ email }))
      return res.status(400).json({ success: false, message: 'User already exists with this email' });

    const user  = await User.create({ name, email, password, phone });
    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Please provide email and password' });

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    if (!user.isActive)
      return res.status(401).json({ success: false, message: 'Account has been deactivated' });

    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist', 'name price discountPrice images');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!(await user.comparePassword(currentPassword)))
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─── ADDRESS BOOK ─── */

// GET all addresses
const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('addresses');
    res.json({ success: true, addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST — add a new address (max 5)
const addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.addresses.length >= 5)
      return res.status(400).json({ success: false, message: 'Maximum 5 saved addresses allowed' });

    const {
      label = 'Home', type = 'home',
      name, phone, addressLine1, addressLine2,
      city, state, pincode, isDefault = false,
    } = req.body;

    // Validate required fields
    if (!name || !phone || !addressLine1 || !city || !state || !pincode)
      return res.status(400).json({ success: false, message: 'Please fill all required address fields' });

    // If new address is default, clear others
    if (isDefault) {
      user.addresses.forEach(a => { a.isDefault = false; });
    }

    // If no addresses yet, force default
    const forceDefault = user.addresses.length === 0 ? true : isDefault;

    user.addresses.push({
      label, type, name, phone,
      addressLine1, addressLine2,
      city, state, pincode,
      isDefault: forceDefault,
    });

    await user.save();
    res.status(201).json({ success: true, addresses: user.addresses, message: 'Address added successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT — update an existing address
const updateAddress = async (req, res) => {
  try {
    const user    = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.addressId);

    if (!address)
      return res.status(404).json({ success: false, message: 'Address not found' });

    const {
      label, type, name, phone,
      addressLine1, addressLine2,
      city, state, pincode, isDefault,
    } = req.body;

    if (isDefault) {
      user.addresses.forEach(a => { a.isDefault = false; });
    }

    if (label !== undefined)        address.label        = label;
    if (type  !== undefined)        address.type         = type;
    if (name  !== undefined)        address.name         = name;
    if (phone !== undefined)        address.phone        = phone;
    if (addressLine1 !== undefined) address.addressLine1 = addressLine1;
    if (addressLine2 !== undefined) address.addressLine2 = addressLine2;
    if (city  !== undefined)        address.city         = city;
    if (state !== undefined)        address.state        = state;
    if (pincode !== undefined)      address.pincode      = pincode;
    if (isDefault !== undefined)    address.isDefault    = isDefault;

    await user.save();
    res.json({ success: true, addresses: user.addresses, message: 'Address updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE — remove an address
const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.addressId);

    if (!address)
      return res.status(404).json({ success: false, message: 'Address not found' });

    const wasDefault = address.isDefault;
    user.addresses.pull(req.params.addressId);

    // If deleted address was default, assign default to first remaining
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    res.json({ success: true, addresses: user.addresses, message: 'Address removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH — set an address as default
const setDefaultAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.addressId);

    if (!address)
      return res.status(404).json({ success: false, message: 'Address not found' });

    user.addresses.forEach(a => { a.isDefault = false; });
    address.isDefault = true;

    await user.save();
    res.json({ success: true, addresses: user.addresses, message: 'Default address updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  register, login, getMe,
  updateProfile, changePassword,
  getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress,
};
