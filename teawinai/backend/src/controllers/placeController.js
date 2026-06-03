const Place = require('../models/Place');
const Category = require('../models/Category');
const Review = require('../models/Review');
const User = require('../models/User');
const { hasInappropriateContent } = require('../utils/contentModeration');

const populatePlace = (query) => query
    .populate('category', 'name icon')
    .populate('submitted_by', 'name email');

const attachReviews = async (place) => {
    if (!place) return null;

    const reviews = await Review.find({ place: place._id })
        .populate('user', 'name username avatar role')
        .populate('replies.user', 'name username avatar role')
        .sort({ createdAt: -1 });

    const placeData = place.toObject ? place.toObject() : place;
    placeData.reviews = reviews;
    placeData.review_count = reviews.length;
    placeData.reviews_count = reviews.length;
    return placeData;
};

const refreshPlaceRating = async (placeId) => {
    const result = await Review.aggregate([
        { $match: { place: placeId } },
        {
            $group: {
                _id: '$place',
                averageRating: { $avg: '$rating' },
                reviewCount: { $sum: 1 }
            }
        }
    ]);

    const rating = result.length ? Number(result[0].averageRating.toFixed(1)) : 0;
    await Place.findByIdAndUpdate(placeId, { rating });
    return rating;
};

// @desc    Get all places
// @route   GET /api/places
// @access   Public
exports.getPlaces = async (req, res) => {
    try {
        const { category, status = 'active', page = 1, limit = 50, search, province, district, subdistrict } = req.query;
        
        console.log('Get places query params:', { category, status, page, limit, search, province, district, subdistrict });
        
        // Build query
        let query = { status };
        
        if (search) {
            query.name = { $regex: search, $options: 'i' }; // Case-insensitive search
        }
        
        if (province) {
            query.province = province;
        }
        
        if (district) {
            query.district = district;
        }
        
        if (subdistrict) {
            query.subdistrict = subdistrict;
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

        const places = await populatePlace(Place.find(query))
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
        const place = await populatePlace(Place.findById(req.params.id));

        if (!place) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบสถานที่ที่ต้องการ'
            });
        }

        res.json({
            success: true,
            data: await attachReviews(place)
        });
    } catch (error) {
        console.error('Get place error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถานที่'
        });
    }
};

// @desc    Add or update a place review
// @route   POST /api/places/:id/reviews
// @access   User, Owner, Admin
exports.createReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const place = await Place.findById(req.params.id);

        if (!place) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบสถานที่ที่ต้องการ'
            });
        }

        const parsedRating = Number(rating);
        if (!Number.isFinite(parsedRating) || parsedRating < 1 || parsedRating > 5) {
            return res.status(400).json({
                success: false,
                message: 'กรุณาให้คะแนนตั้งแต่ 1 ถึง 5'
            });
        }

        if (!comment || comment.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'กรุณาเขียนความคิดเห็นอย่างน้อย 2 ตัวอักษร'
            });
        }

        if (hasInappropriateContent(comment)) {
            return res.status(400).json({
                success: false,
                message: 'ความคิดเห็นมีคำไม่สุภาพ ไม่เหมาะสม หรือสื่อไปทางเพศ กรุณาแก้ไขข้อความ'
            });
        }

        const existingReview = await Review.findOne({ place: place._id, user: req.user.id });
        const review = await Review.findOneAndUpdate(
            { place: place._id, user: req.user.id },
            {
                $set: {
                    rating: parsedRating,
                    comment: comment.trim()
                },
                $setOnInsert: {
                    place: place._id,
                    user: req.user.id
                }
            },
            {
                new: true,
                upsert: true,
                runValidators: true,
                setDefaultsOnInsert: true
            }
        );

        if (!existingReview) {
            await User.findByIdAndUpdate(req.user.id, { $inc: { 'stats.reviews': 1 } });
        }

        await refreshPlaceRating(place._id);

        const updatedPlace = await populatePlace(Place.findById(place._id));
        const placeWithReviews = await attachReviews(updatedPlace);

        res.status(existingReview ? 200 : 201).json({
            success: true,
            data: placeWithReviews,
            review,
            message: existingReview ? 'อัปเดตความคิดเห็นสำเร็จ' : 'เพิ่มความคิดเห็นสำเร็จ'
        });
    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการบันทึกความคิดเห็น'
        });
    }
};

// @desc    Reply to a place review
// @route   POST /api/places/:id/reviews/:reviewId/replies
// @access   User, Owner, Admin
exports.createReviewReply = async (req, res) => {
    try {
        const { comment } = req.body;
        const place = await Place.findById(req.params.id);

        if (!place) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบสถานที่ที่ต้องการ'
            });
        }

        const review = await Review.findOne({ _id: req.params.reviewId, place: place._id });
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบความคิดเห็นที่ต้องการตอบกลับ'
            });
        }

        if (!comment || comment.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'กรุณาเขียนคำตอบกลับอย่างน้อย 2 ตัวอักษร'
            });
        }

        if (hasInappropriateContent(comment)) {
            return res.status(400).json({
                success: false,
                message: 'คำตอบกลับมีคำไม่สุภาพ ไม่เหมาะสม หรือสื่อไปทางเพศ กรุณาแก้ไขข้อความ'
            });
        }

        review.replies.push({
            user: req.user.id,
            comment: comment.trim()
        });
        await review.save();

        const updatedPlace = await populatePlace(Place.findById(place._id));
        const placeWithReviews = await attachReviews(updatedPlace);

        res.status(201).json({
            success: true,
            data: placeWithReviews,
            message: 'เพิ่มคำตอบกลับสำเร็จ'
        });
    } catch (error) {
        console.error('Create review reply error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการบันทึกคำตอบกลับ'
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

        // Validate required location fields
        if (!placeData.province || !placeData.district || !placeData.subdistrict) {
            return res.status(400).json({
                success: false,
                message: 'กรุณาระบุจังหวัด อำเภอ และตำบล'
            });
        }

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

        // Build update data from req.body (start with a copy)
        const updateData = { ...req.body };

        // Handle opening_hours from FormData (parse JSON string)
        if (updateData.opening_hours && typeof updateData.opening_hours === 'string') {
            try {
                updateData.opening_hours = JSON.parse(updateData.opening_hours);
            } catch (error) {
                console.error('Error parsing opening_hours in update:', error);
                updateData.opening_hours = {};
            }
        }

        // Handle is_free field
        if (updateData.is_free === 'true' || updateData.is_free === true) {
            updateData.is_free = updateData.is_free === 'true' || updateData.is_free === true;
            updateData.price_min = 0;
            updateData.price_max = 0;
        }

        // Handle image uploads (new images from multer)
        if (req.files && req.files.length > 0) {
            const newImagePaths = req.files.map(file => `/uploads/${file.filename}`);
            // Merge with existing images if provided via existing_images field
            const existingImages = updateData.existing_images
                ? (typeof updateData.existing_images === 'string'
                    ? [updateData.existing_images]
                    : updateData.existing_images)
                : [];
            updateData.images = [...existingImages, ...newImagePaths];
        }
        // Remove transient fields that shouldn't go to MongoDB
        delete updateData.existing_images;

        place = await Place.findByIdAndUpdate(
            req.params.id,
            updateData,
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
