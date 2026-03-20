const express = require('express');
const router  = express.Router();
const {
  register, login, getMe,
  updateProfile, changePassword,
  getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Auth
router.post('/register', register);
router.post('/login',    login);
router.get ('/me',       protect, getMe);
router.put ('/profile',  protect, updateProfile);
router.put ('/password', protect, changePassword);

// Address book
router.get   ('/addresses',                    protect, getAddresses);
router.post  ('/addresses',                    protect, addAddress);
router.put   ('/addresses/:addressId',         protect, updateAddress);
router.delete('/addresses/:addressId',         protect, deleteAddress);
router.patch ('/addresses/:addressId/default', protect, setDefaultAddress);

module.exports = router;
