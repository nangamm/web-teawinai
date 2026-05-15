const PriceUpdate = require('../models/PriceUpdate');
const Place = require('../models/Place');

// @desc    Submit price update request
// @route   POST /api/price-updates
// @access   Owner only
exports.submitPriceUpdate = async (req, res) => {
    try {
        const { 
            place_id, 
            new_price_min, 
            new_price_max, 
            promotion 
        } = req.body;

        if (!place_id || !new_price_min || !new_price_max) {
            return res.status(400).json({
                success: false,
                message: 'กรุณาระบุข้อมูลให้ครบถ้วน'
            });
        }

        if (new_price_min > new_price_max) {
            return res.status(400).json({
                success: false,
                message: 'ราคาต่ำสุดต้องไม่เกินราคาสูงสุด'
            });
        }

        // Check if place exists
        const place = await Place.findById(place_id);
        if (!place) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบสถานที่ที่ระบุ'
            });
        }

        // Check if user is owner of the place
        if (place.submitted_by && place.submitted_by.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'เฉพาะเจ้าของร้านเท่านั้นที่สามารถแก้ไขราคาได้'
            });
        }

        // Create price update request
        const priceUpdate = await PriceUpdate.create({
            place_id,
            owner_id: req.user.id,
            new_price_min,
            new_price_max,
            promotion
        });

        const populatedUpdate = await PriceUpdate.findById(priceUpdate._id)
            .populate('place_id', 'name')
            .populate('owner_id', 'name email');

        res.status(201).json({
            success: true,
            data: populatedUpdate,
            message: 'ส่งคำร้องแก้ไขราคาสำเร็จ'
        });
    } catch (error) {
        console.error('Submit price update error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการส่งคำร้องแก้ไขราคา'
        });
    }
};

// @desc    Get pending price updates
// @route   GET /api/price-updates/pending
// @access   Admin only
exports.getPendingUpdates = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const updates = await PriceUpdate.find({ approval_status: 'pending' })
            .populate('place_id', 'name address')
            .populate('owner_id', 'name email phone')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ submitted_at: -1 });

        const total = await PriceUpdate.countDocuments({ approval_status: 'pending' });

        res.json({
            success: true,
            data: updates,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get pending updates error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงข้อมูลคำร้องแก้ไขราคา'
        });
    }
};

// @desc    Approve price update
// @route   PUT /api/price-updates/:id/approve
// @access   Admin only
exports.approvePriceUpdate = async (req, res) => {
    try {
        const { review_note } = req.body;

        const priceUpdate = await PriceUpdate.findById(req.params.id);

        if (!priceUpdate) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบคำร้องแก้ไขราคาที่ต้องการ'
            });
        }

        if (priceUpdate.approval_status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'คำร้องนี้ถูกดำเนินการแล้ว'
            });
        }

        // Update price update status
        priceUpdate.approval_status = 'approved';
        priceUpdate.reviewed_at = new Date();
        priceUpdate.reviewed_by = req.user.id;
        priceUpdate.review_note = review_note || '';
        await priceUpdate.save();

        // Update place prices
        await Place.findByIdAndUpdate(priceUpdate.place_id, {
            price_min: priceUpdate.new_price_min,
            price_max: priceUpdate.new_price_max
        });

        const populatedUpdate = await PriceUpdate.findById(priceUpdate._id)
            .populate('place_id', 'name')
            .populate('owner_id', 'name email')
            .populate('reviewed_by', 'name email');

        res.json({
            success: true,
            data: populatedUpdate,
            message: 'อนุมัติคำร้องแก้ไขราคาสำเร็จ'
        });
    } catch (error) {
        console.error('Approve price update error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการอนุมัติคำร้องแก้ไขราคา'
        });
    }
};

// @desc    Reject price update
// @route   PUT /api/price-updates/:id/reject
// @access   Admin only
exports.rejectPriceUpdate = async (req, res) => {
    try {
        const { review_note } = req.body;

        if (!review_note) {
            return res.status(400).json({
                success: false,
                message: 'กรุณาระบุเหตุผลในการปฏิเสธ'
            });
        }

        const priceUpdate = await PriceUpdate.findById(req.params.id);

        if (!priceUpdate) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบคำร้องแก้ไขราคาที่ต้องการ'
            });
        }

        if (priceUpdate.approval_status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'คำร้องนี้ถูกดำเนินการแล้ว'
            });
        }

        // Update price update status
        priceUpdate.approval_status = 'rejected';
        priceUpdate.reviewed_at = new Date();
        priceUpdate.reviewed_by = req.user.id;
        priceUpdate.review_note = review_note;
        await priceUpdate.save();

        const populatedUpdate = await PriceUpdate.findById(priceUpdate._id)
            .populate('place_id', 'name')
            .populate('owner_id', 'name email')
            .populate('reviewed_by', 'name email');

        res.json({
            success: true,
            data: populatedUpdate,
            message: 'ปฏิเสธคำร้องแก้ไขราคาสำเร็จ'
        });
    } catch (error) {
        console.error('Reject price update error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการปฏิเสธคำร้องแก้ไขราคา'
        });
    }
};
