const crypto    = require('crypto');
const User      = require('../models/User');
const jwt       = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

/* ─────────────────────────────────────
   AUTH
───────────────────────────────────── */

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
      success: true, token,
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

    const user = await User.findOne({ email }).select('+loginHistory');
    const ip        = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    if (!user || !(await user.comparePassword(password))) {
      // Record failed attempt if user exists
      if (user) {
        user.loginHistory.push({ ip, userAgent, status: 'failed' });
        if (user.loginHistory.length > 20) user.loginHistory.shift();
        await user.save();
      }
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive || user.isBanned)
      return res.status(401).json({ success: false, message: 'Account has been suspended. Contact support.' });

    // Record successful login
    user.lastLogin = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    user.loginHistory.push({ ip, userAgent, status: 'success' });
    if (user.loginHistory.length > 20) user.loginHistory.shift();
    await user.save();

    const token = generateToken(user._id);
    res.json({
      success: true, token,
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
    const user = await User.findByIdAndUpdate(req.user._id, { name, phone }, { new: true, runValidators: true });
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

/* ─────────────────────────────────────
   FORGOT / RESET PASSWORD
───────────────────────────────────── */

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ success: false, message: 'Please provide your email address' });

    const user = await User.findOne({ email });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account with that email exists, a reset link has been sent.',
      });
    }

    // Generate reset token
    const plainToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Build the reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${plainToken}`;

    // Send email if SMTP is configured, otherwise fall back to dev mode
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        await sendEmail({
          to: user.email,
          subject: 'Torts & Twirls — Password Reset',
          html: `
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #FAFAF7; border-radius: 12px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="display: inline-block; background: #1B4332; color: #FAFAF7; font-family: Georgia, serif; font-style: italic; font-size: 20px; padding: 12px 20px; border-radius: 8px;">T&T</div>
              </div>
              <h2 style="color: #1A2316; margin-bottom: 16px; font-family: Georgia, serif;">Reset Your Password</h2>
              <p style="color: #6B5E4E; font-size: 14px; line-height: 1.6;">
                Hi ${user.name.split(' ')[0]}, we received a request to reset your password.
                Click the button below to choose a new one. This link expires in <strong>30 minutes</strong>.
              </p>
              <a href="${resetUrl}" style="display: inline-block; margin: 24px 0; padding: 14px 32px; background: #1B4332; color: #FAFAF7; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 500;">
                Reset Password →
              </a>
              <p style="color: #A09278; font-size: 12px; line-height: 1.5;">
                If you didn't request this, you can safely ignore this email.<br/>
                Or copy this link: <a href="${resetUrl}" style="color: #40916C;">${resetUrl}</a>
              </p>
              <hr style="border: none; border-top: 1px solid #E8D9C0; margin: 24px 0;"/>
              <p style="color: #A09278; font-size: 11px; text-align: center;">Torts & Twirls India · Premium Bedsheets</p>
            </div>
          `,
        });
      } catch (emailErr) {
        // Log error but don't fail the request — token is already saved
        console.error('Failed to send password reset email:', emailErr.message);
      }
    } else {
      // Dev mode: log to console
      console.log('🔑 Password reset link:', resetUrl);
    }

    res.json({
      success: true,
      message: 'If an account with that email exists, a reset link has been sent.',
      // Only expose token in development when SMTP is not configured
      ...(!process.env.SMTP_HOST && process.env.NODE_ENV !== 'production' && {
        devResetUrl: resetUrl,
        devNote: 'SMTP not configured. This URL is only shown in development mode.',
      }),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const verifyResetToken = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken:   hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ success: false, message: 'Reset link is invalid or has expired' });

    res.json({ success: true, message: 'Token is valid', email: user.email });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;

    if (!password)
      return res.status(400).json({ success: false, message: 'Please provide a new password' });

    if (password !== confirmPassword)
      return res.status(400).json({ success: false, message: 'Passwords do not match' });

    if (password.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken:   hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ success: false, message: 'Reset link is invalid or has expired' });

    // Update password and clear reset fields
    user.password             = password;
    user.resetPasswordToken   = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Auto-login after reset
    const token = generateToken(user._id);
    res.json({
      success: true,
      message: 'Password reset successful! You are now logged in.',
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────
   ADDRESS BOOK
───────────────────────────────────── */

const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('addresses');
    res.json({ success: true, addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.addresses.length >= 5)
      return res.status(400).json({ success: false, message: 'Maximum 5 saved addresses allowed' });

    const { label='Home', type='home', name, phone, addressLine1, addressLine2, city, state, pincode, isDefault=false } = req.body;
    if (!name || !phone || !addressLine1 || !city || !state || !pincode)
      return res.status(400).json({ success: false, message: 'Please fill all required address fields' });

    if (isDefault) user.addresses.forEach(a => { a.isDefault = false; });
    const forceDefault = user.addresses.length === 0 ? true : isDefault;

    user.addresses.push({ label, type, name, phone, addressLine1, addressLine2, city, state, pincode, isDefault: forceDefault });
    await user.save();
    res.status(201).json({ success: true, addresses: user.addresses, message: 'Address added successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.addressId);
    if (!address) return res.status(404).json({ success: false, message: 'Address not found' });

    const { label, type, name, phone, addressLine1, addressLine2, city, state, pincode, isDefault } = req.body;
    if (isDefault) user.addresses.forEach(a => { a.isDefault = false; });

    if (label        !== undefined) address.label        = label;
    if (type         !== undefined) address.type         = type;
    if (name         !== undefined) address.name         = name;
    if (phone        !== undefined) address.phone        = phone;
    if (addressLine1 !== undefined) address.addressLine1 = addressLine1;
    if (addressLine2 !== undefined) address.addressLine2 = addressLine2;
    if (city         !== undefined) address.city         = city;
    if (state        !== undefined) address.state        = state;
    if (pincode      !== undefined) address.pincode      = pincode;
    if (isDefault    !== undefined) address.isDefault    = isDefault;

    await user.save();
    res.json({ success: true, addresses: user.addresses, message: 'Address updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.addressId);
    if (!address) return res.status(404).json({ success: false, message: 'Address not found' });

    const wasDefault = address.isDefault;
    user.addresses.pull(req.params.addressId);
    if (wasDefault && user.addresses.length > 0) user.addresses[0].isDefault = true;

    await user.save();
    res.json({ success: true, addresses: user.addresses, message: 'Address removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const setDefaultAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.addressId);
    if (!address) return res.status(404).json({ success: false, message: 'Address not found' });

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
  forgotPassword, verifyResetToken, resetPassword,
  getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress,
};
