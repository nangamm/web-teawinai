const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Place = require('../models/Place');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const generateToken = require('../utils/generateToken');

// @desc    Register user
// @route   POST /api/auth/register
// @access   Public
const register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
            });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'อีเมลนี้ถูกใช้งานแล้ว'
            });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password_hash: password, // Will be hashed by pre-save hook
            phone
        });

        // Generate token
        const token = generateToken(user._id, user.role);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone
            },
            message: 'สมัครสมาชิกสำเร็จ'
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการสมัครสมาชิก'
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access   Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'กรุณากรอกอีเมลและรหัสผ่าน'
            });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password_hash');

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({
                success: false,
                message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
            });
        }

        // Generate token
        const token = generateToken(user._id, user.role);

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone
            },
            message: 'เข้าสู่ระบบสำเร็จ'
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'
        });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access   Private
const getMe = async (req, res) => {
    try {
        // Get full user data from database
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                username: user.username || '',
                email: user.email,
                role: user.role,
                phone: user.phone,
                bio: user.bio || '',
                avatar: user.avatar,
                preferences: user.preferences || [],
                stats: user.stats,
                joinDate: user.createdAt
            }
        });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user data'
        });
    }
};

const multer = require('multer');
const { avatarStorage, imageFileFilter } = require('../config/cloudinary');
const USERNAME_PATTERN = /^[\p{L}\p{N}_ -]+$/u;

const upload = multer({ 
  storage: avatarStorage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: imageFileFilter
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access   Private
const updateProfile = async (req, res) => {
    try {
        console.log('Update profile request:', {
            body: req.body,
            file: req.file ? {
                name: req.file.filename,
                path: req.file.path,
                mimetype: req.file.mimetype,
                size: req.file.size
            } : 'No file'
        })
        
        const { username, bio, preferences, avatar, avatarUrl } = req.body;
        const avatarValue = [avatar, avatarUrl].find(value => (
            typeof value === 'string' && value.trim()
        ));
        
        // Find user
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (username !== undefined) {
            const nextUsername = String(username).trim();

            if (nextUsername && !USERNAME_PATTERN.test(nextUsername)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid username',
                    error: 'Username can only contain letters, numbers, spaces, underscores, and hyphens'
                });
            }

            const existingUser = nextUsername
                ? await User.findOne({ username: nextUsername, _id: { $ne: user._id } })
                : null;

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Username is already taken'
                });
            }

            user.username = nextUsername || undefined;
        }

        // Update allowed fields
        if (bio !== undefined) user.bio = bio;
        if (preferences !== undefined) {
            try {
                user.preferences = typeof preferences === 'string' ? JSON.parse(preferences) : preferences;
            } catch (error) {
                console.error('Error parsing preferences:', error);
                user.preferences = [];
            }
        }
        
        // Handle avatar upload (Cloudinary URL from frontend or file upload)
        if (req.file) {
            user.avatar = req.file.path;
            console.log('Avatar set to:', user.avatar);
        } else if (avatarValue) {
            user.avatar = avatarValue.trim();
            console.log('Avatar URL set to:', user.avatar);
        }

        await user.save();
        console.log('User saved with avatar:', user.avatar);

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role,
                phone: user.phone,
                bio: user.bio,
                avatar: user.avatar,
                preferences: user.preferences,
                stats: user.stats,
                joinDate: user.createdAt
            },
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('Update profile error:', error);
        const isValidationError = error.name === 'ValidationError';

        res.status(isValidationError ? 400 : 500).json({
            success: false,
            message: isValidationError ? 'Invalid profile data' : 'Failed to update profile',
            error: error.message
        });
    }
};

// @desc    Get user's submitted places
// @route   GET /api/auth/places
// @access   Private
const getUserPlaces = async (req, res) => {
    try {
        const places = await Place.find({ submitted_by: req.user.id })
            .populate('category', 'name')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            places: places.map(place => ({
                _id: place._id,
                name: place.name,
                category: place.category,
                rating: place.rating,
                reviewCount: 0, // TODO: Implement review counting
                images: place.images || [],
                address: place.address,
                price_min: place.price_min,
                price_max: place.price_max,
                status: place.status,
                open_time: place.open_time,
                close_time: place.close_time
            }))
        });
    } catch (error) {
        console.error('Get user places error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user places'
        });
    }
};

