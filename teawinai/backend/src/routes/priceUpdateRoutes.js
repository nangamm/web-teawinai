const express = require('express');
const { verifyToken, requireRole } = require('../middlewares/auth');
const priceUpdateController = require('../controllers/priceUpdateController');

const router = express.Router();

// Owner routes
router.post('/', verifyToken, requireRole('owner', 'admin'), priceUpdateController.submitPriceUpdate);

// Admin routes
router.get('/pending', verifyToken, requireRole('admin'), priceUpdateController.getPendingUpdates);
router.put('/:id/approve', verifyToken, requireRole('admin'), priceUpdateController.approvePriceUpdate);
router.put('/:id/reject', verifyToken, requireRole('admin'), priceUpdateController.rejectPriceUpdate);

module.exports = router;
