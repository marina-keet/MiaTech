const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: false
  },
  content: {
    type: String,
    required: [true, 'Le contenu du message est requis'],
    trim: true
  },
  message_type: {
    type: String,
    enum: ['text', 'file', 'notification'],
    default: 'text'
  },
  is_read: {
    type: Boolean,
    default: false
  },
  read_at: {
    type: Date
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes pour optimiser les requêtes
messageSchema.index({ sender_id: 1 });
messageSchema.index({ receiver_id: 1 });
messageSchema.index({ order_id: 1 });
messageSchema.index({ created_at: -1 });
messageSchema.index({ is_read: 1 });

// Index composé pour les conversations
messageSchema.index({ sender_id: 1, receiver_id: 1, created_at: -1 });

module.exports = mongoose.model('Message', messageSchema);