const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  service_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Le titre est requis'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'La description est requise']
  },
  budget: {
    type: Number,
    required: [true, 'Le budget est requis'],
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes pour optimiser les requêtes
orderSchema.index({ user_id: 1 });
orderSchema.index({ service_id: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ created_at: -1 });

module.exports = mongoose.model('Order', orderSchema);