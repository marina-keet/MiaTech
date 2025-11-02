const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();

// Base de données en mémoire
let users = [
  {
    id: 1,
    name: 'Admin MiaTech',
    email: 'admin@miatech.com',
    password: '$2a$10$4SCT5PlMbDvk3dZfKFJHKu9pAHLjzIJ2syDzH8x.KcOl1J5hUYhEO', // admin123
    role: 'admin'
  }
];

let orders = [];
let quotes = [];

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.get('/api/health', (req, res) => {
  console.log('📊 Health check OK');
  res.json({ 
    status: '✅ OK',
    message: '🚀 Serveur temporaire actif',
    users: users.length,
    timestamp: new Date().toISOString()
  });
});

// Route pour la page d'administration
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('📝 Inscription - données:', req.body);
    
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      console.log('❌ Champs manquants');
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }

    // Vérifier si l'utilisateur existe
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      console.log('❌ Email déjà utilisé:', email);
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Hasher le mot de passe
    console.log('🔐 Hashage du mot de passe...');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Créer l'utilisateur
    const newUser = {
      id: users.length + 1,
      name,
      email,
      password: hashedPassword,
      role: 'client'
    };
    
    users.push(newUser);
    console.log('✅ Utilisateur créé:', { id: newUser.id, name, email });

    res.status(201).json({ 
      message: 'Utilisateur créé avec succès',
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
    });

  } catch (error) {
    console.error('❌ Erreur inscription:', error);
    res.status(500).json({ 
      message: 'Erreur serveur',
      error: error.message 
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🔑 Connexion - données:', { email: req.body.email });
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    // Trouver l'utilisateur
    const user = users.find(u => u.email === email);
    if (!user) {
      console.log('❌ Utilisateur non trouvé:', email);
      return res.status(400).json({ message: 'Identifiants invalides' });
    }

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('❌ Mot de passe incorrect');
      return res.status(400).json({ message: 'Identifiants invalides' });
    }

    // Générer le token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      'secret_jwt_key',
      { expiresIn: '7d' }
    );

    console.log('✅ Connexion réussie:', user.email);
    res.json({
      message: 'Connexion réussie',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });

  } catch (error) {
    console.error('❌ Erreur connexion:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route de test pour voir les utilisateurs
app.get('/api/users', (req, res) => {
  const safeUsers = users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role }));
  res.json({ count: users.length, users: safeUsers });
});

