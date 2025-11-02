const express = require('express');
const { body, validationResult } = require('express-validator');
const BlogPost = require('../models/BlogPost');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/blog
// @desc    Obtenir tous les articles de blog publiés
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, tag, search, page = 1, limit = 10, featured } = req.query;
    
    // Construire le filtre
    let filter = { status: 'published' };
    
    if (category) {
      filter.category = category;
    }
    
    if (tag) {
      filter.tags = { $in: [tag] };
    }
    
    if (search) {
      filter.$text = { $search: search };
    }

    if (featured === 'true') {
      filter.isFeature = true;
    }
    
    // Pagination
    const skip = (page - 1) * limit;
    
    const posts = await BlogPost.find(filter)
      .populate('author', 'firstName lastName')
      .select('-content') // Exclure le contenu complet pour la liste
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    const total = await BlogPost.countDocuments(filter);
    
    res.json({
      posts,
      pagination: {
        current: Number(page),
        total: Math.ceil(total / limit),
        count: posts.length,
        totalItems: total
      }
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   GET /api/blog/featured
// @desc    Obtenir les articles mis en avant
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const featuredPosts = await BlogPost.find({ 
      status: 'published', 
      isFeature: true 
    })
      .populate('author', 'firstName lastName')
      .select('-content')
      .sort({ publishedAt: -1 })
      .limit(3);
    
    res.json(featuredPosts);

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   GET /api/blog/categories
// @desc    Obtenir toutes les catégories avec le nombre d'articles
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await BlogPost.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json(categories);

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   GET /api/blog/tags
// @desc    Obtenir tous les tags populaires
// @access  Public
router.get('/tags', async (req, res) => {
  try {
    const tags = await BlogPost.aggregate([
      { $match: { status: 'published' } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);
    
    res.json(tags);

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   GET /api/blog/:slug
// @desc    Obtenir un article par slug
// @access  Public
router.get('/:slug', async (req, res) => {
  try {
    const post = await BlogPost.findOne({ 
      slug: req.params.slug, 
      status: 'published' 
    })
      .populate('author', 'firstName lastName email')
      .populate('engagement.comments.author', 'firstName lastName')
      .populate('engagement.comments.replies.author', 'firstName lastName');
    
    if (!post) {
      return res.status(404).json({ message: 'Article non trouvé' });
    }
    
    // Incrémenter les vues
    post.engagement.views += 1;
    await post.save();
    
    res.json(post);

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   POST /api/blog
// @desc    Créer un nouvel article (Admin/Manager)
// @access  Private (Admin/Manager)
router.post('/', [
  auth,
  authorize('admin', 'manager'),
  body('title').notEmpty().withMessage('Le titre est requis'),
  body('content').notEmpty().withMessage('Le contenu est requis'),
  body('excerpt').isLength({ max: 300 }).withMessage('L\'extrait ne peut pas dépasser 300 caractères'),
  body('category').isIn(['web-development', 'mobile-development', 'design', 'technology', 'case-study', 'tutorial', 'news'])
    .withMessage('Catégorie invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, excerpt, category, tags, featuredImage, seo, scheduledAt } = req.body;

    // Générer le slug
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Vérifier si le slug existe déjà
    const existingPost = await BlogPost.findOne({ slug });
    if (existingPost) {
      return res.status(400).json({ message: 'Un article avec ce titre existe déjà' });
    }

    const postData = {
      title,
      slug,
      content,
      excerpt,
      author: req.user.id,
      category,
      tags: tags || [],
      featuredImage,
      seo,
      scheduledAt
    };

    const post = new BlogPost(postData);
    await post.save();

    await post.populate('author', 'firstName lastName');
    
    res.status(201).json(post);

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   PUT /api/blog/:id/publish
// @desc    Publier un article (Admin/Manager)
// @access  Private (Admin/Manager)
router.put('/:id/publish', [
  auth,
  authorize('admin', 'manager')
], async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Article non trouvé' });
    }

    post.status = 'published';
    post.publishedAt = new Date();
    
    await post.save();

    res.json({ 
      message: 'Article publié avec succès',
      post: post
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   POST /api/blog/:id/like
// @desc    Liker un article
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Article non trouvé' });
    }

    // Vérifier si l'utilisateur a déjà liké
    const existingLike = post.engagement.likes.find(
      like => like.user.toString() === req.user.id
    );

    if (existingLike) {
      // Retirer le like
      post.engagement.likes = post.engagement.likes.filter(
        like => like.user.toString() !== req.user.id
      );
    } else {
      // Ajouter le like
      post.engagement.likes.push({
        user: req.user.id,
        date: new Date()
      });
    }

    await post.save();

    res.json({
      liked: !existingLike,
      likesCount: post.engagement.likes.length
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   POST /api/blog/:id/comments
// @desc    Ajouter un commentaire
// @access  Private
router.post('/:id/comments', [
  auth,
  body('content').notEmpty().withMessage('Le contenu du commentaire est requis'),
  body('content').isLength({ max: 1000 }).withMessage('Commentaire trop long (max 1000 caractères)')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const post = await BlogPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Article non trouvé' });
    }

    const comment = {
      author: req.user.id,
      content: req.body.content,
      isApproved: req.user.role === 'admin' || req.user.role === 'manager' // Auto-approuver les admins
    };

    post.engagement.comments.push(comment);
    await post.save();

    // Peupler pour la réponse
    await post.populate('engagement.comments.author', 'firstName lastName');
    
    const addedComment = post.engagement.comments[post.engagement.comments.length - 1];

    res.status(201).json(addedComment);

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   PUT /api/blog/comments/:commentId/approve
// @desc    Approuver un commentaire (Admin/Manager)
// @access  Private (Admin/Manager)
router.put('/comments/:commentId/approve', [
  auth,
  authorize('admin', 'manager')
], async (req, res) => {
  try {
    const post = await BlogPost.findOne({
      'engagement.comments._id': req.params.commentId
    });

    if (!post) {
      return res.status(404).json({ message: 'Commentaire non trouvé' });
    }

    const comment = post.engagement.comments.id(req.params.commentId);
    comment.isApproved = true;

    await post.save();

    res.json({ 
      message: 'Commentaire approuvé',
      comment: comment
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   GET /api/blog/admin/all
// @desc    Obtenir tous les articles pour l'admin (tous statuts)
// @access  Private (Admin/Manager)
router.get('/admin/all', [
  auth,
  authorize('admin', 'manager')
], async (req, res) => {
  try {
    const { status, author, page = 1, limit = 20 } = req.query;
    
    let filter = {};
    if (status) filter.status = status;
    if (author) filter.author = author;

    const skip = (page - 1) * limit;

    const posts = await BlogPost.find(filter)
      .populate('author', 'firstName lastName')
      .select('-content') // Exclure le contenu pour les performances
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await BlogPost.countDocuments(filter);

    // Statistiques
    const stats = {
      total: await BlogPost.countDocuments(),
      published: await BlogPost.countDocuments({ status: 'published' }),
      draft: await BlogPost.countDocuments({ status: 'draft' }),
      archived: await BlogPost.countDocuments({ status: 'archived' }),
      pendingComments: await BlogPost.aggregate([
        { $unwind: '$engagement.comments' },
        { $match: { 'engagement.comments.isApproved': false } },
        { $count: 'total' }
      ])
    };

    res.json({
      posts,
      stats,
      pagination: {
        current: Number(page),
        total: Math.ceil(total / limit),
        count: posts.length,
        totalItems: total
      }
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;