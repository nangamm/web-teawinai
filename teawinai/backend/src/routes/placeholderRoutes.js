const express = require('express');
const placeholderController = require('../controllers/placeholderController');

const router = express.Router();

// Public route for placeholder images
router.get('/:width/:height', placeholderController.getPlaceholderImage);

module.exports = router;