// @desc    Get user's reviews
// @route   GET /api/auth/reviews
// @access   Private
const getUserReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ user: req.user.id })
            .populate('place', 'name images rating')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            reviews: reviews.map(review => ({
                _id: review._id,
                placeId: review.place?._id,
                placeName: review.place?.name || 'สถานที่',
                placeImage: review.place?.images?.[0] || '',
                rating: review.rating,
                comment: review.comment,
                createdAt: review.createdAt
            }))
        });
    } catch (error) {
        console.error('Get user reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user reviews'
        });
    }
};

// @desc    Get user's notifications
// @route   GET /api/auth/notifications
// @access   Private
const getNotifications = async (req, res) => {
    try {
        const limit = Math.min(Number(req.query.limit) || 10, 50);
        const notifications = await Notification.find({ recipient: req.user.id })
            .populate('actor', 'name username avatar role')
            .populate('place', 'name')
            .sort({ createdAt: -1 })
            .limit(limit);
        const unreadCount = await Notification.countDocuments({
            recipient: req.user.id,
            read: false
        });

        res.json({
            success: true,
            unreadCount,
            notifications
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notifications'
        });
    }
};

// @desc    Mark user's notifications as read
// @route   PUT /api/auth/notifications/read
// @access   Private
const markNotificationsRead = async (req, res) => {
    try {
        const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
        const query = {
            recipient: req.user.id,
            read: false
        };

        if (ids.length > 0) {
            query._id = { $in: ids };
        }

        await Notification.updateMany(query, {
            $set: {
                read: true,
                readAt: new Date()
            }
        });

        const unreadCount = await Notification.countDocuments({
            recipient: req.user.id,
            read: false
        });

        res.json({
            success: true,
            unreadCount
        });
    } catch (error) {
        console.error('Mark notifications read error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark notifications as read'
        });
    }
};

// @desc    Get all users (admin only)
// @route   GET /api/auth/users
// @access   Private (Admin only)
const getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        
        const users = await User.find({})
            .select('-password_hash')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await User.countDocuments();

        res.json({
            success: true,
            data: users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users'
        });
    }
};

// @desc    Get dashboard stats (admin only)
// @route   GET /api/auth/dashboard/stats
// @access   Private (Admin only)
const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalPlaces = await Place.countDocuments();
        
        const PriceUpdate = require('../models/PriceUpdate');
        const pendingUpdates = await PriceUpdate.countDocuments({ approval_status: 'pending' });
        const pendingPlaces = await Place.countDocuments({ status: 'pending' });

        res.json({
            success: true,
            stats: {
                totalUsers,
                totalPlaces,
                pendingUpdates,
                pendingPlaces
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard stats'
        });
    }
};

// @desc    Create user with specific role (admin only)
// @route   POST /api/auth/users
// @access   Private (Admin only)
const createUser = async (req, res) => {
    try {
        const { name, email, password, role, phone } = req.body;

        // Validate required fields
        if (!name || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'กรุณากรอกข้อมูลให้ครบถ้วน (name, email, password, role)'
            });
        }

        // Validate role
        if (!['admin', 'owner', 'user'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Role ต้องเป็น admin, owner หรือ user เท่านั้น'
            });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'อีเมลนี้ถูกใช้งานแล้ว'
            });
        }

        // Create user with specified role
        const user = await User.create({
            name,
            email,
            password_hash: password,
            role,
            phone
        });

        res.status(201).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone
            },
            message: 'สร้าง user สำเร็จ'
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการสร้าง user'
        });
    }
};

module.exports = {
    getMe,
    register,
    login,
    updateProfile,
    upload,
    getUserPlaces,
    getUserReviews,
    getNotifications,
    markNotificationsRead,
    getUsers,
    getDashboardStats,
    createUser
};
