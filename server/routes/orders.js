const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Service = require('../models/Service');
const Project = require('../models/Project');
const { auth, authorize, authorizeOwnerOrAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/orders
// @desc    Créer une nouvelle commande
// @access  Private
router.post('/', [
  auth,
  body('service').notEmpty().withMessage('Le service est requis'),
  body('details.customRequirements').optional().isLength({ max: 2000 })
    .withMessage('Description trop longue (max 2000 caractères)')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { service: serviceId, details, pricing } = req.body;

    // Vérifier que le service existe
    const service = await Service.findById(serviceId);
    if (!service || !service.isActive) {
      return res.status(404).json({ message: 'Service non trouvé ou indisponible' });
    }

    // Créer la commande
    const orderData = {
      client: req.user.id,
      service: serviceId,
      details: details || {},
      pricing: {
        baseAmount: pricing?.baseAmount || service.pricing.basePrice,
        currency: 'EUR',
        ...pricing
      }
    };

    const order = new Order(orderData);
    await order.save();

    // Peupler les données pour la réponse
    await order.populate([
      { path: 'client', select: 'firstName lastName email company' },
      { path: 'service', select: 'name description pricing duration' }
    ]);

    res.status(201).json(order);

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   GET /api/orders
// @desc    Obtenir les commandes de l'utilisateur connecté
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let filter = { client: req.user.id };
    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    const orders = await Order.find(filter)
      .populate('service', 'name description pricing')
      .populate('assignedTo', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      pagination: {
        current: Number(page),
        total: Math.ceil(total / limit),
        count: orders.length,
        totalItems: total
      }
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   GET /api/orders/:id
// @desc    Obtenir une commande spécifique
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('client', 'firstName lastName email company phone')
      .populate('service')
      .populate('assignedTo', 'firstName lastName email')
      .populate('communication.messages.sender', 'firstName lastName');

    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    // Vérifier les permissions
    if (req.user.role !== 'admin' && order.client._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    res.json(order);

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Mettre à jour le statut d'une commande (Admin/Manager)
// @access  Private (Admin/Manager)
router.put('/:id/status', [
  auth,
  authorize('admin', 'manager'),
  body('status').isIn(['draft', 'pending', 'confirmed', 'in-progress', 'review', 'completed', 'cancelled', 'refunded'])
    .withMessage('Statut invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, reason } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    const oldStatus = order.status;
    order.status = status;

    // Ajouter une note interne sur le changement de statut
    if (reason) {
      order.notes.internal += `\n[${new Date().toISOString()}] Statut changé de ${oldStatus} à ${status}: ${reason}`;
    }

    // Si la commande est confirmée, créer automatiquement un projet
    if (status === 'confirmed' && oldStatus !== 'confirmed') {
      const project = new Project({
        title: `Projet ${order.service.name} - ${order.orderNumber}`,
        description: order.details.customRequirements || 'Nouveau projet créé automatiquement',
        order: order._id,
        client: order.client,
        timeline: {
          startDate: new Date(),
          endDate: new Date(Date.now() + (order.service.duration?.estimated || 30) * 24 * 60 * 60 * 1000)
        }
      });
      
      await project.save();
    }

    await order.save();

    // Peupler pour la réponse
    await order.populate([
      { path: 'client', select: 'firstName lastName email' },
      { path: 'service', select: 'name description' }
    ]);

    res.json(order);

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   POST /api/orders/:id/messages
// @desc    Ajouter un message à une commande
// @access  Private
router.post('/:id/messages', [
  auth,
  body('message').notEmpty().withMessage('Le message est requis')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    // Vérifier les permissions
    if (req.user.role !== 'admin' && req.user.role !== 'manager' && 
        order.client.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const newMessage = {
      sender: req.user.id,
      message: req.body.message,
      attachments: req.body.attachments || []
    };

    order.communication.messages.push(newMessage);
    order.communication.lastActivity = new Date();

    await order.save();

    // Peupler le message pour la réponse
    await order.populate('communication.messages.sender', 'firstName lastName');

    const addedMessage = order.communication.messages[order.communication.messages.length - 1];
    
    res.status(201).json(addedMessage);

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   PUT /api/orders/:id/assign
// @desc    Assigner une commande à un membre de l'équipe (Admin/Manager)
// @access  Private (Admin/Manager)
router.put('/:id/assign', [
  auth,
  authorize('admin', 'manager'),
  body('assignedTo').notEmpty().withMessage('L\'ID du membre est requis')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    order.assignedTo = req.body.assignedTo;
    await order.save();

    await order.populate('assignedTo', 'firstName lastName email');

    res.json(order);

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   GET /api/orders/admin/all
// @desc    Obtenir toutes les commandes (Admin/Manager)
// @access  Private (Admin/Manager)
router.get('/admin/all', [
  auth,
  authorize('admin', 'manager')
], async (req, res) => {
  try {
    const { status, assignedTo, client, page = 1, limit = 20 } = req.query;
    
    let filter = {};
    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (client) filter.client = client;

    const skip = (page - 1) * limit;

    const orders = await Order.find(filter)
      .populate('client', 'firstName lastName email company')
      .populate('service', 'name category')
      .populate('assignedTo', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Order.countDocuments(filter);

    // Statistiques rapides
    const stats = {
      total: await Order.countDocuments(),
      pending: await Order.countDocuments({ status: 'pending' }),
      inProgress: await Order.countDocuments({ status: 'in-progress' }),
      completed: await Order.countDocuments({ status: 'completed' }),
      thisMonth: await Order.countDocuments({
        createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
      })
    };

    res.json({
      orders,
      stats,
      pagination: {
        current: Number(page),
        total: Math.ceil(total / limit),
        count: orders.length,
        totalItems: total
      }
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;