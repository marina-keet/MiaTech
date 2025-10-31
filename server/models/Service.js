const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom du service est requis'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'La description est requise']
  },
  shortDescription: {
    type: String,
    required: true,
    maxlength: 200
  },
  category: {
    type: String,
    required: true,
    enum: ['web-development', 'mobile-development', 'ui-ux-design', 'branding', 'consulting', 'maintenance']
  },
  pricing: {
    type: {
      type: String,
      enum: ['fixed', 'hourly', 'project', 'custom'],
      required: true
    },
    basePrice: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'EUR'
    },
    priceRange: {
      min: Number,
      max: Number
    }
  },
  duration: {
    estimated: {
      type: Number, // en jours
      required: true
    },
    unit: {
      type: String,
      enum: ['hours', 'days', 'weeks', 'months'],
      default: 'days'
    }
  },
  features: [{
    name: String,
    included: {
      type: Boolean,
      default: true
    },
    description: String
  }],
  technologies: [{
    name: String,
    category: {
      type: String,
      enum: ['frontend', 'backend', 'database', 'mobile', 'design', 'other']
    }
  }],
  portfolio: [{
    title: String,
    image: String,
    url: String,
    description: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  popularity: {
    type: Number,
    default: 0
  },
  metadata: {
    seoTitle: String,
    seoDescription: String,
    keywords: [String]
  }
}, {
  timestamps: true
});

// Index pour la recherche
serviceSchema.index({ name: 'text', description: 'text', shortDescription: 'text' });
serviceSchema.index({ category: 1 });
serviceSchema.index({ 'pricing.basePrice': 1 });
serviceSchema.index({ isActive: 1 });

module.exports = mongoose.model('Service', serviceSchema);