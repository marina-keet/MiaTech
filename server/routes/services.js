const express = require('express');
const { body, validationResult } = require('express-validator');
const Service = require('../models/Service');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/services
// @desc    Obtenir tous les services actifs
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, page = 1, limit = 10 } = req.query;
    
    // Construire le filtre
    let filter = { isActive: true };
    
    if (category) {
      filter.category = category;
    }
    
    if (search) {
      filter.$text = { $search: search };
    }
    
    if (minPrice || maxPrice) {
      filter['pricing.basePrice'] = {};
      if (minPrice) filter['pricing.basePrice'].$gte = Number(minPrice);
      if (maxPrice) filter['pricing.basePrice'].$lte = Number(maxPrice);
    }
    
    // Pagination
    const skip = (page - 1) * limit;
    
    const services = await Service.find(filter)
      .sort({ popularity: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    const total = await Service.countDocuments(filter);
    
    res.json({
      services,
      pagination: {
        current: Number(page),
        total: Math.ceil(total / limit),
        count: services.length,
        totalItems: total
      }
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   GET /api/services/:id
// @desc    Obtenir un service par ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ message: 'Service non trouvé' });
    }
    
    if (!service.isActive) {
      return res.status(404).json({ message: 'Service non disponible' });
    }
    
    // Incrémenter la popularité
    service.popularity += 1;
    await service.save();
    
    res.json(service);

  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Service non trouvé' });
    }
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   GET /api/services/category/:category
// @desc    Obtenir les services par catégorie
// @access  Public
router.get('/category/:category', async (req, res) => {
  try {
    const services = await Service.find({
      category: req.params.category,
      isActive: true
    }).sort({ popularity: -1 });
    
    res.json(services);

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   POST /api/services
// @desc    Créer un nouveau service (Admin seulement)
// @access  Private (Admin)
router.post('/', [
  auth,
  authorize('admin'),
  body('name').notEmpty().withMessage('Le nom du service est requis'),
  body('description').notEmpty().withMessage('La description est requise'),
  body('shortDescription').isLength({ max: 200 }).withMessage('Description courte trop longue'),
  body('category').isIn(['web-development', 'mobile-development', 'ui-ux-design', 'branding', 'consulting', 'maintenance'])
    .withMessage('Catégorie invalide'),
  body('pricing.type').isIn(['fixed', 'hourly', 'project', 'custom']).withMessage('Type de tarification invalide'),
  body('pricing.basePrice').isNumeric().withMessage('Prix de base invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, shortDescription, category, pricing, duration, features, technologies } = req.body;

    // Générer le slug
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Vérifier si le slug existe déjà
    const existingService = await Service.findOne({ slug });
    if (existingService) {
      return res.status(400).json({ message: 'Un service avec ce nom existe déjà' });
    }

    const service = new Service({
      name,
      slug,
      description,
      shortDescription,
      category,
      pricing,
      duration,
      features: features || [],
      technologies: technologies || []
    });

    await service.save();
    res.status(201).json(service);

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   PUT /api/services/:id
// @desc    Mettre à jour un service (Admin seulement)
// @access  Private (Admin)
router.put('/:id', [
  auth,
  authorize('admin')
], async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ message: 'Service non trouvé' });
    }

    const allowedUpdates = [
      'name', 'description', 'shortDescription', 'category', 'pricing', 
      'duration', 'features', 'technologies', 'portfolio', 'isActive', 'metadata'
    ];

    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Mettre à jour le slug si le nom change
    if (req.body.name && req.body.name !== service.name) {
      const newSlug = req.body.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      const existingService = await Service.findOne({ slug: newSlug, _id: { $ne: req.params.id } });
      if (existingService) {
        return res.status(400).json({ message: 'Un service avec ce nom existe déjà' });
      }
      
      updates.slug = newSlug;
    }

    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json(updatedService);

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   DELETE /api/services/:id
// @desc    Supprimer un service (Admin seulement)
// @access  Private (Admin)
router.delete('/:id', [
  auth,
  authorize('admin')
], async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ message: 'Service non trouvé' });
    }

    // Soft delete - marquer comme inactif au lieu de supprimer
    service.isActive = false;
    await service.save();

    res.json({ message: 'Service désactivé avec succès' });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   GET /api/services/admin/all
// @desc    Obtenir tous les services (actifs et inactifs) pour l'admin
// @access  Private (Admin)
router.get('/admin/all', [
  auth,
  authorize('admin')
], async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json(services);

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;