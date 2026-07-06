const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const USERNAME_PATTERN = /^[\p{L}\p{N}_ -]+$/u;

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    maxlength: 30,
    validate: {
      validator: function(v) {
        return !v || USERNAME_PATTERN.test(v);
      },
      message: 'Username can only contain letters, numbers, spaces, underscores, and hyphens'
    }
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please enter a valid email'
    }
  },
  password_hash: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'owner', 'user'],
    default: 'user'
  },
  phone: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^[\d\s\-\+\(\)]+$/.test(v);
      },
      message: 'Please enter a valid phone number'
    }
  },
  bio: {
    type: String,
    maxlength: 500,
    trim: true
  },
  avatar: {
    type: String,
    default: null
  },
  preferences: [{
    type: String,
    enum: ['beach', 'mountain', 'temple', 'city', 'museum', 'park', 'market', 'restaurant', 'other']
  }],
  stats: {
    placesAdded: {
      type: Number,
      default: 0
    },
    reviews: {
      type: Number,
      default: 0
    },
    followers: {
      type: Number,
      default: 0
    },
    following: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Hash password before saving (only if not already hashed)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password_hash')) return next();
  
  // Check if password_hash is already hashed (bcrypt hash starts with $2b$ or $2a$)
  if (this.password_hash.startsWith('$2')) return next();
  
  this.password_hash = await bcrypt.hash(this.password_hash, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password_hash);
};

// Create indexes (unique fields are already indexed by Mongoose)
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);
