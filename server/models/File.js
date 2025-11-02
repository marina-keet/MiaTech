const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  file_url: {
    type: String,
    required: [true, 'L\'URL du fichier est requise']
  },
  original_name: {
    type: String,
    required: [true, 'Le nom original du fichier est requis']
  },
  file_name: {
    type: String,
    required: [true, 'Le nom du fichier est requis']
  },
  type: {
    type: String,
    enum: ['document', 'image', 'video', 'audio', 'archive', 'other'],
    required: [true, 'Le type de fichier est requis']
  },
  mime_type: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: [true, 'La taille du fichier est requise'],
    min: 0
  },
  uploaded_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  is_public: {
    type: Boolean,
    default: false
  },
  download_count: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes pour optimiser les requêtes
fileSchema.index({ order_id: 1 });
fileSchema.index({ uploaded_by: 1 });
fileSchema.index({ type: 1 });
fileSchema.index({ created_at: -1 });

module.exports = mongoose.model('File', fileSchema);