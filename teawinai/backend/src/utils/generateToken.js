const jwt = require('jsonwebtoken');

/**
 * Generate JWT token
 * @param {string} userId - User ID
 * @param {string} role - User role
 * @returns {string} JWT token
 */
const generateToken = (userId, role) => {
    return jwt.sign(
        { 
            id: userId, 
            role: role 
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRE || '7d'
        }
    );
};

module.exports = generateToken;
