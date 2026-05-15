const Category = require('../models/Category');

// @desc    Get all categories
// @route   GET /api/categories
// @access   Public
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        
        console.log('Available categories:', categories.map(c => ({ name: c.name, icon: c.icon, id: c._id })));

        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch categories'
        });
    }
};
