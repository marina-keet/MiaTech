const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Le titre du projet est requis'],
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  team: [{
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['project-manager', 'developer', 'designer', 'tester', 'client-manager']
    },
    assignedDate: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['planning', 'design', 'development', 'testing', 'review', 'deployment', 'completed', 'on-hold', 'cancelled'],
    default: 'planning'
  },
  progress: {
    percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    milestones: [{
      name: String,
      description: String,
      dueDate: Date,
      completedDate: Date,
      status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed', 'overdue'],
        default: 'pending'
      },
      deliverables: [{
        name: String,
        type: {
          type: String,
          enum: ['document', 'prototype', 'code', 'design', 'other']
        },
        url: String,
        description: String,
        completedDate: Date
      }]
    }],
    lastUpdate: {
      type: Date,
      default: Date.now
    }
  },
  timeline: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    actualStartDate: Date,
    actualEndDate: Date,
    estimatedHours: Number,
    actualHours: Number
  },
  resources: {
    repository: {
      url: String,
      platform: {
        type: String,
        enum: ['github', 'gitlab', 'bitbucket', 'other']
      },
      isPrivate: {
        type: Boolean,
        default: true
      }
    },
    staging: {
      url: String,
      credentials: {
        username: String,
        password: String
      }
    },
    production: {
      url: String,
      deployedDate: Date
    },
    documentation: {
      url: String,
      type: {
        type: String,
        enum: ['notion', 'confluence', 'wiki', 'pdf', 'other']
      }
    }
  },
  communication: {
    updates: [{
      title: String,
      content: String,
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      date: {
        type: Date,
        default: Date.now
      },
      attachments: [{
        name: String,
        url: String,
        type: String
      }],
      visibility: {
        type: String,
        enum: ['client', 'team', 'internal'],
        default: 'client'
      }
    }],
    meetings: [{
      title: String,
      date: Date,
      duration: Number, // en minutes
      attendees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
      summary: String,
      nextSteps: [String],
      recordingUrl: String
    }]
  },
  quality: {
    reviews: [{
      reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      date: {
        type: Date,
        default: Date.now
      },
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comments: String,
      approved: Boolean
    }],
    tests: {
      coverage: Number,
      passed: Number,
      failed: Number,
      lastRun: Date
    }
  },
  budget: {
    allocated: Number,
    spent: Number,
    remaining: Number,
    currency: {
      type: String,
      default: 'EUR'
    }
  },
  tags: [String],
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'critical'],
    default: 'normal'
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index pour les requêtes fréquentes
projectSchema.index({ client: 1, status: 1 });
projectSchema.index({ 'team.member': 1 });
projectSchema.index({ status: 1, priority: 1 });
projectSchema.index({ 'timeline.endDate': 1 });

// Méthode pour calculer la progression automatiquement
projectSchema.methods.calculateProgress = function() {
  if (!this.progress.milestones || this.progress.milestones.length === 0) {
    return 0;
  }
  
  const completed = this.progress.milestones.filter(m => m.status === 'completed').length;
  return Math.round((completed / this.progress.milestones.length) * 100);
};

// Mise à jour automatique de la progression
projectSchema.pre('save', function(next) {
  this.progress.percentage = this.calculateProgress();
  this.progress.lastUpdate = new Date();
  next();
});

module.exports = mongoose.model('Project', projectSchema);