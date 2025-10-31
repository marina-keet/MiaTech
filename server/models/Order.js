const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'confirmed', 'in-progress', 'review', 'completed', 'cancelled', 'refunded'],
    default: 'draft'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  details: {
    customRequirements: String,
    timeline: {
      startDate: Date,
      endDate: Date,
      milestones: [{
        name: String,
        dueDate: Date,
        status: {
          type: String,
          enum: ['pending', 'in-progress', 'completed'],
          default: 'pending'
        },
        description: String
      }]
    },
    specifications: mongoose.Schema.Types.Mixed,
    attachments: [{
      name: String,
      url: String,
      type: String,
      size: Number,
      uploadDate: {
        type: Date,
        default: Date.now
      }
    }]
  },
  pricing: {
    baseAmount: {
      type: Number,
      required: true
    },
    extras: [{
      name: String,
      price: Number,
      quantity: {
        type: Number,
        default: 1
      }
    }],
    discounts: [{
      name: String,
      type: {
        type: String,
        enum: ['percentage', 'fixed']
      },
      value: Number
    }],
    taxes: {
      rate: {
        type: Number,
        default: 20 // TVA 20%
      },
      amount: Number
    },
    totalAmount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'EUR'
    }
  },
  payment: {
    method: {
      type: String,
      enum: ['stripe', 'paypal', 'bank-transfer', 'invoice'],
      default: 'stripe'
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'partial', 'failed', 'refunded'],
      default: 'pending'
    },
    transactions: [{
      transactionId: String,
      amount: Number,
      method: String,
      status: String,
      date: {
        type: Date,
        default: Date.now
      },
      details: mongoose.Schema.Types.Mixed
    }],
    invoiceNumber: String,
    invoiceUrl: String
  },
  communication: {
    messages: [{
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      message: String,
      attachments: [{
        name: String,
        url: String
      }],
      timestamp: {
        type: Date,
        default: Date.now
      },
      isRead: {
        type: Boolean,
        default: false
      }
    }],
    lastActivity: {
      type: Date,
      default: Date.now
    }
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  notes: {
    internal: String, // Notes internes pour l'équipe
    client: String    // Notes visibles par le client
  }
}, {
  timestamps: true
});

// Génération automatique du numéro de commande
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `MIA-${(count + 1).toString().padStart(6, '0')}`;
  }
  next();
});

// Calcul automatique du montant total
orderSchema.pre('save', function(next) {
  let total = this.pricing.baseAmount;
  
  // Ajouter les extras
  if (this.pricing.extras && this.pricing.extras.length > 0) {
    total += this.pricing.extras.reduce((sum, extra) => 
      sum + (extra.price * (extra.quantity || 1)), 0);
  }
  
  // Appliquer les remises
  if (this.pricing.discounts && this.pricing.discounts.length > 0) {
    this.pricing.discounts.forEach(discount => {
      if (discount.type === 'percentage') {
        total -= total * (discount.value / 100);
      } else if (discount.type === 'fixed') {
        total -= discount.value;
      }
    });
  }
  
  // Calculer les taxes
  if (this.pricing.taxes && this.pricing.taxes.rate) {
    this.pricing.taxes.amount = total * (this.pricing.taxes.rate / 100);
    total += this.pricing.taxes.amount;
  }
  
  this.pricing.totalAmount = Math.round(total * 100) / 100; // Arrondir à 2 décimales
  next();
});

// Index pour les requêtes fréquentes
orderSchema.index({ client: 1, status: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ assignedTo: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);