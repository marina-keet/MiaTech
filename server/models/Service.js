const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom du service est requis'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'La description est requise']
  },
  price_base: {
    type: Number,
    required: [true, 'Le prix de base est requis'],
    min: 0
  },
  category: {
    type: String,
    enum: ['web-development', 'mobile-development', 'ui-ux-design', 'consulting', 'maintenance', 'other'],
    default: 'other'
  },
  is_active: {
    type: Boolean,
    default: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes pour optimiser les requêtes
serviceSchema.index({ name: 1 });
serviceSchema.index({ category: 1 });
serviceSchema.index({ is_active: 1 });

// Middleware pour mettre à jour updated_at
serviceSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

module.exports = mongoose.model('Service', serviceSchema);