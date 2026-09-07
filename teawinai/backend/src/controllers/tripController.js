const TripPlan = require('../models/TripPlan');
const TripItem = require('../models/TripItem');
const Place = require('../models/Place');
const { selectPlacesByBudget } = require('../utils/budgetAlgorithm');

// @desc    Create trip plan from budget
// @route   POST /api/trips/plan
// @access   Public
exports.planTrip = async (req, res) => {
    try {
        const {
            budget,
            categories = [],
            maxPlaces = 10,
            location = {},
            excludePlaceIds = []
        } = req.body;
        const { province, district, subdistrict } = location;

        if (!budget || budget <= 0) {
            return res.status(400).json({
                success: false,
                message: 'กรุณาระบุงบประมาณที่ถูกต้อง'
            });
        }

        const parsedMaxPlaces = Number(maxPlaces);
        if (!Number.isInteger(parsedMaxPlaces) || parsedMaxPlaces < 1 || parsedMaxPlaces > 20) {
            return res.status(400).json({
                success: false,
                message: 'กรุณาระบุจำนวนสถานที่ 1-20 แห่ง'
            });
        }

        // Build location filter
        const locationFilter = { status: 'active' };
        if (province) locationFilter.province = province;
        if (district) locationFilter.district = district;
        if (subdistrict) locationFilter.subdistrict = subdistrict;

        // Get places filtered by location
        const places = await Place.find(locationFilter)
            .populate('category', 'name icon')
            .lean();

        // Use budget algorithm to select places
        let result = selectPlacesByBudget(places, budget, {
            categories,
            maxPlaces: parsedMaxPlaces,
            excludePlaceIds
        });

        // Start a new rotation when all matching places were already used.
        if (result.selectedPlaces.length === 0 && Array.isArray(excludePlaceIds) && excludePlaceIds.length > 0) {
            result = selectPlacesByBudget(places, budget, {
                categories,
                maxPlaces: parsedMaxPlaces
            });
        }

        res.json({
            success: true,
            data: result,
            message: 'คำนวณแผนการเดินทางสำเร็จ'
        });
    } catch (error) {
        console.error('Plan trip error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการคำนวณแผนการเดินทาง'
        });
    }
};

// @desc    Save trip plan
// @route   POST /api/trips/save
// @access   Private
exports.saveTrip = async (req, res) => {
    try {
        const { 
            trip_name,
            budget_total, 
            trip_date, 
            selectedPlaces = [],
            categories = [],
            max_places = 10,
            status = 'saved' 
        } = req.body;

        if (!budget_total || budget_total <= 0) {
            return res.status(400).json({
                success: false,
                message: 'กรุณาระบุงบประมาณที่ถูกต้อง'
            });
        }

        if (!trip_date) {
            return res.status(400).json({
                success: false,
                message: 'กรุณาระบุวันที่เดินทาง'
            });
        }

        if (!trip_name || trip_name.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'กรุณาระบุชื่อทริป'
            });
        }

        if (!Array.isArray(selectedPlaces) || selectedPlaces.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'กรุณาเลือกสถานที่ท่องเที่ยว'
            });
        }

        // Calculate total estimated cost
        const budget_used = selectedPlaces.reduce((total, place) => {
            return total + (place.estimated_cost || place.price_min || 0);
        }, 0);

        // Create trip plan
        const tripPlan = await TripPlan.create({
            user_id: req.user.id,
            trip_name: trip_name.trim(),
            budget_total,
            budget_used,
            categories,
            max_places,
            trip_date: new Date(trip_date),
            status
        });

        // Create trip items
        const tripItems = selectedPlaces.map((place, index) => ({
            trip_id: tripPlan._id,
            place_id: place._id || place.place_id,
            order: index + 1,
            estimated_cost: place.estimated_cost || place.price_min || 0,
            note: place.note || ''
        }));

        await TripItem.insertMany(tripItems);

        // Return populated trip plan
        const savedTrip = await TripPlan.findById(tripPlan._id)
            .populate({
                path: 'trip_items',
                populate: {
                    path: 'place_id',
                    populate: {
                        path: 'category',
                        select: 'name icon'
                    }
                }
            });

        res.status(201).json({
            success: true,
            data: savedTrip,
            message: 'บันทึกแผนการเดินทางสำเร็จ'
        });
    } catch (error) {
        console.error('Save trip error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการบันทึกแผนการเดินทาง'
        });
    }
};

// @desc    Get user's trips
// @route   GET /api/trips/my
// @access   Private
exports.getMyTrips = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        
        // Build query
        const query = { user_id: req.user.id };
        if (status) {
            query.status = status;
        }

        const trips = await TripPlan.find(query)
            .populate({
                path: 'trip_items',
                populate: {
                    path: 'place_id',
                    populate: {
                        path: 'category',
                        select: 'name icon'
                    }
                },
                options: { sort: { order: 1 } }
            })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ trip_date: -1 })
            .lean();

        const total = await TripPlan.countDocuments(query);

        res.json({
            success: true,
            data: trips,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get my trips error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงข้อมูลแผนการเดินทาง'
        });
    }
};

// @desc    Delete trip
// @route   DELETE /api/trips/:id
// @access   Private
exports.deleteTrip = async (req, res) => {
    try {
        const trip = await TripPlan.findById(req.params.id);

        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบแผนการเดินทางที่ต้องการ'
            });
        }

        // Check if user owns the trip
        if (trip.user_id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'ไม่มีสิทธิ์ลบแผนการเดินทางนี้'
            });
        }

        // Delete trip items first
        await TripItem.deleteMany({ trip_id: req.params.id });

        // Delete trip plan
        await trip.deleteOne();

        res.json({
            success: true,
            message: 'ลบแผนการเดินทางสำเร็จ'
        });
    } catch (error) {
        console.error('Delete trip error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการลบแผนการเดินทาง'
        });
    }
};
