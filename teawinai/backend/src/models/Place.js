const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  province: {
    type: String,
    required: true,
    trim: true
  },
  district: {
    type: String,
    required: true,
    trim: true
  },
  subdistrict: {
    type: String,
    required: true,
    trim: true
  },
  map_link: {
    type: String,
    required: true,
    trim: true
  },
  google_map_link: {
    type: String,
    required: false, // Keep for backward compatibility but make optional
    trim: true
  },
  lat: {
    type: Number,
    required: false, // Make optional since we use google_map_link
    min: -90,
    max: 90
  },
  lng: {
    type: Number,
    required: false, // Make optional since we use google_map_link
    min: -180,
    max: 180
  },
  price_min: {
    type: Number,
    required: true,
    min: 0
  },
  price_max: {
    type: Number,
    required: true,
    min: 0
  },
  is_free: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  images: [{
    type: String
  }],
  opening_hours: {
    type: Object,
    default: {}
  },
  // Keep old fields for backward compatibility but make them optional
  open_time: {
    type: String,
    required: false // Make optional when using opening_hours
  },
  close_time: {
    type: String,
    required: false // Make optional when using opening_hours
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'inactive', 'rejected'],
    default: 'pending'
  },
  submitted_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Create index for location queries
placeSchema.index({ lat: 1, lng: 1 });
placeSchema.index({ category: 1 });
placeSchema.index({ status: 1 });
placeSchema.index({ submitted_by: 1 });

module.exports = mongoose.model('Place', placeSchema);
