const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Order = require('../models/Order');
const Project = require('../models/Project');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Obtenir le profil utilisateur complet
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Statistiques pour le client
    let stats = {};
    if (user.role === 'client') {
      const orders = await Order.find({ client: user._id });
      const projects = await Project.find({ client: user._id });
      
      stats = {
        totalOrders: orders.length,
        activeProjects: projects.filter(p => 
          ['planning', 'design', 'development', 'testing', 'review'].includes(p.status)
        ).length,
        completedProjects: projects.filter(p => p.status === 'completed').length,
        totalSpent: orders
          .filter(o => o.payment.status === 'paid')
          .reduce((sum, o) => sum + o.pricing.totalAmount, 0)
      };
    }

    res.json({
      user,
      stats
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   PUT /api/users/profile
// @desc    Mettre à jour le profil utilisateur
// @access  Private
router.put('/profile', [
  auth,
  body('firstName').optional().notEmpty().withMessage('Le prénom ne peut pas être vide'),
  body('lastName').optional().notEmpty().withMessage('Le nom ne peut pas être vide'),
  body('email').optional().isEmail().withMessage('Email invalide'),
  body('phone').optional().isMobilePhone('fr-FR').withMessage('Numéro de téléphone invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const allowedUpdates = ['firstName', 'lastName', 'email', 'phone', 'company', 'avatar'];
    const updates = {};

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Vérifier si l'email est déjà utilisé
    if (req.body.email && req.body.email !== req.user.email) {
      const existingUser = await User.findOne({ 
        email: req.body.email, 
        _id: { $ne: req.user.id } 
      });
      
      if (existingUser) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé' });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   PUT /api/users/change-password
// @desc    Changer le mot de passe
// @access  Private
router.put('/change-password', [
  auth,
  body('currentPassword').notEmpty().withMessage('Le mot de passe actuel est requis'),
  body('newPassword').isLength({ min: 6 }).withMessage('Le nouveau mot de passe doit contenir au moins 6 caractères'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('Les mots de passe ne correspondent pas');
    }
    return true;
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    
    // Vérifier le mot de passe actuel
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mot de passe actuel incorrect' });
    }

    // Mettre à jour le mot de passe
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Mot de passe mis à jour avec succès' });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   GET /api/users/dashboard
// @desc    Données du tableau de bord utilisateur
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (user.role === 'client') {
      // Dashboard client
      const orders = await Order.find({ client: user._id })
        .populate('service', 'name category')
        .sort({ createdAt: -1 })
        .limit(5);

      const projects = await Project.find({ client: user._id })
        .populate('team.member', 'firstName lastName')
        .sort({ 'progress.lastUpdate': -1 })
        .limit(5);

      const recentActivity = [
        ...orders.map(o => ({
          type: 'order',
          title: `Commande ${o.orderNumber}`,
          description: `Service: ${o.service.name}`,
          date: o.createdAt,
          status: o.status
        })),
        ...projects.map(p => ({
          type: 'project',
          title: p.title,
          description: `Progression: ${p.progress.percentage}%`,
          date: p.progress.lastUpdate,
          status: p.status
        }))
      ]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10);

      const stats = {
        totalOrders: await Order.countDocuments({ client: user._id }),
        activeProjects: await Project.countDocuments({ 
          client: user._id,
          status: { $in: ['planning', 'design', 'development', 'testing', 'review'] }
        }),
        completedProjects: await Project.countDocuments({ 
          client: user._id,
          status: 'completed' 
        }),
        pendingPayments: await Order.countDocuments({
          client: user._id,
          'payment.status': 'pending'
        })
      };

      res.json({
        user,
        stats,
        recentOrders: orders,
        activeProjects: projects,
        recentActivity
      });

    } else if (user.role === 'admin' || user.role === 'manager') {
      // Dashboard admin/manager
      const totalUsers = await User.countDocuments();
      const totalOrders = await Order.countDocuments();
      const totalProjects = await Project.countDocuments();
      const activeProjects = await Project.countDocuments({
        status: { $in: ['planning', 'design', 'development', 'testing', 'review'] }
      });

      const recentOrders = await Order.find()
        .populate('client', 'firstName lastName company')
        .populate('service', 'name category')
        .sort({ createdAt: -1 })
        .limit(10);

      const projectsNeedingAttention = await Project.find({
        $or: [
          { 'timeline.endDate': { $lt: new Date() }, status: { $ne: 'completed' } }, // En retard
          { team: { $size: 0 } }, // Sans équipe
          { status: 'planning' } // En attente de démarrage
        ]
      })
        .populate('client', 'firstName lastName')
        .limit(10);

      const monthlyStats = await Order.aggregate([
        {
          $match: {
            createdAt: { 
              $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 11, 1) 
            }
          }
        },
        {
          $group: {
            _id: { 
              year: { $year: '$createdAt' }, 
              month: { $month: '$createdAt' } 
            },
            count: { $sum: 1 },
            revenue: { 
              $sum: { 
                $cond: [
                  { $eq: ['$payment.status', 'paid'] },
                  '$pricing.totalAmount',
                  0
                ]
              }
            }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]);

      res.json({
        user,
        stats: {
          totalUsers,
          totalOrders,
          totalProjects,
          activeProjects,
          pendingOrders: await Order.countDocuments({ status: 'pending' }),
          thisMonthRevenue: monthlyStats[monthlyStats.length - 1]?.revenue || 0
        },
        recentOrders,
        projectsNeedingAttention,
        monthlyStats
      });

    } else {
      // Dashboard membre d'équipe
      const assignedProjects = await Project.find({
        'team.member': user._id
      })
        .populate('client', 'firstName lastName company')
        .populate('order', 'orderNumber')
        .sort({ 'progress.lastUpdate': -1 });

      const myTasks = [];
      assignedProjects.forEach(project => {
        project.progress.milestones.forEach(milestone => {
          if (milestone.status === 'pending' || milestone.status === 'in-progress') {
            myTasks.push({
              projectTitle: project.title,
              projectId: project._id,
              milestone: milestone.name,
              dueDate: milestone.dueDate,
              status: milestone.status
            });
          }
        });
      });

      res.json({
        user,
        assignedProjects,
        myTasks: myTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)),
        stats: {
          assignedProjects: assignedProjects.length,
          activeTasks: myTasks.filter(t => t.status === 'in-progress').length,
          pendingTasks: myTasks.filter(t => t.status === 'pending').length,
          overdueTasks: myTasks.filter(t => new Date(t.dueDate) < new Date()).length
        }
      });
    }

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   GET /api/users/notifications
// @desc    Obtenir les notifications utilisateur
// @access  Private
router.get('/notifications', auth, async (req, res) => {
  try {
    const notifications = [];

    if (req.user.role === 'client') {
      // Notifications pour les clients
      const pendingOrders = await Order.find({
        client: req.user.id,
        status: 'pending'
      }).populate('service', 'name');

      const projectUpdates = await Project.find({
        client: req.user.id,
        'communication.updates.date': {
          $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 derniers jours
        }
      }).populate('communication.updates.author', 'firstName lastName');

      pendingOrders.forEach(order => {
        notifications.push({
          type: 'order',
          title: 'Commande en attente de confirmation',
          message: `Votre commande ${order.orderNumber} est en attente`,
          date: order.createdAt,
          priority: 'medium',
          link: `/dashboard/orders/${order._id}`
        });
      });

      projectUpdates.forEach(project => {
        project.communication.updates
          .filter(update => update.visibility === 'client')
          .forEach(update => {
            notifications.push({
              type: 'project_update',
              title: 'Mise à jour de projet',
              message: update.title,
              date: update.date,
              priority: 'low',
              link: `/dashboard/projects/${project._id}`
            });
          });
      });
    }

    // Trier par date (plus récent en premier)
    notifications.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(notifications.slice(0, 50)); // Limiter à 50 notifications

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   GET /api/users/admin/all
// @desc    Obtenir tous les utilisateurs (Admin seulement)
// @access  Private (Admin)
router.get('/admin/all', [
  auth,
  authorize('admin')
], async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    
    let filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(filter);

    const stats = {
      total: await User.countDocuments(),
      clients: await User.countDocuments({ role: 'client' }),
      team: await User.countDocuments({ role: { $in: ['admin', 'manager'] } }),
      active: await User.countDocuments({ isActive: true }),
      thisMonth: await User.countDocuments({
        createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
      })
    };

    res.json({
      users,
      stats,
      pagination: {
        current: Number(page),
        total: Math.ceil(total / limit),
        count: users.length,
        totalItems: total
      }
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   PUT /api/users/:id/role
// @desc    Modifier le rôle d'un utilisateur (Admin seulement)
// @access  Private (Admin)
router.put('/:id/role', [
  auth,
  authorize('admin'),
  body('role').isIn(['client', 'manager', 'admin']).withMessage('Rôle invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const oldRole = user.role;
    user.role = req.body.role;
    await user.save();

    res.json({
      message: `Rôle mis à jour de ${oldRole} vers ${req.body.role}`,
      user: {
        id: user._id,
        name: user.fullName,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;