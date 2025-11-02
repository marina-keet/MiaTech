const express = require('express');
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const Order = require('../models/Order');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/projects
// @desc    Obtenir les projets de l'utilisateur connecté
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let filter = {};
    
    // Si c'est un client, ne montrer que ses projets
    if (req.user.role === 'client') {
      filter.client = req.user.id;
    }
    // Si c'est un membre de l'équipe, montrer les projets assignés
    else if (req.user.role !== 'admin') {
      filter['team.member'] = req.user.id;
    }
    
    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    const projects = await Project.find(filter)
      .populate('client', 'firstName lastName company')
      .populate('order', 'orderNumber status')
      .populate('team.member', 'firstName lastName')
      .sort({ 'progress.lastUpdate': -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Project.countDocuments(filter);

    res.json({
      projects,
      pagination: {
        current: Number(page),
        total: Math.ceil(total / limit),
        count: projects.length,
        totalItems: total
      }
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   GET /api/projects/:id
// @desc    Obtenir un projet spécifique
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('client', 'firstName lastName email company phone')
      .populate('order', 'orderNumber status pricing')
      .populate('team.member', 'firstName lastName email')
      .populate('communication.updates.author', 'firstName lastName')
      .populate('communication.meetings.attendees', 'firstName lastName');

    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    // Vérifier les permissions
    const isClient = req.user.role === 'client' && project.client._id.toString() === req.user.id;
    const isTeamMember = project.team.some(member => member.member._id.toString() === req.user.id);
    const isAdmin = req.user.role === 'admin' || req.user.role === 'manager';

    if (!isClient && !isTeamMember && !isAdmin) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    res.json(project);

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   POST /api/projects/:id/updates
// @desc    Ajouter une mise à jour au projet
// @access  Private (Team members, Admin)
router.post('/:id/updates', [
  auth,
  body('title').notEmpty().withMessage('Le titre est requis'),
  body('content').notEmpty().withMessage('Le contenu est requis'),
  body('visibility').optional().isIn(['client', 'team', 'internal']).withMessage('Visibilité invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    // Vérifier les permissions
    const isTeamMember = project.team.some(member => member.member.toString() === req.user.id);
    const isAdmin = req.user.role === 'admin' || req.user.role === 'manager';

    if (!isTeamMember && !isAdmin) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const update = {
      title: req.body.title,
      content: req.body.content,
      author: req.user.id,
      visibility: req.body.visibility || 'client',
      attachments: req.body.attachments || []
    };

    project.communication.updates.push(update);
    await project.save();

    // Peupler pour la réponse
    await project.populate('communication.updates.author', 'firstName lastName');

    const addedUpdate = project.communication.updates[project.communication.updates.length - 1];
    
    res.status(201).json(addedUpdate);

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   PUT /api/projects/:id/milestones/:milestoneId
// @desc    Mettre à jour un milestone
// @access  Private (Team members, Admin)
router.put('/:id/milestones/:milestoneId', [
  auth,
  body('status').optional().isIn(['pending', 'in-progress', 'completed', 'overdue'])
    .withMessage('Statut invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    // Vérifier les permissions
    const isTeamMember = project.team.some(member => member.member.toString() === req.user.id);
    const isAdmin = req.user.role === 'admin' || req.user.role === 'manager';

    if (!isTeamMember && !isAdmin) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const milestone = project.progress.milestones.id(req.params.milestoneId);
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone non trouvé' });
    }

    // Mettre à jour les champs fournis
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        milestone[key] = req.body[key];
      }
    });

    // Si le statut change à "completed", mettre la date de complétion
    if (req.body.status === 'completed' && milestone.status !== 'completed') {
      milestone.completedDate = new Date();
    }

    await project.save();

    res.json(milestone);

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   POST /api/projects/:id/team
// @desc    Ajouter un membre à l'équipe projet
// @access  Private (Admin, Manager)
router.post('/:id/team', [
  auth,
  authorize('admin', 'manager'),
  body('member').notEmpty().withMessage('L\'ID du membre est requis'),
  body('role').isIn(['project-manager', 'developer', 'designer', 'tester', 'client-manager'])
    .withMessage('Rôle invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    // Vérifier si le membre n'est pas déjà dans l'équipe
    const existingMember = project.team.find(member => 
      member.member.toString() === req.body.member);

    if (existingMember) {
      return res.status(400).json({ message: 'Ce membre fait déjà partie de l\'équipe' });
    }

    project.team.push({
      member: req.body.member,
      role: req.body.role
    });

    await project.save();

    // Peupler pour la réponse
    await project.populate('team.member', 'firstName lastName email');

    res.json(project.team);

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   PUT /api/projects/:id/status
// @desc    Mettre à jour le statut du projet
// @access  Private (Team PM, Admin)
router.put('/:id/status', [
  auth,
  body('status').isIn(['planning', 'design', 'development', 'testing', 'review', 'deployment', 'completed', 'on-hold', 'cancelled'])
    .withMessage('Statut invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    // Vérifier les permissions
    const isProjectManager = project.team.some(member => 
      member.member.toString() === req.user.id && member.role === 'project-manager');
    const isAdmin = req.user.role === 'admin' || req.user.role === 'manager';

    if (!isProjectManager && !isAdmin) {
      return res.status(403).json({ message: 'Accès refusé. Seuls les chefs de projet et admins peuvent modifier le statut.' });
    }

    const oldStatus = project.status;
    project.status = req.body.status;

    // Ajouter automatiquement une mise à jour
    const statusUpdate = {
      title: `Statut du projet mis à jour`,
      content: `Le statut du projet est passé de "${oldStatus}" à "${req.body.status}".`,
      author: req.user.id,
      visibility: 'client'
    };

    project.communication.updates.push(statusUpdate);

    // Si le projet est terminé, mettre à jour les dates
    if (req.body.status === 'completed' && oldStatus !== 'completed') {
      project.timeline.actualEndDate = new Date();
    }

    await project.save();

    res.json(project);

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   GET /api/projects/admin/dashboard
// @desc    Tableau de bord admin des projets
// @access  Private (Admin, Manager)
router.get('/admin/dashboard', [
  auth,
  authorize('admin', 'manager')
], async (req, res) => {
  try {
    // Statistiques générales
    const totalProjects = await Project.countDocuments();
    const activeProjects = await Project.countDocuments({ 
      status: { $in: ['planning', 'design', 'development', 'testing', 'review', 'deployment'] }
    });
    const completedProjects = await Project.countDocuments({ status: 'completed' });
    const onHoldProjects = await Project.countDocuments({ status: 'on-hold' });

    // Projets par statut
    const projectsByStatus = await Project.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Projets récents
    const recentProjects = await Project.find()
      .populate('client', 'firstName lastName company')
      .populate('order', 'orderNumber')
      .sort({ createdAt: -1 })
      .limit(10);

    // Projets en retard (date de fin dépassée)
    const overdueProjects = await Project.find({
      'timeline.endDate': { $lt: new Date() },
      status: { $nin: ['completed', 'cancelled'] }
    })
      .populate('client', 'firstName lastName company')
      .populate('team.member', 'firstName lastName');

    res.json({
      stats: {
        total: totalProjects,
        active: activeProjects,
        completed: completedProjects,
        onHold: onHoldProjects
      },
      projectsByStatus,
      recentProjects,
      overdueProjects
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;