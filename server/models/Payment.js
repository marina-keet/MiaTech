const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Le montant est requis'],
    min: 0
  },
  method: {
    type: String,
    enum: ['stripe', 'paypal', 'bank-transfer', 'cash'],
    required: [true, 'La méthode de paiement est requise']
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  transaction_id: {
    type: String,
    unique: true,
    sparse: true
  },
  gateway_response: {
    type: mongoose.Schema.Types.Mixed
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
paymentSchema.index({ order_id: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ transaction_id: 1 });
paymentSchema.index({ created_at: -1 });

module.exports = mongoose.model('Payment', paymentSchema);