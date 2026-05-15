const mongoose = require('mongoose');

const priceUpdateSchema = new mongoose.Schema({
  place_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Place',
    required: true
  },
  owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  new_price_min: {
    type: Number,
    required: true,
    min: 0
  },
  new_price_max: {
    type: Number,
    required: true,
    min: 0
  },
  promotion: {
    type: String,
    maxlength: 500
  },
  approval_status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  submitted_at: {
    type: Date,
    default: Date.now
  },
  reviewed_at: {
    type: Date
  },
  reviewed_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  review_note: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Create indexes
priceUpdateSchema.index({ place_id: 1 });
priceUpdateSchema.index({ owner_id: 1 });
priceUpdateSchema.index({ approval_status: 1 });
priceUpdateSchema.index({ submitted_at: 1 });

// Ensure new_price_max is not less than new_price_min
priceUpdateSchema.pre('save', function(next) {
  if (this.new_price_max < this.new_price_min) {
    this.new_price_max = this.new_price_min;
  }
  next();
});

// Set reviewed_at when approval_status changes from pending
priceUpdateSchema.pre('save', function(next) {
  if (this.isModified('approval_status') && 
      this.approval_status !== 'pending' && 
      !this.reviewed_at) {
    this.reviewed_at = new Date();
  }
  next();
});

module.exports = mongoose.model('PriceUpdate', priceUpdateSchema);
