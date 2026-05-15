const mongoose = require('mongoose');

const tripPlanSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  trip_name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  budget_total: {
    type: Number,
    required: true,
    min: 0
  },
  budget_used: {
    type: Number,
    default: 0,
    min: 0
  },
  categories: [{
    type: String,
    trim: true
  }],
  max_places: {
    type: Number,
    required: true,
    min: 1
  },
  plan_data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  trip_date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'saved'],
    default: 'draft'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create indexes
tripPlanSchema.index({ user_id: 1 });
tripPlanSchema.index({ status: 1 });
tripPlanSchema.index({ trip_date: 1 });

// Virtual for trip items
tripPlanSchema.virtual('trip_items', {
  ref: 'TripItem',
  localField: '_id',
  foreignField: 'trip_id'
});

// Virtual to calculate remaining budget
tripPlanSchema.virtual('budget_remaining').get(function() {
  return this.budget_total - this.budget_used;
});

// Ensure budget_used doesn't exceed budget_total
tripPlanSchema.pre('save', function(next) {
  if (this.budget_used > this.budget_total) {
    this.budget_used = this.budget_total;
  }
  next();
});

module.exports = mongoose.model('TripPlan', tripPlanSchema);
