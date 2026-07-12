const express = require('express');
const multer = require('multer');
const { verifyToken, requireRole } = require('../middlewares/auth');
const placeController = require('../controllers/placeController');
const { storage, imageFileFilter } = require('../config/cloudinary');

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: imageFileFilter
});

const router = express.Router();

// Public routes
router.get('/', placeController.getPlaces);
router.get('/reviews/home', placeController.getHomeReviews);
router.get('/admin/all', verifyToken, requireRole('admin'), placeController.getAdminPlaces);
router.put('/:id/approve', verifyToken, requireRole('admin'), placeController.approvePlace);
router.put('/:id/reject', verifyToken, requireRole('admin'), placeController.rejectPlace);
router.get('/:id/promotions', placeController.getPlacePromotions);
router.get('/:id', placeController.getPlace);
router.post('/:id/reviews', verifyToken, requireRole('user', 'owner', 'admin'), placeController.createReview);
router.post('/:id/reviews/:reviewId/replies', verifyToken, requireRole('user', 'owner', 'admin'), placeController.createReviewReply);

// Admin and Owner routes
router.post('/', verifyToken, requireRole('admin', 'owner'), upload.array('images', 5), placeController.createPlace);
router.put('/:id', verifyToken, requireRole('admin', 'owner'), upload.array('images', 5), placeController.updatePlace);
router.delete('/:id', verifyToken, requireRole('admin'), placeController.deletePlace);

module.exports = router;
