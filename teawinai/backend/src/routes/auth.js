const express = require('express');
const multer = require('multer');
const { verifyToken, requireRole } = require('../middlewares/auth');
const authController = require('../controllers/authController');

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Private routes
router.get('/me', verifyToken, authController.getMe);
router.put('/profile', verifyToken, (req, res, next) => {
  console.log('Profile update request received');
  authController.upload.single('avatar')(req, res, (err) => {
    if (err) {
      console.error('Multer/Cloudinary error:', err);
      const isUploadValidationError =
        err instanceof multer.MulterError ||
        err.message === 'Only JPG, PNG, and WEBP image files are allowed';

      return res.status(isUploadValidationError ? 400 : 502).json({
        success: false,
        message: 'File upload failed',
        error: err.message
      });
    }
    next();
  });
}, authController.updateProfile);
router.get('/places', verifyToken, authController.getUserPlaces);
router.get('/reviews', verifyToken, authController.getUserReviews);
router.get('/notifications', verifyToken, authController.getNotifications);
router.put('/notifications/read', verifyToken, authController.markNotificationsRead);

// Admin only routes
router.get('/users', verifyToken, requireRole('admin'), authController.getUsers);
router.post('/users', verifyToken, requireRole('admin'), authController.createUser);
router.get('/dashboard/stats', verifyToken, requireRole('admin'), authController.getDashboardStats);

module.exports = router;