// Route pour créer une commande
app.post('/api/orders', (req, res) => {
  try {
    const { userId, serviceId, description, budget, deadline, paymentMode } = req.body;
    
    // Validation basique
    if (!userId || !serviceId || !description) {
      return res.status(400).json({ message: 'Données manquantes' });
    }
    
    // Créer la commande
    const newOrder = {
      id: orders.length + 1,
      userId,
      serviceId,
      description,
      budget: budget || 'Non spécifié',
      deadline: deadline || 'Non spécifié',
      paymentMode: paymentMode || 'quote',
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    orders.push(newOrder);
    
    console.log('📝 Nouvelle commande:', newOrder);
    res.status(201).json({ 
      message: 'Commande créée avec succès', 
      order: newOrder 
    });
    
  } catch (error) {
    console.error('❌ Erreur création commande:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route pour voir les commandes
app.get('/api/orders', (req, res) => {
  res.json({ count: orders.length, orders });
});

// Route pour les commandes en attente (pour l'admin)
app.get('/api/admin/orders/pending', (req, res) => {
  const pendingOrders = orders.filter(order => order.status === 'pending');
  console.log(`📋 Commandes en attente: ${pendingOrders.length}`);
  res.json({ count: pendingOrders.length, orders: pendingOrders });
});

// Route pour valider une commande et créer un projet
app.post('/api/orders/:orderId/validate', (req, res) => {
  try {
    const { orderId } = req.params;
    const order = orders.find(o => o.id === parseInt(orderId));
    
    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }
    
    if (order.status === 'validated') {
      return res.status(400).json({ message: 'Commande déjà validée' });
    }
    
    // Mettre à jour le statut de la commande
    order.status = 'validated';
    
    // Créer un projet à partir de la commande
    const newProject = {
      id: projects.length + 1,
      userId: order.userId,
      orderId: order.id,
      title: getProjectTitle(order.serviceId),
      service: getServiceName(order.serviceId),
      status: 'planning',
      progress: 0,
      startDate: new Date().toISOString().split('T')[0],
      estimatedEndDate: getEstimatedEndDate(order.serviceId),
      description: order.description || 'Description du projet en cours d\'élaboration',
      milestones: getDefaultMilestones(order.serviceId),
      files: [],
      comments: [
        {
          id: 1,
          author: "Équipe MiaTech",
          message: `Félicitations ! Votre commande a été validée et votre projet "${getProjectTitle(order.serviceId)}" a été créé. Notre équipe va commencer le travail dans les plus brefs délais.`,
          date: new Date().toISOString().split('T')[0],
          isFromClient: false
        }
      ]
    };
    
    projects.push(newProject);
    
    console.log(`✅ Commande ${orderId} validée et projet ${newProject.id} créé`);
    res.json({ 
      message: 'Commande validée et projet créé avec succès',
      order: order,
      project: newProject
    });
    
  } catch (error) {
    console.error('❌ Erreur validation commande:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Fonctions utilitaires pour créer les projets
function getServiceName(serviceId) {
  const services = {
    'web-dev': '💻 App Development',
    'ui-ux': '🎨 UI/UX Design',
    'poster': '🖼️ Conception d\'affiches',
    'business-card': '💳 Cartes de visite',
    'logo': '🏷️ Création de logos',
    'branding': '🎨 Identité visuelle complète',
    'others': '⚡ Autres services'
  };
  return services[serviceId] || '📄 Service personnalisé';
}

function getProjectTitle(serviceId) {
  const titles = {
    'web-dev': 'Développement Application Web',
    'ui-ux': 'Design UI/UX Personnalisé',
    'poster': 'Création d\'Affiches Professionnelles',
    'business-card': 'Cartes de Visite sur Mesure',
    'logo': 'Création de Logo Unique',
    'branding': 'Identité Visuelle Complète',
    'others': 'Projet Personnalisé'
  };
  return titles[serviceId] || 'Projet sur Mesure';
}

function getEstimatedEndDate(serviceId) {
  const durations = {
    'web-dev': 45, // 45 jours
    'ui-ux': 21,   // 3 semaines
    'poster': 7,    // 1 semaine
    'business-card': 5, // 5 jours
    'logo': 14,     // 2 semaines
    'branding': 30,  // 1 mois
    'others': 21    // 3 semaines par défaut
  };
  
  const days = durations[serviceId] || 21;
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);
  return endDate.toISOString().split('T')[0];
}

function getDefaultMilestones(serviceId) {
  const milestoneTemplates = {
    'web-dev': [
      { id: 1, title: "Analyse des besoins", completed: false, date: getDateAfterDays(3), description: "Analyse détaillée du projet" },
      { id: 2, title: "Design UX/UI", completed: false, date: getDateAfterDays(10), description: "Création des maquettes" },
      { id: 3, title: "Développement", completed: false, date: getDateAfterDays(30), description: "Développement de l'application" },
      { id: 4, title: "Tests", completed: false, date: getDateAfterDays(40), description: "Tests et corrections" },
      { id: 5, title: "Livraison", completed: false, date: getDateAfterDays(45), description: "Mise en production" }
    ],
    'ui-ux': [
      { id: 1, title: "Briefing créatif", completed: false, date: getDateAfterDays(2), description: "Compréhension des besoins" },
      { id: 2, title: "Recherches", completed: false, date: getDateAfterDays(5), description: "Recherches et inspirations" },
      { id: 3, title: "Wireframes", completed: false, date: getDateAfterDays(10), description: "Création des wireframes" },
      { id: 4, title: "Design final", completed: false, date: getDateAfterDays(18), description: "Design haute fidélité" },
      { id: 5, title: "Livraison", completed: false, date: getDateAfterDays(21), description: "Livraison des fichiers" }
    ],
    'poster': [
      { id: 1, title: "Brief créatif", completed: false, date: getDateAfterDays(1), description: "Compréhension du projet" },
      { id: 2, title: "Concepts", completed: false, date: getDateAfterDays(3), description: "Propositions créatives" },
      { id: 3, title: "Développement", completed: false, date: getDateAfterDays(5), description: "Réalisation de l'affiche" },
      { id: 4, title: "Livraison", completed: false, date: getDateAfterDays(7), description: "Fichiers finaux" }
    ]
  };
  
  return milestoneTemplates[serviceId] || [
    { id: 1, title: "Démarrage", completed: false, date: getDateAfterDays(1), description: "Lancement du projet" },
    { id: 2, title: "Développement", completed: false, date: getDateAfterDays(14), description: "Phase de réalisation" },
    { id: 3, title: "Livraison", completed: false, date: getDateAfterDays(21), description: "Livraison finale" }
  ];
}

function getDateAfterDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

// Route pour créer un devis
app.post('/api/quotes', (req, res) => {
  try {
    const { 
      userId, 
      serviceId, 
      projectType, 
      description, 
      features, 
      timeline, 
      budget, 
      contact 
    } = req.body;
    
    // Validation basique
    if (!userId || !serviceId || !description) {
      return res.status(400).json({ message: 'Données manquantes' });
    }
    
    // Créer le devis
    const newQuote = {
      id: quotes.length + 1,
      userId,
      serviceId,
      projectType: projectType || 'Non spécifié',
      description,
      features: features || 'Non spécifié',
      timeline: timeline || 'Non spécifié',
      budget: budget || 'Non spécifié',
      contact: contact || 'Email par défaut',
      status: 'pending',
      type: 'quote',
      createdAt: new Date().toISOString()
    };
    
    quotes.push(newQuote);
    
    console.log('📋 Nouveau devis:', newQuote);
    res.status(201).json({ 
      message: 'Demande de devis créée avec succès', 
      quote: newQuote 
    });
    
  } catch (error) {
    console.error('❌ Erreur création devis:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route pour voir les devis
app.get('/api/quotes', (req, res) => {
  res.json({ count: quotes.length, quotes });
});

// Stockage des projets en mémoire
let projects = [];

// Route pour récupérer les projets d'un utilisateur
app.get('/api/projects/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    
    // Récupérer seulement les projets de cet utilisateur
    const userProjects = projects.filter(project => project.userId === parseInt(userId));
    
    console.log(`📊 Récupération des projets pour l'utilisateur ${userId} - Trouvés: ${userProjects.length}`);
    res.json({ count: userProjects.length, projects: userProjects });
    
  } catch (error) {
    console.error('❌ Erreur récupération projets:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route pour ajouter un commentaire à un projet
app.post('/api/projects/:projectId/comments', (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId, message } = req.body;
    
    const newComment = {
      id: Date.now(),
      author: "Client",
      message,
      date: new Date().toISOString().split('T')[0],
      isFromClient: true
    };

    console.log(`💬 Nouveau commentaire sur le projet ${projectId}:`, newComment);
    res.status(201).json({ 
      message: 'Commentaire ajouté avec succès', 
      comment: newComment 
    });
    
  } catch (error) {
    console.error('❌ Erreur ajout commentaire:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route 404
app.use('*', (req, res) => {
  console.log('❌ Route non trouvée:', req.originalUrl);
  res.status(404).json({ message: 'Route non trouvée' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('🚀 ====================================');
  console.log(`   MiaTech Serveur Temporaire`);
  console.log(`   📍 Port: ${PORT}`);
  console.log(`   🌍 URL: http://localhost:${PORT}`);
  console.log(`   👤 Utilisateurs: ${users.length}`);
  console.log(`   📧 Test: admin@miatech.com / admin123`);
  console.log('====================================');
});

// Gestion propre de l'arrêt
process.on('SIGINT', () => {
  console.log('\n🔴 Arrêt du serveur...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🔴 Arrêt du serveur...');
  process.exit(0);
});