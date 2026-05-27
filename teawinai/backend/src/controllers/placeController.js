const Place = require('../models/Place');
const Category = require('../models/Category');

// @desc    Get all places
// @route   GET /api/places
// @access   Public
exports.getPlaces = async (req, res) => {
    try {
        const { category, status = 'active', page = 1, limit = 50, search } = req.query;
        
        console.log('Get places query params:', { category, status, page, limit, search });
        
        // Build query
        let query = { status };
        
        if (search) {
            query.name = { $regex: search, $options: 'i' }; // Case-insensitive search
        }
        
        if (category) {
            // Check if category is ObjectId or name
            if (category.match(/^[0-9a-fA-F]{24}$/)) {
                // It's an ObjectId, use directly
                query.category = category;
            } else {
                // It's a name, find the ObjectId
                const categoryDoc = await Category.findOne({ name: category });
                if (categoryDoc) {
                    query.category = categoryDoc._id;
                }
            }
        }

        console.log('MongoDB query:', query);

        const total = await Place.countDocuments(query);
        console.log('Total places in database:', total);

        const places = await Place.find(query)
            .populate('category', 'name icon')
            .populate('submitted_by', 'name email')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ rating: -1 });

        console.log('Places returned:', places.length, 'out of', total);

        res.json({
            success: true,
            data: places,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get places error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถานที่'
        });
    }
};

// @desc    Get single place
// @route   GET /api/places/:id
// @access   Public
exports.getPlace = async (req, res) => {
    try {
        const place = await Place.findById(req.params.id)
            .populate('category', 'name icon')
            .populate('submitted_by', 'name email');

        if (!place) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบสถานที่ที่ต้องการ'
            });
        }

        res.json({
            success: true,
            data: place
        });
    } catch (error) {
        console.error('Get place error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถานที่'
        });
    }
};

// @desc    Create place
// @route   POST /api/places
// @access   Admin only
exports.createPlace = async (req, res) => {
    try {
        console.log('=== CREATE PLACE DEBUG ===');
        console.log('Request headers:', req.headers);
        console.log('Request body:', req.body);
        console.log('Request user:', req.user);
        console.log('Request files:', req.files);
        console.log('File array length:', req.files ? req.files.length : 'undefined');
        
        // Check if this is FormData
        if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
            console.log('This is a FormData request');
        } else {
            console.log('This is NOT a FormData request');
        }
        
        const placeData = {
            ...req.body,
            submitted_by: req.user.id
        };

        // Handle both map_link and google_map_link for backward compatibility
        if (req.body.map_link) {
            placeData.map_link = req.body.map_link;
            placeData.google_map_link = req.body.map_link; // Copy to old field for compatibility
        } else if (req.body.google_map_link) {
            placeData.map_link = req.body.google_map_link;
            placeData.google_map_link = req.body.google_map_link;
        }

        // Handle opening_hours from FormData
        if (req.body.opening_hours) {
            try {
                placeData.opening_hours = JSON.parse(req.body.opening_hours);
                console.log('Parsed opening_hours:', placeData.opening_hours);
            } catch (error) {
                console.error('Error parsing opening_hours:', error);
                placeData.opening_hours = {};
            }
        } else {
            placeData.opening_hours = {};
        }

        // Handle is_free field
        if (req.body.is_free === 'true' || req.body.is_free === true) {
            placeData.is_free = req.body.is_free === 'true';
            // For free places, set prices to 0
            placeData.price_min = 0;
            placeData.price_max = 0;
        } else {
            placeData.is_free = false;
            // For paid places, validate and use provided prices
            if (!req.body.price_min || !req.body.price_max) {
                return res.status(400).json({
                    success: false,
                    message: 'กรุณาระบุราคาสำหรับสถานที่ที่เสียค่าใช้จ่าย'
                });
            }
        }

        // Handle image uploads
        if (req.files && req.files.length > 0) {
            placeData.images = req.files.map(file => `/uploads/${file.filename}`);
            console.log('Image paths:', placeData.images);
        } else {
            placeData.images = [];
            console.log('No files uploaded, setting images to empty array');
        }

        console.log('Final place data to create:', placeData);

        // Validate category exists
        const category = await Category.findById(placeData.category);
        if (!category) {
            return res.status(400).json({
                success: false,
                message: 'ไม่พบหมวดหมู่ที่ระบุ'
            });
        }

        let place;
        try {
            place = await Place.create(placeData);
            console.log('Place created successfully:', place);
        } catch (validationError) {
            console.error('Validation error:', validationError);
            // Handle Mongoose validation errors
            if (validationError.name === 'ValidationError') {
                const errors = Object.values(validationError.errors).map(err => err.message);
                return res.status(400).json({
                    success: false,
                    message: 'ข้อมูลไม่ถูกต้อง: ' + errors.join(', ')
                });
            }
            throw validationError;
        }
        
        const populatedPlace = await Place.findById(place._id)
            .populate('category', 'name icon')
            .populate('submitted_by', 'name email');

        console.log('Populated place to return:', populatedPlace);

        res.status(201).json({
            success: true,
            data: populatedPlace,
            message: 'เพิ่มสถานที่สำเร็จ'
        });
    } catch (error) {
        console.error('Create place error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการเพิ่มสถานที่'
        });
    }
};

// @desc    Update place
// @route   PUT /api/places/:id
// @access   Admin only
exports.updatePlace = async (req, res) => {
    try {
        let place = await Place.findById(req.params.id);

        if (!place) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบสถานที่ที่ต้องการ'
            });
        }

        // Validate category if provided
        if (req.body.category) {
            const category = await Category.findById(req.body.category);
            if (!category) {
                return res.status(400).json({
                    success: false,
                    message: 'ไม่พบหมวดหมู่ที่ระบุ'
                });
            }
        }

        place = await Place.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('category', 'name icon')
         .populate('submitted_by', 'name email');

        res.json({
            success: true,
            data: place,
            message: 'แก้ไขสถานที่สำเร็จ'
        });
    } catch (error) {
        console.error('Update place error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการแก้ไขสถานที่'
        });
    }
};

// @desc    Delete place
// @route   DELETE /api/places/:id
// @access   Admin only
exports.deletePlace = async (req, res) => {
    try {
        const place = await Place.findById(req.params.id);

        if (!place) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบสถานที่ที่ต้องการ'
            });
        }

        await place.deleteOne();

        res.json({
            success: true,
            message: 'ลบสถานที่สำเร็จ'
        });
    } catch (error) {
        console.error('Delete place error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการลบสถานที่'
        });
    }
};
