const express = require('express');
const { verifyToken, requireRole } = require('../middlewares/auth');
const authController = require('../controllers/authController');

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Private routes
router.get('/me', verifyToken, authController.getMe);
router.put('/profile', verifyToken, authController.upload.single('avatar'), authController.updateProfile);
router.get('/places', verifyToken, authController.getUserPlaces);
router.get('/reviews', verifyToken, authController.getUserReviews);

// Admin only routes
router.get('/users', verifyToken, requireRole('admin'), authController.getUsers);
router.get('/dashboard/stats', verifyToken, requireRole('admin'), authController.getDashboardStats);

module.exports = router;
