const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Verify JWT token middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const verifyToken = async (req, res, next) => {
    let token;

    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
        return res.status(401).json({ 
            success: false,
            message: 'Access denied. No token provided.' 
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('JWT payload decoded:', decoded);
        
        // Get user from database
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid token. User not found.' 
            });
        }

        // Set user in request object
        req.user = decoded;
        console.log('verifyToken debug - user set:', { 
            userId: decoded.id, 
            userRole: decoded.role,
            userEmail: decoded.email 
        });
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        
        // Handle specific JWT errors
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false,
                message: 'Token expired' 
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid token' 
            });
        }
        
        return res.status(401).json({ 
            success: false,
            message: 'Token verification failed' 
        });
    }
};

/**
 * Require specific role middleware
 * @param {...string} roles - Allowed roles
 * @returns {Function} Middleware function
 */
const requireRole = (...roles) => {
    return (req, res, next) => {
        console.log('requireRole debug:', { 
            userRole: req.user?.role, 
            requiredRoles: roles,
            hasUser: !!req.user,
            user: req.user
        });
        
        // Check if user exists and has required role
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false,
                message: 'Access denied. Insufficient permissions.' 
            });
        }
        next();
    };
};

// Export individual functions
module.exports = {
    verifyToken,
    requireRole
};
