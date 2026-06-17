const express = require('express');
const multer = require('multer');
const path = require('path');
const { verifyToken, requireRole } = require('../middlewares/auth');
const placeController = require('../controllers/placeController');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

const router = express.Router();

// Public routes
router.get('/', placeController.getPlaces);
router.get('/admin/all', verifyToken, requireRole('admin'), placeController.getAdminPlaces);
router.put('/:id/approve', verifyToken, requireRole('admin'), placeController.approvePlace);
router.put('/:id/reject', verifyToken, requireRole('admin'), placeController.rejectPlace);
router.get('/:id', placeController.getPlace);
router.post('/:id/reviews', verifyToken, requireRole('user', 'owner', 'admin'), placeController.createReview);
router.post('/:id/reviews/:reviewId/replies', verifyToken, requireRole('user', 'owner', 'admin'), placeController.createReviewReply);

// Admin and Owner routes
router.post('/', verifyToken, requireRole('admin', 'owner'), upload.array('images', 5), placeController.createPlace);
router.put('/:id', verifyToken, requireRole('admin', 'owner'), upload.array('images', 5), placeController.updatePlace);
router.delete('/:id', verifyToken, requireRole('admin'), placeController.deletePlace);

module.exports = router;
