const mongoose = require('mongoose');

const tripItemSchema = new mongoose.Schema({
  trip_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TripPlan',
    required: true
  },
  place_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Place',
    required: true
  },
  order: {
    type: Number,
    required: true,
    min: 1
  },
  estimated_cost: {
    type: Number,
    required: true,
    min: 0
  },
  note: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Create indexes
tripItemSchema.index({ trip_id: 1 });
tripItemSchema.index({ place_id: 1 });

// Ensure unique combination of trip_id and order
tripItemSchema.index({ trip_id: 1, order: 1 }, { unique: true });

module.exports = mongoose.model('TripItem', tripItemSchema);
