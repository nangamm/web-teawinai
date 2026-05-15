const express = require('express');
const { verifyToken } = require('../middlewares/auth');
const tripController = require('../controllers/tripController');

const router = express.Router();

// Public routes
router.post('/plan', tripController.planTrip);

// Private routes
router.post('/save', verifyToken, tripController.saveTrip);
router.get('/my', verifyToken, tripController.getMyTrips);
router.delete('/:id', verifyToken, tripController.deleteTrip);

module.exports = router;
