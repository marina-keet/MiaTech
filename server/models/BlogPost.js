const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Le titre est requis'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  content: {
    type: String,
    required: [true, 'Le contenu est requis']
  },
  excerpt: {
    type: String,
    required: true,
    maxlength: 300
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  category: {
    type: String,
    required: true,
    enum: ['web-development', 'mobile-development', 'design', 'technology', 'case-study', 'tutorial', 'news']
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  featuredImage: {
    url: String,
    alt: String,
    caption: String
  },
  images: [{
    url: String,
    alt: String,
    caption: String
  }],
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    canonicalUrl: String
  },
  engagement: {
    views: {
      type: Number,
      default: 0
    },
    likes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      date: {
        type: Date,
        default: Date.now
      }
    }],
    comments: [{
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      content: String,
      date: {
        type: Date,
        default: Date.now
      },
      isApproved: {
        type: Boolean,
        default: false
      },
      replies: [{
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        content: String,
        date: {
          type: Date,
          default: Date.now
        }
      }]
    }],
    shares: {
      type: Number,
      default: 0
    }
  },
  readingTime: {
    type: Number, // en minutes
    default: 1
  },
  isFeature: {
    type: Boolean,
    default: false
  },
  publishedAt: Date,
  scheduledAt: Date
}, {
  timestamps: true
});

// Index pour la recherche et le tri
blogPostSchema.index({ title: 'text', content: 'text', excerpt: 'text' });
blogPostSchema.index({ status: 1, publishedAt: -1 });
blogPostSchema.index({ category: 1 });
blogPostSchema.index({ tags: 1 });
blogPostSchema.index({ slug: 1 });

// Calcul automatique du temps de lecture
blogPostSchema.pre('save', function(next) {
  if (this.content) {
    const wordCount = this.content.split(/\s+/).length;
    this.readingTime = Math.ceil(wordCount / 200); // 200 mots par minute
  }
  
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

// Virtual pour le nombre de likes
blogPostSchema.virtual('likesCount').get(function() {
  return this.engagement.likes ? this.engagement.likes.length : 0;
});

// Virtual pour le nombre de commentaires approuvés
blogPostSchema.virtual('commentsCount').get(function() {
  return this.engagement.comments ? 
    this.engagement.comments.filter(comment => comment.isApproved).length : 0;
});

blogPostSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('BlogPost', blogPostSchema);