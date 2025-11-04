const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const PDFDocument = require('pdfkit');
const fs = require('fs');

const app = express();
let PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'miatech-secret-key-2025';

// Base de données en mémoire
let users = [
  {
    id: 1,
    name: 'Admin MiaTech',
    email: 'admin@miatech.com',
    password: '$2a$10$example.hash.for.admin123', // admin123
    role: 'admin'
  },
  {
    id: 2,
    name: 'Marina Admin',
    email: 'marina@gmail.com',
    password: '$2a$10$example.hash.for.admin123', // admin123
    role: 'super_admin'
  }
];

let orders = []; // COMMANDES - VIDE au démarrage, se remplit avec les vraies commandes
let quotes = [];
let payments = [];
let chatMessages = [];
let clients = []; // Liste permanente des clients enregistrés
let connectedClients = []; // Liste des clients connectés pour l'admin dashboard
let projects = []; // Liste des projets - VIDE au démarrage, se remplit automatiquement avec les commandes
let statistics = { // Statistiques globales - REMISES À ZÉRO
  totalRevenue: 0,
  projectsCompleted: 0,
  activeProjects: 0,
  clientsSatisfied: 0
};

// Paramètres de l'entreprise (chargés depuis le fichier au démarrage)
let companySettings = {
  name: 'MiaTech',
  email: 'contact@miatech.com',
  phone: '+33 1 23 45 67 89',
  address: '123 Rue de la Tech, 75001 Paris',
  website: 'https://miatech.com',
  description: 'Chez MiaTech, nous transformons vos idées en solutions digitales modernes, du design à la mise en ligne. Spécialisés en applications web et design UI/UX.',
  slogan: 'Votre partenaire digital de confiance',
  specialization: 'Applications web modernes et design UI/UX innovant',
  process: 'Idée → Design → Développement → Livraison → Suivi',
  updatedAt: new Date().toISOString(),
  updatedBy: null
};

// Utilisateurs connectés (sessions actives)
let connectedUsers = new Map(); // userId -> { lastSeen, userInfo }

// ========================
// SYSTÈME DE SAUVEGARDE PERMANENTE
// ========================
const DATA_DIR = './data';
const CLIENTS_FILE = `${DATA_DIR}/clients.json`;
const MESSAGES_FILE = `${DATA_DIR}/messages.json`;
const ORDERS_FILE = `${DATA_DIR}/orders.json`;
const PAYMENTS_FILE = `${DATA_DIR}/payments.json`;
const PROJECTS_FILE = `${DATA_DIR}/projects.json`;
const STATISTICS_FILE = `${DATA_DIR}/statistics.json`;
const SETTINGS_FILE = `${DATA_DIR}/settings.json`;
const QUOTES_FILE = `${DATA_DIR}/quotes.json`;

// Créer le dossier data s'il n'existe pas
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  console.log('📁 Dossier data créé');
}

// Fonction pour sauvegarder les clients
function saveClientsToFile() {
  try {
    const data = {
      lastUpdate: new Date().toISOString(),
      users: users,  // Sauvegarder tous les utilisateurs (admin + clients)
      connectedClients: connectedClients,  // Sauvegarder les clients connectés
      usersCount: users.length,
      clientsCount: users.filter(u => u.role === 'client').length
    };
    fs.writeFileSync(CLIENTS_FILE, JSON.stringify(data, null, 2));
    console.log(`💾 ${users.length} utilisateurs sauvegardés dans ${CLIENTS_FILE} (${data.clientsCount} clients)`);
  } catch (error) {
    console.error('❌ Erreur sauvegarde clients:', error);
  }
}

// Fonction pour charger les clients depuis le fichier
function loadClientsFromFile() {
  try {
    if (fs.existsSync(CLIENTS_FILE)) {
      const data = JSON.parse(fs.readFileSync(CLIENTS_FILE, 'utf8'));
      
      // Charger les utilisateurs sauvegardés (remplace les utilisateurs par défaut)
      if (data.users && data.users.length > 0) {
        users = data.users;
        clients = data.users; // Synchroniser clients avec users
        console.log(`� ${users.length} utilisateurs chargés depuis ${CLIENTS_FILE}`);
        console.log(`👤 ${users.filter(u => u.role === 'client').length} clients trouvés`);
      }
      
      // Charger les clients connectés
      if (data.connectedClients) {
        connectedClients = data.connectedClients;
        console.log(`🔌 ${connectedClients.length} connexions restaurées`);
      }
      
      console.log(`📅 Dernière mise à jour: ${data.lastUpdate}`);
    } else {
      console.log('📄 Aucun fichier clients existant - Initialisation avec admins par défaut');
      // Synchroniser clients avec users par défaut
      clients = users;
      // Sauvegarder immédiatement pour créer le fichier avec les admins par défaut
      saveClientsToFile();
    }
  } catch (error) {
    console.error('❌ Erreur chargement clients:', error);
    clients = [];
  }
}

// Fonction pour sauvegarder les messages
function saveMessagesToFile() {
  try {
    const data = {
      lastUpdate: new Date().toISOString(),
      messages: chatMessages,
      count: chatMessages.length
    };
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(data, null, 2));
    console.log(`💾 ${chatMessages.length} messages sauvegardés`);
  } catch (error) {
    console.error('❌ Erreur sauvegarde messages:', error);
  }
}

// Fonction pour sauvegarder les commandes
function saveOrdersToFile() {
  try {
    const data = {
      lastUpdate: new Date().toISOString(),
      orders: orders,
      count: orders.length
    };
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(data, null, 2));
    console.log(`📝 ${orders.length} commandes sauvegardées`);
  } catch (error) {
    console.error('❌ Erreur sauvegarde commandes:', error);
  }
}

// Fonction pour charger les commandes
function loadOrdersFromFile() {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const data = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
      if (data.orders) {
        orders = data.orders;
        console.log(`📝 ${orders.length} commandes chargées`);
      }
    } else {
      console.log('📄 Aucun fichier commandes existant - Base vide');
    }
  } catch (error) {
    console.error('❌ Erreur chargement commandes:', error);
    orders = [];
  }
}

// Fonction pour sauvegarder les projets
function saveProjectsToFile() {
  try {
    const data = {
      lastUpdate: new Date().toISOString(),
      projects: projects,
      count: projects.length,
      statistics: statistics
    };
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(data, null, 2));
    console.log(`📊 ${projects.length} projets sauvegardés`);
  } catch (error) {
    console.error('❌ Erreur sauvegarde projets:', error);
  }
}

// Fonction pour charger les projets
function loadProjectsFromFile() {
  try {
    if (fs.existsSync(PROJECTS_FILE)) {
      const data = JSON.parse(fs.readFileSync(PROJECTS_FILE, 'utf8'));
      if (data.projects) {
        projects = data.projects;
        console.log(`📊 ${projects.length} projets chargés`);
      }
      if (data.statistics) {
        statistics = { ...statistics, ...data.statistics };
        console.log(`📈 Statistiques chargées`);
      }
    } else {
      console.log('📄 Aucun fichier projets existant - Base vide');
    }
  } catch (error) {
    console.error('❌ Erreur chargement projets:', error);
    projects = [];
  }
}

// Fonction pour charger les messages depuis le fichier
function loadMessagesFromFile() {
  try {
    if (fs.existsSync(MESSAGES_FILE)) {
      const data = JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf8'));
      chatMessages = data.messages || [];
      console.log(`📂 ${chatMessages.length} messages chargés`);
    }
  } catch (error) {
    console.error('❌ Erreur chargement messages:', error);
    chatMessages = [];
  }
}

// Fonction pour sauvegarder les paramètres
function saveSettingsToFile() {
  try {
    const data = {
      lastUpdate: new Date().toISOString(),
      settings: companySettings
    };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2));
    console.log(`💾 Paramètres sauvegardés dans ${SETTINGS_FILE}`);
  } catch (error) {
    console.error('❌ Erreur sauvegarde paramètres:', error);
  }
}

// Fonction pour charger les paramètres depuis le fichier
function loadSettingsFromFile() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
      if (data.settings) {
        companySettings = data.settings;
        console.log(`📊 Paramètres chargés depuis ${SETTINGS_FILE}`);
        console.log(`🏢 Entreprise: ${companySettings.name}`);
      }
    } else {
      console.log('📄 Aucun fichier paramètres existant - Valeurs par défaut');
      // Sauvegarder les paramètres par défaut
      saveSettingsToFile();
    }
  } catch (error) {
    console.error('❌ Erreur chargement paramètres:', error);
  }
}

// Fonction pour sauvegarder les devis
function saveQuotesToFile() {
  try {
    const data = {
      lastUpdate: new Date().toISOString(),
      quotes: quotes,
      count: quotes.length
    };
    fs.writeFileSync(QUOTES_FILE, JSON.stringify(data, null, 2));
    console.log(`💾 ${quotes.length} devis sauvegardés`);
  } catch (error) {
    console.error('❌ Erreur sauvegarde devis:', error);
  }
}

// Fonction pour charger les devis depuis le fichier
function loadQuotesFromFile() {
  try {
    if (fs.existsSync(QUOTES_FILE)) {
      const data = JSON.parse(fs.readFileSync(QUOTES_FILE, 'utf8'));
      quotes = data.quotes || [];
      console.log(`📋 ${quotes.length} devis chargés`);
    } else {
      console.log('📄 Aucun fichier devis existant - Base vide');
    }
  } catch (error) {
    console.error('❌ Erreur chargement devis:', error);
    quotes = [];
  }
}

// Fonction pour sauvegarder automatiquement toutes les 30 secondes
function startAutoSave() {
  setInterval(() => {
    saveClientsToFile();
    saveMessagesToFile();
    saveOrdersToFile();
    saveProjectsToFile();
    saveSettingsToFile();
    saveQuotesToFile();
  }, 30000); // 30 secondes
  console.log('💾 Auto-sauvegarde activée (toutes les 30 secondes)');
}

// CHARGEMENT INITIAL DES DONNÉES
console.log('📂 Chargement des données depuis les fichiers...');
loadClientsFromFile();
loadMessagesFromFile();
loadOrdersFromFile();
loadProjectsFromFile();
loadSettingsFromFile();
loadQuotesFromFile();
console.log('✅ Données chargées avec succès');

// Démarrer l'auto-sauvegarde
startAutoSave();

// Fonction pour marquer un utilisateur comme connecté
function markUserConnected(userId, userInfo) {
  connectedUsers.set(userId.toString(), {
    lastSeen: new Date().toISOString(),
    userInfo: userInfo
  });
}

// Fonction pour nettoyer les anciennes connexions (> 1 heure)
function cleanupConnections() {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  for (const [userId, data] of connectedUsers.entries()) {
    if (new Date(data.lastSeen) < oneHourAgo) {
      connectedUsers.delete(userId);
    }
  }
}

// Configuration du serveur

// Gestion des erreurs globales
process.on('uncaughtException', (err) => {
  console.error('🚨 Erreur non gérée:', err);
  console.log('⚡ Le serveur continue de fonctionner...');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Promesse rejetée non gérée:', reason);
  console.log('⚡ Le serveur continue de fonctionner...');
});

// Gestion gracieuse de l'arrêt
let server;

const gracefulShutdown = (signal) => {
  console.log(`\n🛑 Signal ${signal} reçu. Arrêt gracieux du serveur...`);
  if (httpServer) {
    httpServer.close(() => {
      console.log('✅ Serveur arrêté proprement');
      process.exit(0);
    });
    
    // Force l'arrêt après 10 secondes
    setTimeout(() => {
      console.log('⚠️  Arrêt forcé du serveur');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Configuration CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174', 'http://127.0.0.1:5175'],
  credentials: true
}));
app.use(express.json());

// Servir les fichiers statiques (logos, etc.)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/static', express.static(path.join(__dirname, 'public')));

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
app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Route pour le nouveau dashboard admin (protégée)
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-dashboard-protected.html'));
});

app.get('/admin-dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-dashboard-protected.html'));
});

// Route pour la page de connexion admin
app.get('/admin-login', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-login.html'));
});

app.get('/admin-login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-login.html'));
});

// Route pour le dashboard admin protégé
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-dashboard-protected.html'));
});

// Route spécifique pour le fichier admin-dashboard-protected.html
app.get('/admin-dashboard-protected.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-dashboard-protected.html'));
});

app.get('/admin-login', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-login.html'));
});

// Route pour la page de création d'admin
app.get('/admin-create', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-create.html'));
});

// Route pour le simulateur de clients (pour les tests)
app.get('/client-simulator', (req, res) => {
  res.sendFile(path.join(__dirname, 'client-simulator.html'));
});

app.get('/client-simulator.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'client-simulator.html'));
});

// Route d'authentification admin
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log(`🔐 Tentative connexion admin: ${email}`);
    
    // Vérifier les identifiants
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis'
      });
    }
    
    // Vérifier les identifiants (système temporaire + base de données)
    let adminUser = null;
    let isValidPassword = false;
    
    // Vérifier d'abord les identifiants par défaut pour le premier accès
    if (email === 'admin@miatech.com' && password === 'admin123') {
      adminUser = {
        id: 999,
        name: 'Super Admin',
        email: 'admin@miatech.com',
        role: 'super_admin'
      };
      isValidPassword = true;
      console.log('✅ Connexion avec identifiants par défaut');
    } else {
      // Chercher dans la base de données
      adminUser = users.find(user => 
        user.email === email && (user.role === 'admin' || user.role === 'super_admin' || user.role === 'dev' || user.role === 'designer')
      );
      
      if (adminUser) {
        isValidPassword = await bcrypt.compare(password, adminUser.password);
      }
    }
    
    if (!adminUser || !isValidPassword) {
      console.log('❌ Identifiants incorrects');
      return res.status(401).json({
        success: false,
        message: 'Identifiants incorrects'
      });
    }
    
    // Générer le token admin
    const adminToken = jwt.sign(
      {
        id: adminUser.id, 
        email: adminUser.email, 
        role: adminUser.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    console.log(`✅ Connexion admin réussie: ${email}`);
    
    // Marquer l'utilisateur comme connecté
    markUserConnected(adminUser.id, adminUser);
    
    res.json({
      success: true,
      message: 'Connexion admin réussie',
      token: adminToken,
      user: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur authentification admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// Middleware de vérification admin
function verifyAdmin(req, res, next) {
  console.log('🔐 verifyAdmin appelé');
  console.log('📋 Headers:', req.headers.authorization);
  
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    console.log('❌ Token manquant');
    return res.status(401).json({
      success: false,
      message: 'Token d\'authentification requis'
    });
  }
  
  try {
    console.log('🔍 Vérification token...');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token décodé:', decoded);
    
    // Accepter tous les rôles administratifs
    const adminRoles = ['super_admin', 'admin', 'dev', 'designer'];
    console.log('🎭 Rôle utilisateur:', decoded.role);
    console.log('✅ Rôles acceptés:', adminRoles);
    
    if (!adminRoles.includes(decoded.role)) {
      console.log('❌ Rôle non autorisé:', decoded.role);
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé - Droits administrateur requis'
      });
    }
    
    console.log('✅ Authentification admin réussie');
    req.admin = decoded;
    next();
  } catch (error) {
    console.log('❌ Erreur token:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Token invalide'
    });
  }
}

// Route de vérification de token admin
app.get('/api/admin/verify', verifyAdmin, (req, res) => {
  res.json({
    valid: true,
    user: req.admin
  });
});

// companySettings maintenant déclaré au début du fichier avec les autres variables globales

// Route pour récupérer les paramètres
app.get('/api/admin/settings', verifyAdmin, (req, res) => {
  try {
    console.log('📊 Récupération des paramètres entreprise');
    res.json({
      success: true,
      settings: companySettings
    });
  } catch (error) {
    console.error('❌ Erreur récupération paramètres:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// Route pour sauvegarder les paramètres
app.put('/api/admin/settings', verifyAdmin, (req, res) => {
  try {
    console.log('💾 Sauvegarde des paramètres:', req.body);
    
    const { name, email, phone, address, website, description } = req.body;
    
    // Validation des données
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Nom et email sont obligatoires'
      });
    }
    
    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Format email invalide'
      });
    }
    
    // Mettre à jour les paramètres
    companySettings = {
      ...companySettings,
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim() || companySettings.phone,
      address: address?.trim() || companySettings.address,
      website: website?.trim() || companySettings.website,
      description: description?.trim() || companySettings.description,
      updatedAt: new Date().toISOString(),
      updatedBy: req.admin.id
    };
    
    // SAUVEGARDE IMMÉDIATE dans le fichier
    saveSettingsToFile();
    
    console.log('✅ Paramètres sauvegardés et persistés:', companySettings);
    
    res.json({
      success: true,
      message: 'Paramètres sauvegardés avec succès',
      settings: companySettings
    });
    
  } catch (error) {
    console.error('❌ Erreur sauvegarde paramètres:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la sauvegarde'
    });
  }
});

// Route pour récupérer les utilisateurs connectés par rôle
app.get('/api/admin/connected-users', verifyAdmin, (req, res) => {
  try {
    // Nettoyer les anciennes connexions
    cleanupConnections();
    
    const clients = [];
    const admins = [];
    
    // Parcourir les utilisateurs connectés
    for (const [userId, data] of connectedUsers.entries()) {
      const user = data.userInfo;
      const userEntry = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        lastSeen: data.lastSeen,
        isOnline: true
      };
      
      if (user.role === 'client') {
        clients.push(userEntry);
      } else if (user.role === 'admin' || user.role === 'super_admin' || user.role === 'dev' || user.role === 'designer') {
        admins.push(userEntry);
      }
    }
    
    // Ajouter aussi les utilisateurs récents du chat (clients)
    const recentChatUsers = new Set();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    chatMessages.forEach(msg => {
      if (msg.senderRole === 'client' && new Date(msg.timestamp) > oneDayAgo) {
        if (!connectedUsers.has(msg.senderId)) {
          recentChatUsers.add(JSON.stringify({
            id: msg.senderId,
            name: msg.senderName,
            email: `${msg.senderId}@client.com`,
            role: 'client',
            lastSeen: msg.timestamp,
            isOnline: false
          }));
        }
      }
    });
    
    // Ajouter les clients récents du chat
    recentChatUsers.forEach(userStr => {
      clients.push(JSON.parse(userStr));
    });
    
    res.json({
      success: true,
      clients: clients.sort((a, b) => new Date(b.lastSeen) - new Date(a.lastSeen)),
      admins: admins.sort((a, b) => new Date(b.lastSeen) - new Date(a.lastSeen))
    });
    
  } catch (error) {
    console.error('❌ Erreur récupération utilisateurs connectés:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// Route pour récupérer TOUS les membres de l'équipe (connectés ou non)
app.get('/api/admin/team-members', verifyAdmin, (req, res) => {
  try {
    // Récupérer tous les utilisateurs avec des rôles administratifs
    const teamMembers = users.filter(user => 
      ['admin', 'super_admin', 'dev', 'designer'].includes(user.role)
    );
    
    // Enrichir avec les informations de connexion
    const enrichedMembers = teamMembers.map(member => {
      const connectionData = connectedUsers.get(member.id.toString());
      const isOnline = !!connectionData;
      const lastSeen = connectionData ? connectionData.lastSeen : (member.lastActivity || member.createdAt || new Date().toISOString());
      
      return {
        id: member.id,
        name: member.name,
        email: member.email,
        role: member.role,
        createdAt: member.createdAt || new Date().toISOString(),
        isActive: member.isActive !== false,
        isOnline: isOnline,
        lastSeen: lastSeen,
        phone: member.phone || '',
        // Statistiques supplémentaires si disponibles
        projectsAssigned: 0, // À calculer si besoin
        tasksCompleted: 0    // À calculer si besoin
      };
    });
    
    console.log(`👥 Récupération équipe complète: ${enrichedMembers.length} membres`);
    
    res.json({
      success: true,
      members: enrichedMembers.sort((a, b) => {
        // Trier par statut en ligne d'abord, puis par rôle
        if (a.isOnline !== b.isOnline) {
          return b.isOnline - a.isOnline;
        }
        const roleOrder = { 'super_admin': 1, 'admin': 2, 'dev': 3, 'designer': 4 };
        return (roleOrder[a.role] || 5) - (roleOrder[b.role] || 5);
      }),
      totalMembers: enrichedMembers.length,
      onlineMembers: enrichedMembers.filter(m => m.isOnline).length,
      roleDistribution: {
        super_admin: enrichedMembers.filter(m => m.role === 'super_admin').length,
        admin: enrichedMembers.filter(m => m.role === 'admin').length,
        dev: enrichedMembers.filter(m => m.role === 'dev').length,
        designer: enrichedMembers.filter(m => m.role === 'designer').length
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur récupération équipe:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération de l\'équipe'
    });
  }
});

// Route pour qu'un client signale sa présence/connexion
app.post('/api/client/connect', (req, res) => {
  try {
    const { clientId, clientName, clientEmail, userAgent } = req.body;
    
    // Validation des données
    if (!clientId || !clientName) {
      return res.status(400).json({
        success: false,
        message: 'ClientId et clientName requis'
      });
    }
    
    // Créer ou mettre à jour le profil client
    let existingClient = clients.find(c => c.id === clientId || c.senderId === clientId);
    
    if (!existingClient) {
      // Nouveau client
      const newClient = {
        id: clientId,
        senderId: clientId,
        name: clientName,
        email: clientEmail || `${clientId}@client.com`,
        role: 'client',
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        connectionCount: 1,
        userAgent: userAgent || 'Unknown',
        isOnline: true
      };
      clients.push(newClient);
      existingClient = newClient;
      console.log(`👤 Nouveau client connecté: ${clientName} (${clientId})`);
      
      // SAUVEGARDE IMMÉDIATE du nouveau client
      saveClientsToFile();
    } else {
      // Client existant - mise à jour
      existingClient.lastActivity = new Date().toISOString();
      existingClient.connectionCount = (existingClient.connectionCount || 0) + 1;
      existingClient.userAgent = userAgent || existingClient.userAgent;
      existingClient.isOnline = true;
      console.log(`🔄 Client reconnecté: ${clientName} (${clientId})`);
      
      // SAUVEGARDE IMMÉDIATE de la mise à jour
      saveClientsToFile();
    }
    
    // Marquer comme connecté dans le système
    markUserConnected(clientId, existingClient);
    
    res.json({
      success: true,
      message: 'Client connecté avec succès',
      client: {
        id: existingClient.id,
        name: existingClient.name,
        email: existingClient.email,
        connectionCount: existingClient.connectionCount
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur connexion client:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// Route pour qu'un client signale sa déconnexion
app.post('/api/client/disconnect', (req, res) => {
  try {
    const { clientId } = req.body;
    
    if (!clientId) {
      return res.status(400).json({
        success: false,
        message: 'ClientId requis'
      });
    }
    
    // Marquer comme déconnecté
    if (connectedUsers.has(clientId)) {
      connectedUsers.delete(clientId);
      console.log(`👋 Client déconnecté: ${clientId}`);
    }
    
    // Mettre à jour dans la base clients
    const client = clients.find(c => c.id === clientId || c.senderId === clientId);
    if (client) {
      client.isOnline = false;
      client.lastActivity = new Date().toISOString();
    }
    
    res.json({
      success: true,
      message: 'Client déconnecté'
    });
    
  } catch (error) {
    console.error('❌ Erreur déconnexion client:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// Route pour créer un compte client (INSCRIPTION)
app.post('/api/client/register', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    
    // Validation des données
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nom, email et mot de passe requis'
      });
    }
    
    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Format email invalide'
      });
    }
    
    // Vérifier si l'email existe déjà
    const existingClient = clients.find(c => c.email === email);
    if (existingClient) {
      return res.status(409).json({
        success: false,
        message: 'Un compte avec cet email existe déjà'
      });
    }
    
    // Générer un ID unique
    const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    // Hasher le mot de passe (simulation - dans un vrai projet, utilisez bcrypt)
    const hashedPassword = `$hashed$${password}`;
    
    // Créer le nouveau client
    const newClient = {
      id: clientId,
      senderId: clientId,
      name: name.trim(),
      email: email.trim(),
      password: hashedPassword,
      phone: phone || '',
      address: address || '',
      role: 'client',
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      connectionCount: 0,
      messageCount: 0,
      isVerified: false,
      isOnline: false,
      registrationIP: req.ip || 'Unknown',
      userAgent: req.get('User-Agent') || 'Unknown'
    };
    
    // Ajouter à la base
    clients.push(newClient);
    
    console.log(`✅ Nouveau compte client créé: ${name} (${email})`);
    
    // SAUVEGARDE IMMÉDIATE
    saveClientsToFile();
    
    res.json({
      success: true,
      message: 'Compte client créé avec succès',
      client: {
        id: newClient.id,
        name: newClient.name,
        email: newClient.email,
        createdAt: newClient.createdAt
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur création compte client:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création du compte'
    });
  }
});

// Route pour obtenir le statut de tous les clients (ADMIN ONLY)
app.get('/api/admin/all-clients', verifyAdmin, (req, res) => {
  try {
    console.log('📊 Récupération de tous les clients pour admin dashboard...');
    
    // Récupérer tous les vrais clients de la base de données (users avec role='client' uniquement)
    const realClients = users.filter(user => 
      user.role === 'client' && 
      !user.email.includes('admin') && 
      !['admin', 'super_admin', 'dev', 'designer'].includes(user.role)
    );
    
    // Enrichir chaque client avec ses données complémentaires
    const allClients = realClients.map(client => {
      // Vérifier si connecté
      const isConnected = connectedClients.some(cc => cc.id === client.id);
      const connectedInfo = connectedClients.find(cc => cc.id === client.id);
      
      // Compter ses messages
      const clientMessages = chatMessages.filter(msg => 
        msg.senderId === client.id || msg.senderId === client.email
      );
      
      // Compter ses commandes
      const clientOrders = orders.filter(order => 
        order.userId === client.id || order.clientId === client.id
      );
      
      // Compter ses paiements
      const clientPayments = payments.filter(payment => 
        payment.userId === client.id || payment.clientId === client.id
      );
      
      return {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone || '',
        role: client.role,
        createdAt: client.createdAt || new Date().toISOString(),
        status: client.status || 'active',
        isOnline: isConnected,
        connectedAt: connectedInfo?.connectedAt || null,
        lastSeen: connectedInfo?.connectedAt || client.createdAt,
        
        // Statistiques détaillées
        messageCount: clientMessages.length,
        orderCount: clientOrders.length,
        paymentCount: clientPayments.length,
        
        // Données pour l'admin
        orders: clientOrders,
        payments: clientPayments,
        recentMessages: clientMessages.slice(-5) // 5 derniers messages
      };
    });
    
    // Statistiques complètes
    const stats = {
      totalClients: allClients.length,
      onlineClients: allClients.filter(c => c.isOnline).length,
      totalOrders: allClients.reduce((sum, c) => sum + c.orderCount, 0),
      totalPayments: allClients.reduce((sum, c) => sum + c.paymentCount, 0),
      totalMessages: allClients.reduce((sum, c) => sum + c.messageCount, 0),
      todayActive: allClients.filter(c => {
        const today = new Date().toDateString();
        return c.lastSeen && new Date(c.lastSeen).toDateString() === today;
      }).length
    };
    
    console.log(`📊 Clients récupérés: ${stats.totalClients} total, ${stats.onlineClients} en ligne, ${stats.totalOrders} commandes, ${stats.totalPayments} paiements`);
    
    res.json({
      success: true,
      clients: allClients.sort((a, b) => new Date(b.lastSeen) - new Date(a.lastSeen)),
      stats: stats,
      message: `${stats.totalClients} clients trouvés avec toutes leurs données`
    });
    
  } catch (error) {
    console.error('❌ Erreur récupération tous clients:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// Route pour vider TOUS les clients (DANGER - Admin uniquement)
app.delete('/api/admin/clear-all-clients', verifyAdmin, async (req, res) => {
  try {
    console.log('🚨 SUPPRESSION TOTALE DE TOUS LES CLIENTS DEMANDÉE');
    
    const initialUsersCount = users.length;
    const initialMessages = chatMessages.length;
    const initialConnections = connectedClients.length;
    
    // Garder seulement les comptes admin/staff (pas les clients)
    users = users.filter(user => ['admin', 'super_admin', 'dev', 'designer'].includes(user.role));
    
    // Vider toutes les données clients
    clients = [];
    chatMessages = [];
    connectedUsers.clear();
    connectedClients = connectedClients.filter(client => ['admin', 'super_admin', 'dev', 'designer'].includes(client.role));
    
    // SAUVEGARDER IMMÉDIATEMENT les changements
    await saveClientsToFile();
    await saveMessagesToFile();
    saveMessagesToFile();
    
    console.log('🗑️ SUPPRESSION COMPLÈTE TERMINÉE:');
    console.log(`   👤 Clients supprimés: ${initialCount}`);
    console.log(`   💬 Messages supprimés: ${initialMessages}`);
    console.log('💾 Données sauvegardées - Base maintenant vide');
    
    res.json({
      success: true,
      message: 'Tous les clients ont été supprimés définitivement',
      deleted: {
        clients: initialCount,
        messages: initialMessages
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur suppression totale:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// Route pour supprimer un client DÉFINITIVEMENT
app.delete('/api/admin/clients/:clientId', verifyAdmin, async (req, res) => {
  try {
    const { clientId } = req.params;
    console.log(`🗑️ SUPPRESSION DÉFINITIVE du client: ${clientId}`);
    
    let deletionReport = {
      clientData: null,
      connectionsRemoved: 0,
      messagesDeleted: 0,
      ordersDeleted: 0,
      paymentsDeleted: 0,
      quotesDeleted: 0
    };
    
    // 1. Récupérer les infos du client avant suppression
    const clientInConnected = connectedUsers.get(clientId);
    if (clientInConnected) {
      deletionReport.clientData = clientInConnected.userInfo;
    }
    
    // 2. SUPPRESSION COMPLÈTE DE LA BASE DE DONNÉES
    
    // 2a. Supprimer de la liste des clients permanents
    const initialClientCount = clients.length;
    clients = clients.filter(client => client.id !== clientId && client.senderId !== clientId);
    if (clients.length < initialClientCount) {
      console.log(`🗑️ Client supprimé de la base clients permanente`);
    }
    
    // 2b. Supprimer de la liste des utilisateurs (si présent)
    const initialUserCount = users.length;
    users = users.filter(user => user.id != clientId && user.email !== `${clientId}@client.com`);
    if (users.length < initialUserCount) {
      console.log(`🗑️ Client supprimé de la base utilisateurs`);
    }
    
    // 2c. Supprimer des connexions actives
    if (connectedUsers.has(clientId)) {
      connectedUsers.delete(clientId);
      deletionReport.connectionsRemoved = 1;
      console.log(`🗑️ Session active supprimée`);
    }
    
    // 2d. Supprimer TOUS les messages du client
    const initialMessageCount = chatMessages.length;
    chatMessages = chatMessages.filter(msg => 
      msg.senderId !== clientId && 
      msg.senderName !== deletionReport.clientData?.name
    );
    deletionReport.messagesDeleted = initialMessageCount - chatMessages.length;
    
    // 2e. Supprimer TOUTES les commandes du client
    const initialOrderCount = orders.length;
    orders = orders.filter(order => order.userId != clientId && order.clientId !== clientId);
    deletionReport.ordersDeleted = initialOrderCount - orders.length;
    
    // 2f. Supprimer TOUS les paiements du client
    const initialPaymentCount = payments.length;
    payments = payments.filter(payment => payment.userId != clientId && payment.clientId !== clientId);
    deletionReport.paymentsDeleted = initialPaymentCount - payments.length;
    
    // 2g. Supprimer TOUS les devis du client
    const initialQuoteCount = quotes.length;
    quotes = quotes.filter(quote => quote.userId != clientId && quote.clientId !== clientId);
    deletionReport.quotesDeleted = initialQuoteCount - quotes.length;
    
    // 3. LOG DÉTAILLÉ DE LA SUPPRESSION
    console.log(`📊 RAPPORT DE SUPPRESSION DÉFINITIVE:`);
    console.log(`   👤 Client: ${deletionReport.clientData?.name || clientId}`);
    console.log(`   🔌 Sessions: ${deletionReport.connectionsRemoved}`);
    console.log(`   💬 Messages: ${deletionReport.messagesDeleted}`);
    console.log(`   📦 Commandes: ${deletionReport.ordersDeleted}`);
    console.log(`   💳 Paiements: ${deletionReport.paymentsDeleted}`);
    console.log(`   📄 Devis: ${deletionReport.quotesDeleted}`);
    
    // 4. SAUVEGARDE DE LA SUPPRESSION (si fichier de log requis)
    const suppressionLog = {
      timestamp: new Date().toISOString(),
      adminAction: 'CLIENT_DELETION',
      clientId: clientId,
      clientName: deletionReport.clientData?.name || 'Inconnu',
      deletionReport: deletionReport,
      admin: req.user // Info de l'admin qui a fait la suppression
    };
    
    res.json({
      success: true,
      message: `Client ${clientId} DÉFINITIVEMENT supprimé du serveur`,
      report: {
        clientName: deletionReport.clientData?.name || clientId,
        totalDataDeleted: deletionReport.messagesDeleted + deletionReport.ordersDeleted + deletionReport.paymentsDeleted + deletionReport.quotesDeleted,
        messagesDeleted: deletionReport.messagesDeleted,
        ordersDeleted: deletionReport.ordersDeleted,
        paymentsDeleted: deletionReport.paymentsDeleted,
        quotesDeleted: deletionReport.quotesDeleted,
        timestamp: suppressionLog.timestamp
      }
    });
    
    console.log(`✅ Client ${clientId} EFFACÉ DÉFINITIVEMENT de toute la base de données/serveur`);
    console.log(`🔒 Aucune récupération possible - Suppression permanente terminée`);
    
    // SAUVEGARDE IMMÉDIATE après suppression
    await saveClientsToFile();
    await saveMessagesToFile();
    
  } catch (error) {
    console.error('❌ Erreur suppression client:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression'
    });
  }
});

// Route pour créer un nouveau administrateur
app.post('/api/admin/create', async (req, res) => {
  try {
    console.log('🆕 Création nouveau admin:', req.body);
    
    const { name, email, password, role } = req.body;
    
    // Validation des champs
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont requis'
      });
    }
    
    // Vérifier les rôles valides
    const validRoles = ['super_admin', 'admin', 'dev', 'designer'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Rôle invalide'
      });
    }
    
    // Vérifier si l'email existe déjà
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
    }
    
    // Validation du mot de passe
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe doit contenir au moins 6 caractères'
      });
    }
    
    // Hasher le mot de passe
    console.log('🔐 Hashage du mot de passe admin...');
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Créer le nouvel administrateur
    const newAdmin = {
      id: users.length + 1,
      name,
      email,
      password: hashedPassword,
      role,
      createdAt: new Date().toISOString(),
      isActive: true
    };
    
    users.push(newAdmin);
    clients.push(newAdmin); // Ajouter aussi dans clients pour la synchronisation
    
    // SAUVEGARDE IMMÉDIATE
    saveClientsToFile();
    
    console.log(`✅ Administrateur créé et sauvegardé:`, { 
      id: newAdmin.id, 
      name, 
      email, 
      role 
    });
    
    res.status(201).json({
      success: true,
      message: 'Administrateur créé avec succès',
      admin: {
        id: newAdmin.id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
        createdAt: newAdmin.createdAt
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur création admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création'
    });
  }
});


// Route d'enregistrement pour nouveaux clients
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('📝 Enregistrement - données:', { email: req.body.email, name: req.body.name });
    
    const { email, password, name, phone } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, mot de passe et nom requis' });
    }
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }
    
    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Créer le nouvel utilisateur
    const newUser = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      name,
      phone: phone || '',
      role: 'client',
      createdAt: new Date().toISOString(),
      status: 'active'
    };
    
    // Ajouter à la liste des utilisateurs ET des clients pour la persistance
    users.push(newUser);
    clients.push(newUser);
    
    // Sauvegarder immédiatement
    await saveClientsToFile();
    
    // Ajouter à la liste des clients connectés
    const clientInfo = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      connectedAt: new Date().toISOString(),
      status: 'online'
    };
    
    connectedClients.push(clientInfo);
    
    // Générer le token JWT
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log(`✅ Nouveau client enregistré et sauvegardé: ${newUser.name} (${newUser.email})`);
    
    res.status(201).json({
      message: 'Compte créé avec succès',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('❌ Erreur d\'enregistrement:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// ========================
// ROUTES GESTION DES PROJETS ET STATISTIQUES
// ========================

// Route pour créer un nouveau projet
app.post('/api/admin/projects', verifyAdmin, (req, res) => {
  try {
    const { title, description, clientId, budget, deadline, priority = 'medium' } = req.body;
    
    if (!title || !description || !clientId) {
      return res.status(400).json({
        success: false,
        message: 'Titre, description et client requis'
      });
    }

    const newProject = {
      id: Date.now().toString(),
      title,
      description,
      clientId,
      budget: parseFloat(budget) || 0,
      deadline: deadline ? new Date(deadline) : null,
      priority,
      status: 'planning',
      progress: 0,
      team: [],
      createdAt: new Date().toISOString(),
      createdBy: req.admin.userId
    };

    projects.push(newProject);
    statistics.activeProjects = projects.filter(p => ['planning', 'development', 'testing'].includes(p.status)).length;
    
    console.log(`📊 Nouveau projet créé: ${title}`);
    
    res.json({
      success: true,
      project: newProject,
      message: 'Projet créé avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur création projet:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// Route pour attribuer un membre à un projet
app.post('/api/admin/projects/:projectId/assign', verifyAdmin, (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId, role = 'developer' } = req.body;
    
    const project = projects.find(p => p.id === projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projet non trouvé'
      });
    }

    // Vérifier que l'utilisateur existe et est un membre de l'équipe
    const user = users.find(u => u.id.toString() === userId.toString() && 
                                 ['admin', 'super_admin', 'dev', 'designer'].includes(u.role));
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Membre de l\'équipe non trouvé'
      });
    }

    // Vérifier s'il n'est pas déjà assigné
    const alreadyAssigned = project.team.find(member => member.userId.toString() === userId.toString());
    if (alreadyAssigned) {
      return res.status(400).json({
        success: false,
        message: 'Ce membre est déjà assigné au projet'
      });
    }

    // Ajouter le membre au projet
    project.team.push({
      userId: parseInt(userId),
      userName: user.name,
      userEmail: user.email,
      role: role,
      assignedAt: new Date().toISOString(),
      assignedBy: req.admin.userId
    });

    console.log(`👤 ${user.name} assigné au projet ${project.title} comme ${role}`);

    res.json({
      success: true,
      project: project,
      message: `${user.name} assigné au projet avec succès`
    });

  } catch (error) {
    console.error('❌ Erreur attribution projet:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// Route pour récupérer tous les projets avec leurs équipes
app.get('/api/admin/projects', verifyAdmin, (req, res) => {
  try {
    const projectsWithDetails = projects.map(project => {
      const client = users.find(u => u.id.toString() === project.clientId.toString());
      return {
        ...project,
        clientName: client ? client.name : 'Client inconnu',
        teamCount: project.team.length,
        budgetFormatted: project.budget ? `$${project.budget.toLocaleString()}` : 'Non défini'
      };
    });

    res.json({
      success: true,
      projects: projectsWithDetails.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
      totalProjects: projects.length,
      statistics: statistics
    });

  } catch (error) {
    console.error('❌ Erreur récupération projets:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// Route pour mettre à jour le statut d'un projet
app.put('/api/admin/projects/:projectId/status', verifyAdmin, (req, res) => {
  try {
    const { projectId } = req.params;
    const { status, progress } = req.body;
    
    const project = projects.find(p => p.id === projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projet non trouvé'
      });
    }

    const validStatuses = ['planning', 'development', 'testing', 'review', 'completed', 'on-hold', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide'
      });
    }

    // Mettre à jour le projet
    if (status) project.status = status;
    if (progress !== undefined) project.progress = Math.max(0, Math.min(100, parseInt(progress)));
    project.updatedAt = new Date().toISOString();

    // Mettre à jour les statistiques
    if (status === 'completed' && project.status !== 'completed') {
      statistics.projectsCompleted++;
      if (project.budget) {
        statistics.totalRevenue += project.budget;
      }
    }
    
    statistics.activeProjects = projects.filter(p => ['planning', 'development', 'testing'].includes(p.status)).length;

    console.log(`📊 Projet ${project.title} mis à jour: ${status} (${progress}%)`);

    res.json({
      success: true,
      project: project,
      message: 'Projet mis à jour avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur mise à jour projet:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// Route pour récupérer les statistiques détaillées
app.get('/api/admin/statistics', verifyAdmin, (req, res) => {
  try {
    // Calculer les statistiques en temps réel
    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const activeProjects = projects.filter(p => ['planning', 'development', 'testing'].includes(p.status)).length;
    const onHoldProjects = projects.filter(p => p.status === 'on-hold').length;
    
    const totalRevenue = projects
      .filter(p => p.status === 'completed' && p.budget)
      .reduce((sum, p) => sum + p.budget, 0);
    
    const totalBudget = projects
      .filter(p => p.budget)
      .reduce((sum, p) => sum + p.budget, 0);

    // Statistiques par membre d'équipe
    const teamStats = {};
    projects.forEach(project => {
      project.team.forEach(member => {
        if (!teamStats[member.userId]) {
          teamStats[member.userId] = {
            name: member.userName,
            email: member.userEmail,
            projectsCount: 0,
            completedProjects: 0,
            roles: new Set()
          };
        }
        teamStats[member.userId].projectsCount++;
        teamStats[member.userId].roles.add(member.role);
        if (project.status === 'completed') {
          teamStats[member.userId].completedProjects++;
        }
      });
    });

    // Convertir les Sets en arrays pour JSON
    Object.values(teamStats).forEach(member => {
      member.roles = Array.from(member.roles);
    });

    // Projets par statut
    const projectsByStatus = {
      planning: projects.filter(p => p.status === 'planning').length,
      development: projects.filter(p => p.status === 'development').length,
      testing: projects.filter(p => p.status === 'testing').length,
      review: projects.filter(p => p.status === 'review').length,
      completed: completedProjects,
      'on-hold': onHoldProjects,
      cancelled: projects.filter(p => p.status === 'cancelled').length
    };

    const stats = {
      overview: {
        totalProjects,
        completedProjects,
        activeProjects,
        onHoldProjects,
        totalRevenue,
        totalBudget,
        averageProjectValue: totalProjects > 0 ? totalBudget / totalProjects : 0,
        completionRate: totalProjects > 0 ? (completedProjects / totalProjects * 100).toFixed(1) : 0
      },
      projectsByStatus,
      teamStats: Object.values(teamStats),
      recentProjects: projects
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(p => ({
          id: p.id,
          title: p.title,
          status: p.status,
          progress: p.progress,
          teamCount: p.team.length,
          createdAt: p.createdAt
        }))
    };

    res.json({
      success: true,
      statistics: stats,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erreur récupération statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
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

    // Ajouter à la liste des clients connectés
    const clientInfo = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      connectedAt: new Date().toISOString(),
      status: 'online'
    };
    
    // Retirer l'ancien client s'il existe
    connectedClients = connectedClients.filter(c => c.id !== user.id);
    connectedClients.push(clientInfo);
    
    // Ajouter aussi à la Map des utilisateurs connectés pour l'API admin
    connectedUsers.set(user.id.toString(), {
      lastSeen: new Date().toISOString(),
      userInfo: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
    
    // Générer le token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ Connexion réussie et sauvegardée:', user.email);
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
    
    // Créer automatiquement un projet correspondant à la commande
    const newProject = {
      id: Date.now().toString(),
      title: `Projet - ${description}`,
      description: description,
      clientId: userId,
      budget: typeof budget === 'number' ? budget : 0,
      deadline: deadline || null,
      priority: 'medium',
      status: 'planning',
      progress: 0,
      team: [],
      orderId: newOrder.id, // Lier le projet à la commande
      createdAt: new Date().toISOString(),
      createdBy: 'system' // Créé automatiquement par le système
    };
    
    projects.push(newProject);
    
    // Mettre à jour les statistiques
    statistics.activeProjects = projects.filter(p => ['planning', 'development', 'testing'].includes(p.status)).length;
    
    console.log('📝 Nouvelle commande:', newOrder);
    console.log('📊 Projet automatiquement créé:', newProject.title);
    
    res.status(201).json({ 
      message: 'Commande et projet créés avec succès', 
      order: newOrder,
      project: newProject
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
    'web-dev': '💻 Développement Site Web',
    'ui-ux': '🎨 UI/UX Design',
    'poster': '🖼️ Conception d\'affiches',
    'business-card': '💳 Cartes de visite',
    'logo': '🏷️ Logo Professionnel',
    'branding': '🎨 Identité visuelle complète',
    'others': '⚡ Autres services'
  };
  return services[serviceId] || '📄 Service personnalisé';
}

function getProjectTitle(serviceId) {
  const titles = {
    'web-dev': 'Développement Site Web',
    'ui-ux': 'Design UI/UX Personnalisé',
    'poster': 'Création d\'Affiches Professionnelles',
    'business-card': 'Cartes de Visite sur Mesure',
    'logo': 'Logo Professionnel Unique',
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
    
    // Récupérer les informations du client
    const client = users.find(u => u.id === userId);
    let clientInfo;
    
    if (client) {
      clientInfo = {
        name: client.name,
        email: client.email,
        phone: client.phone || req.body.clientPhone || 'Non renseigné'
      };
    } else {
      // Si pas de client trouvé, utiliser les données du formulaire
      clientInfo = {
        name: req.body.clientName || 'Client inconnu',
        email: contact || req.body.clientEmail || 'email@inconnu.com',
        phone: req.body.clientPhone || 'Non renseigné'
      };
    }

    // Créer le devis avec toutes les informations
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
      client: {
        name: clientInfo.name,
        email: clientInfo.email,
        phone: clientInfo.phone || 'Non renseigné'
      },
      status: 'pending',
      type: 'quote',
      createdAt: new Date().toISOString()
    };
    
    quotes.push(newQuote);
    
    // SAUVEGARDE IMMÉDIATE
    saveQuotesToFile();
    
    console.log('📋 Nouveau devis créé et sauvegardé:', newQuote);
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

// ========================
// ROUTES ADMIN POUR GESTION DES DEVIS
// ========================

// Route pour que l'admin récupère tous les devis
app.get('/api/admin/quotes', verifyAdmin, (req, res) => {
  try {
    // Enrichir les devis avec les informations clients
    const enrichedQuotes = quotes.map(quote => {
      const client = users.find(u => u.id == quote.userId);
      return {
        ...quote,
        clientName: client ? client.name : 'Client inconnu',
        clientEmail: client ? client.email : 'Email inconnu',
        clientPhone: client ? client.phone : '',
        createdAtFormatted: new Date(quote.createdAt).toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };
    });

    // Trier par date de création (plus récents en premier)
    const sortedQuotes = enrichedQuotes.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    console.log(`📋 Admin consultation devis: ${quotes.length} demandes`);

    res.json({
      success: true,
      quotes: sortedQuotes,
      stats: {
        total: quotes.length,
        pending: quotes.filter(q => q.status === 'pending').length,
        responded: quotes.filter(q => q.status === 'responded').length,
        accepted: quotes.filter(q => q.status === 'accepted').length,
        rejected: quotes.filter(q => q.status === 'rejected').length
      }
    });

  } catch (error) {
    console.error('❌ Erreur récupération devis admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// Route pour répondre à un devis
app.put('/api/admin/quotes/:id/respond', verifyAdmin, (req, res) => {
  try {
    const quoteId = parseInt(req.params.id);
    const { response, amount, currency, validUntil, notes, status } = req.body;

    const quote = quotes.find(q => q.id === quoteId);
    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Devis non trouvé'
      });
    }

    // Validation
    if (!response || !amount || !status) {
      return res.status(400).json({
        success: false,
        message: 'Réponse, montant et statut requis'
      });
    }

    // Mettre à jour le devis avec la réponse admin
    quote.adminResponse = {
      message: response,
      amount: parseFloat(amount),
      currency: currency || '$',
      validUntil: validUntil,
      notes: notes || '',
      respondedBy: req.admin.id,
      respondedAt: new Date().toISOString()
    };
    
    quote.status = status; // 'responded', 'accepted', 'rejected'
    quote.lastUpdate = new Date().toISOString();

    // Sauvegarder
    saveQuotesToFile();

    console.log(`💼 Réponse admin au devis #${quoteId}: ${status}`);

    res.json({
      success: true,
      message: 'Réponse envoyée avec succès',
      quote: quote
    });

  } catch (error) {
    console.error('❌ Erreur réponse devis:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// Nouvelle route pour répondre à un devis (format interface admin)
app.post('/api/admin/quotes/:id/respond', verifyAdmin, (req, res) => {
  try {
    console.log('🔍 Route respond POST appelée');
    console.log('📋 Params:', req.params);
    console.log('📦 Body:', req.body);
    console.log('👤 Admin:', req.admin);
    
    const quoteId = parseInt(req.params.id);
    const { proposedAmount, estimatedTime, message, terms } = req.body;

    console.log('🔢 Quote ID parsed:', quoteId);
    console.log('📊 Nombre de devis en mémoire:', quotes.length);

    const quote = quotes.find(q => q.id === quoteId);
    console.log('📄 Devis trouvé:', quote ? 'OUI' : 'NON');
    
    if (!quote) {
      console.log('❌ Devis non trouvé pour ID:', quoteId);
      return res.status(404).json({
        success: false,
        message: 'Devis non trouvé'
      });
    }

    // Validation
    console.log('✉️ Message reçu:', message ? 'OUI' : 'NON');
    if (!message) {
      console.log('❌ Message manquant');
      return res.status(400).json({
        success: false,
        message: 'Le message est obligatoire'
      });
    }

    // Mettre à jour le devis avec la réponse admin
    quote.adminResponse = {
      proposedAmount: proposedAmount || 'À discuter',
      estimatedTime: estimatedTime || 'À définir selon le projet',
      message: message,
      terms: terms || 'Conditions standard MiaTech',
      respondedAt: new Date().toISOString(),
      respondedBy: req.admin?.email || 'Admin'
    };
    
    quote.status = 'responded';
    quote.updatedAt = new Date().toISOString();

    // Sauvegarder
    saveQuotesToFile();

    console.log(`💬 Réponse admin au devis #${quoteId}:`, {
      amount: proposedAmount,
      time: estimatedTime,
      admin: req.admin?.email || 'Admin'
    });

    res.json({
      success: true,
      message: 'Réponse envoyée avec succès au client',
      quote: quote
    });

  } catch (error) {
    console.error('❌ Erreur envoi réponse devis:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// Route pour supprimer un devis
app.delete('/api/admin/quotes/:id', verifyAdmin, (req, res) => {
  try {
    const quoteId = parseInt(req.params.id);
    
    const quoteIndex = quotes.findIndex(q => q.id === quoteId);
    if (quoteIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Devis non trouvé'
      });
    }

    const deletedQuote = quotes.splice(quoteIndex, 1)[0];
    
    // Sauvegarder
    saveQuotesToFile();

    console.log(`🗑️ Devis #${quoteId} supprimé par admin:`, req.admin?.email || 'Admin');

    res.json({
      success: true,
      message: 'Devis supprimé avec succès',
      deletedQuote: deletedQuote
    });

  } catch (error) {
    console.error('❌ Erreur suppression devis:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// Route pour changer le statut d'un devis
app.put('/api/admin/quotes/:id/status', verifyAdmin, (req, res) => {
  try {
    const quoteId = parseInt(req.params.id);
    const { status, notes } = req.body;

    const quote = quotes.find(q => q.id === quoteId);
    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Devis non trouvé'
      });
    }

    const validStatuses = ['pending', 'responded', 'accepted', 'rejected', 'converted'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide'
      });
    }

    quote.status = status;
    quote.lastUpdate = new Date().toISOString();
    if (notes) {
      quote.adminNotes = notes;
    }

    // Sauvegarder
    saveQuotesToFile();

    console.log(`📊 Statut devis #${quoteId} changé vers: ${status}`);

    res.json({
      success: true,
      message: 'Statut mis à jour',
      quote: quote
    });

  } catch (error) {
    console.error('❌ Erreur changement statut devis:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// Route pour envoyer un accusé de réception au client
app.post('/api/admin/quotes/:quoteId/acknowledge', verifyAdmin, async (req, res) => {
  try {
    const { quoteId } = req.params;
    const { message } = req.body;

    const quote = quotes.find(q => q.id === quoteId);
    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Devis non trouvé'
      });
    }

    // Marquer comme accusé de réception
    quote.acknowledged = {
      acknowledgedAt: new Date().toISOString(),
      message: message || "Nous avons bien reçu votre demande de devis. Nous l'analysons et vous répondrons sous 48h maximum.",
      acknowledgedBy: req.admin.email
    };
    quote.lastUpdate = new Date().toISOString();

    // Sauvegarder
    saveQuotesToFile();

    console.log(`📧 Accusé de réception envoyé pour devis #${quoteId}`);

    res.json({
      success: true,
      message: 'Accusé de réception envoyé',
      quote: quote
    });

  } catch (error) {
    console.error('❌ Erreur accusé de réception:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// Route pour accepter un devis (action client)
app.post('/api/admin/quotes/:quoteId/accept', verifyAdmin, async (req, res) => {
  try {
    const { quoteId } = req.params;
    const { clientNotes } = req.body;

    const quote = quotes.find(q => q.id === quoteId);
    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Devis non trouvé'
      });
    }

    if (quote.status !== 'responded') {
      return res.status(400).json({
        success: false,
        message: 'Le devis doit être dans le statut "responded" pour être accepté'
      });
    }

    // Marquer comme accepté
    quote.status = 'accepted';
    quote.acceptedAt = new Date().toISOString();
    quote.clientAcceptance = {
      acceptedAt: new Date().toISOString(),
      clientNotes: clientNotes || 'Devis accepté',
      processedBy: req.admin.email
    };
    quote.lastUpdate = new Date().toISOString();

    // Sauvegarder
    saveQuotesToFile();

    console.log(`✅ Devis #${quoteId} accepté`);

    res.json({
      success: true,
      message: 'Devis accepté avec succès',
      quote: quote
    });

  } catch (error) {
    console.error('❌ Erreur acceptation devis:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// Route pour rejeter un devis (action client)
app.post('/api/admin/quotes/:quoteId/reject', verifyAdmin, async (req, res) => {
  try {
    const { quoteId } = req.params;
    const { rejectionReason, clientNotes } = req.body;

    const quote = quotes.find(q => q.id === quoteId);
    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Devis non trouvé'
      });
    }

    // Marquer comme rejeté
    quote.status = 'rejected';
    quote.rejectedAt = new Date().toISOString();
    quote.clientRejection = {
      rejectedAt: new Date().toISOString(),
      reason: rejectionReason || 'Budget insuffisant',
      clientNotes: clientNotes || 'Devis refusé par le client',
      processedBy: req.admin.email
    };
    quote.lastUpdate = new Date().toISOString();

    // Sauvegarder
    saveQuotesToFile();

    console.log(`❌ Devis #${quoteId} rejeté - Raison: ${rejectionReason}`);

    res.json({
      success: true,
      message: 'Devis rejeté',
      quote: quote
    });

  } catch (error) {
    console.error('❌ Erreur rejet devis:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// Route pour obtenir l'historique complet d'un devis
app.get('/api/admin/quotes/:quoteId/history', verifyAdmin, async (req, res) => {
  try {
    const { quoteId } = req.params;

    const quote = quotes.find(q => q.id === quoteId);
    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Devis non trouvé'
      });
    }

    // Construire l'historique chronologique
    const history = [];
    
    // Création
    history.push({
      action: 'created',
      timestamp: quote.createdAt,
      actor: 'client',
      actorName: quote.client.name,
      details: 'Demande de devis créée'
    });

    // Accusé de réception
    if (quote.acknowledged) {
      history.push({
        action: 'acknowledged',
        timestamp: quote.acknowledged.acknowledgedAt,
        actor: 'admin',
        actorName: quote.acknowledged.acknowledgedBy,
        details: quote.acknowledged.message
      });
    }

    // Réponse admin
    if (quote.adminResponse) {
      history.push({
        action: 'responded',
        timestamp: quote.adminResponse.respondedAt,
        actor: 'admin',
        actorName: quote.adminResponse.respondedBy || 'Admin MiaTech',
        details: `Devis proposé: $${quote.adminResponse.proposedAmount} - Délai: ${quote.adminResponse.estimatedTime}`
      });
    }

    // Acceptation
    if (quote.clientAcceptance) {
      history.push({
        action: 'accepted',
        timestamp: quote.clientAcceptance.acceptedAt,
        actor: 'admin',
        actorName: quote.clientAcceptance.processedBy,
        details: quote.clientAcceptance.clientNotes
      });
    }

    // Rejet
    if (quote.clientRejection) {
      history.push({
        action: 'rejected',
        timestamp: quote.clientRejection.rejectedAt,
        actor: 'admin',
        actorName: quote.clientRejection.processedBy,
        details: `Raison: ${quote.clientRejection.reason} - ${quote.clientRejection.clientNotes}`
      });
    }

    // Trier par timestamp
    history.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    res.json({
      success: true,
      quote: quote,
      history: history
    });

  } catch (error) {
    console.error('❌ Erreur historique devis:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

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

// === ROUTES DE PAIEMENT ===

// Route pour le paiement par carte (Stripe)
app.post('/api/payments/stripe', (req, res) => {
  try {
    const { orderId, amount, currency, cardData, customerData } = req.body;
    
    // Validation basique
    if (!orderId || !amount || !cardData || !customerData) {
      return res.status(400).json({ message: 'Données de paiement manquantes' });
    }
    
    // Simuler le traitement Stripe (dans un vrai système, utiliser l'API Stripe)
    const isValidCard = cardData.number.length >= 13 && cardData.cvv.length >= 3;
    
    if (!isValidCard) {
      return res.status(400).json({ 
        success: false, 
        error: 'Données de carte invalides' 
      });
    }
    
    // Simuler succès (95% de réussite)
    const success = Math.random() > 0.05;
    
    if (success) {
      const payment = {
        id: payments.length + 1,
        orderId,
        amount,
        currency: currency || 'usd',
        method: 'stripe',
        status: 'completed',
        transactionId: 'str_' + Date.now() + Math.random().toString(36).substr(2, 9),
        customerData,
        createdAt: new Date().toISOString()
      };
      
      payments.push(payment);
      
      // Mettre à jour le statut de la commande
      const order = orders.find(o => o.id === orderId);
      if (order) {
        order.status = 'paid';
        order.paymentId = payment.id;
      }
      
      console.log('💳 Paiement Stripe réussi:', payment.transactionId);
      res.json({ 
        success: true, 
        transactionId: payment.transactionId,
        payment 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        error: 'Transaction refusée par la banque' 
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur paiement Stripe:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Configuration des comptes de réception pour les paiements mobiles
const PAYMENT_RECIPIENTS = {
  'mpesa': '+243821200427',        // M-Pesa MiaTech
  'orange-money': '+243894445119', // Orange Money MiaTech  
  'airtel-money': '+243994075028'  // Airtel Money MiaTech
};

// Route pour le paiement mobile (M-Pesa, Orange Money, Airtel Money)
app.post('/api/payments/mobile', (req, res) => {
  try {
    const { orderId, amount, method, phoneNumber, customerData } = req.body;
    
    // Validation basique
    if (!orderId || !amount || !method || !phoneNumber || !customerData) {
      return res.status(400).json({ message: 'Données de paiement manquantes' });
    }
    
    // Validation du numéro de téléphone pour l'Afrique Centrale
    const phoneValidation = {
      'mpesa': /^(\+243|243)[0-9]{9}$/,        // RDC M-Pesa
      'orange-money': /^(\+243|243)[0-9]{9}$/, // RDC Orange Money
      'airtel-money': /^(\+243|243)[0-9]{9}$/  // RDC Airtel Money
    };
    
    const isValidPhone = phoneValidation[method] ? 
      phoneValidation[method].test(phoneNumber.replace(/\s/g, '')) : 
      phoneNumber.length >= 10;
    
    if (!isValidPhone) {
      return res.status(400).json({ 
        success: false, 
        error: 'Numéro de téléphone invalide pour ce service' 
      });
    }
    
    // Simuler succès (90% de réussite)
    const success = Math.random() > 0.1;
    
    if (success) {
      // Récupérer le numéro de réception pour cette méthode
      const recipientNumber = PAYMENT_RECIPIENTS[method];
      
      const payment = {
        id: payments.length + 1,
        orderId,
        amount,
        currency: 'USD',
        method,
        phoneNumber,
        recipientNumber,
        status: 'completed',
        transactionId: method.toUpperCase().substr(0, 3) + '_' + Date.now() + Math.random().toString(36).substr(2, 9),
        customerData,
        createdAt: new Date().toISOString()
      };
      
      payments.push(payment);
      
      // Mettre à jour le statut de la commande
      const order = orders.find(o => o.id === orderId);
      if (order) {
        order.status = 'paid';
        order.paymentId = payment.id;
      }
      
      console.log(`📱 Paiement ${method} de $${amount} reçu sur ${recipientNumber}`);
      res.json({ 
        success: true, 
        transactionId: payment.transactionId,
        payment,
        recipientNumber,
        message: `Paiement de $${amount} effectué avec ${method.toUpperCase()}. Fonds reçus sur ${recipientNumber}`
      });
    } else {
      res.status(400).json({ 
        success: false, 
        error: 'Paiement mobile échoué. Vérifiez votre solde et réessayez.' 
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur paiement mobile:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route pour générer une facture PDF
app.post('/api/payments/generate-invoice', (req, res) => {
  try {
    const { orderId, transactionId, customerData } = req.body;
    
    // Rechercher le paiement et la commande
    const payment = payments.find(p => p.transactionId === transactionId);
    const order = orders.find(o => o.id === orderId);
    
    if (!payment || !order) {
      return res.status(404).json({ message: 'Paiement ou commande non trouvé' });
    }
    
    // Créer le PDF
    const doc = new PDFDocument();
    
    // Headers pour le téléchargement
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=facture-${orderId}-${transactionId}.pdf`);
    
    // Pipe le PDF vers la réponse
    doc.pipe(res);
    
    // === CONTENU DU PDF ===
    
    // En-tête
    doc.fontSize(20).fillColor('#667eea')
       .text('MiaTech', 50, 50);
    
    doc.fontSize(12).fillColor('black')
       .text('Solutions Technologiques Innovantes', 50, 75)
       .text('Email: contact@miatech.com', 50, 90)
       .text('Tél: +1 234 567 8900', 50, 105);
    
    // Ligne de séparation
    doc.moveTo(50, 130).lineTo(550, 130).stroke();
    
    // Titre facture
    doc.fontSize(18).fillColor('#1f2937')
       .text('FACTURE', 50, 150);
    
    // Informations facture
    doc.fontSize(10)
       .text(`Numéro: INV-${orderId}-${Date.now()}`, 50, 180)
       .text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 50, 195)
       .text(`Transaction: ${transactionId}`, 50, 210);
    
    // Informations client
    doc.fontSize(12).fillColor('#374151')
       .text('FACTURATION À:', 350, 150);
    
    doc.fontSize(10)
       .text(customerData.name, 350, 180)
       .text(customerData.email, 350, 195);
    
    // Table des services
    let yPos = 260;
    
    // En-tête du tableau
    doc.rect(50, yPos, 500, 25).fillAndStroke('#f3f4f6', '#e5e7eb');
    doc.fillColor('black').fontSize(10)
       .text('Description', 60, yPos + 8)
       .text('Méthode', 300, yPos + 8)
       .text('Montant', 450, yPos + 8);
    
    yPos += 25;
    
    // Ligne du service
    const serviceNames = {
      'web-dev': 'Développement Site Web',
      'ui-ux': 'Design UI/UX',
      'poster': 'Conception d\'Affiches',
      'business-card': 'Cartes de Visite',
      'logo': 'Logo Professionnel',
      'others': 'Service Personnalisé'
    };
    
    const serviceName = serviceNames[order.serviceId] || 'Service MiaTech';
    const paymentMethodNames = {
      'stripe': 'Carte Bancaire',
      'mpesa': 'M-Pesa',
      'orange-money': 'Orange Money',
      'airtel-money': 'Airtel Money'
    };
    
    doc.rect(50, yPos, 500, 30).stroke('#e5e7eb');
    doc.text(serviceName, 60, yPos + 8)
       .text(paymentMethodNames[payment.method] || payment.method, 300, yPos + 8)
       .text(`$${payment.amount}`, 450, yPos + 8);
    
    yPos += 30;
    
    // Total
    doc.rect(350, yPos + 20, 200, 25).fillAndStroke('#059669', '#047857');
    doc.fillColor('white').fontSize(12)
       .text(`TOTAL: $${payment.amount}`, 360, yPos + 28);
    
    // Pied de page
    doc.fillColor('#6b7280').fontSize(8)
       .text('Merci pour votre confiance ! Cette facture a été générée automatiquement.', 50, 700)
       .text(`Paiement effectué le ${new Date(payment.createdAt).toLocaleDateString('fr-FR')} à ${new Date(payment.createdAt).toLocaleTimeString('fr-FR')}`, 50, 715);
    
    // Statut payé
    doc.fillColor('#059669').fontSize(14)
       .text('✓ PAYÉ', 480, 680);
    
    // Finaliser le PDF
    doc.end();
    
    console.log(`📄 Facture générée: INV-${orderId}-${transactionId}`);
    
  } catch (error) {
    console.error('❌ Erreur génération facture:', error);
    res.status(500).json({ message: 'Erreur génération facture' });
  }
});

// Route pour voir tous les paiements (admin)
app.get('/api/admin/payments', (req, res) => {
  console.log(`💰 Consultation des paiements - Total: ${payments.length}`);
  res.json({ 
    count: payments.length, 
    payments,
    totalAmount: payments.reduce((sum, p) => sum + p.amount, 0)
  });
});

// === ROUTES DE CHAT EN TEMPS RÉEL ===

// Route pour récupérer tous les messages
app.get('/api/chat/messages', (req, res) => {
  try {
    console.log('📬 Chargement des messages de chat');
    
    // Trier par date (plus anciens en premier pour affichage chronologique)
    const sortedMessages = chatMessages.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    res.json({ 
      success: true, 
      messages: sortedMessages,
      count: sortedMessages.length 
    });
    
  } catch (error) {
    console.error('❌ Erreur chargement messages:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Route pour envoyer un message
app.post('/api/chat/send', (req, res) => {
  try {
    const { message, senderId, senderName, senderRole, isAdmin } = req.body;
    
    // Pour les messages admin, utiliser les infos par défaut
    let finalSenderId = senderId;
    let finalSenderName = senderName;
    let finalSenderRole = senderRole;
    
    if (isAdmin) {
      finalSenderId = 'admin_001';
      finalSenderName = 'Admin MiaTech';
      finalSenderRole = 'admin';
    }
    
    // Validation
    if (!message || !finalSenderId || !finalSenderName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Données manquantes' 
      });
    }
    
    // Créer le nouveau message
    const newMessage = {
      id: chatMessages.length + 1,
      senderId: finalSenderId,
      senderName: finalSenderName,
      senderRole: finalSenderRole || 'client',
      message: message.trim(),
      timestamp: new Date().toISOString(),
      isRead: false
    };
    
    chatMessages.push(newMessage);
    
    // Enregistrer automatiquement le client dans la base permanente
    if (finalSenderRole === 'client') {
      const existingClient = clients.find(c => c.id === finalSenderId || c.senderId === finalSenderId);
      if (!existingClient) {
        const clientData = {
          id: finalSenderId,
          senderId: finalSenderId,
          name: finalSenderName,
          email: `${finalSenderId}@client.com`,
          role: 'client',
          createdAt: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
          messageCount: 1
        };
        clients.push(clientData);
        console.log(`👤 Nouveau client enregistré dans la base: ${finalSenderName} (${finalSenderId})`);
        
        // SAUVEGARDE IMMÉDIATE du nouveau client
        saveClientsToFile();
      } else {
        // Mettre à jour l'activité
        existingClient.lastActivity = new Date().toISOString();
        existingClient.messageCount = (existingClient.messageCount || 0) + 1;
        console.log(`🔄 Activité client mise à jour: ${finalSenderName}`);
        
        // SAUVEGARDE IMMÉDIATE de la mise à jour
        saveClientsToFile();
      }
    }
    
    console.log(`💬 Nouveau message de ${finalSenderName} (${finalSenderRole}): "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);
    
    // Déclencher notification email si c'est un client qui écrit
    if (finalSenderRole !== 'admin' && finalSenderRole !== 'super_admin') {
      sendNotificationEmail(newMessage);
    }
    
    res.json({ 
      success: true, 
      message: newMessage,
      messageId: newMessage.id 
    });
    
  } catch (error) {
    console.error('❌ Erreur envoi message:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Route pour marquer les messages comme lus
app.post('/api/chat/mark-read', (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: 'ID utilisateur requis' });
    }
    
    // Marquer tous les messages non-lus envoyés par d'autres comme lus
    let markedCount = 0;
    chatMessages.forEach(msg => {
      if (msg.senderId !== userId && !msg.isRead) {
        msg.isRead = true;
        markedCount++;
      }
    });
    
    console.log(`✅ ${markedCount} messages marqués comme lus pour l'utilisateur ${userId}`);
    
    res.json({ 
      success: true, 
      markedCount 
    });
    
  } catch (error) {
    console.error('❌ Erreur marquage lecture:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Route pour marquer un message spécifique comme lu
app.put('/api/chat/messages/:messageId/read', (req, res) => {
  try {
    const { messageId } = req.params;
    const msgId = parseInt(messageId);
    
    const messageIndex = chatMessages.findIndex(msg => msg.id === msgId);
    
    if (messageIndex !== -1) {
      chatMessages[messageIndex].isRead = true;
      console.log(`✅ Message ID ${msgId} marqué comme lu`);
      
      res.json({ 
        success: true, 
        message: 'Message marqué comme lu',
        messageId: msgId
      });
    } else {
      res.status(404).json({ 
        success: false, 
        message: 'Message non trouvé' 
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur marquage message:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Route pour obtenir le nombre de messages non lus (pour les notifications)
app.get('/api/chat/unread/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    
    const unreadCount = chatMessages.filter(msg => 
      msg.senderId !== userId && !msg.isRead
    ).length;
    
    res.json({ 
      success: true, 
      unreadCount,
      hasUnread: unreadCount > 0 
    });
    
  } catch (error) {
    console.error('❌ Erreur comptage messages non lus:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Route admin pour voir tous les messages avec statistiques
app.get('/api/admin/chat/stats', (req, res) => {
  try {
    const totalMessages = chatMessages.length;
    const unreadMessages = chatMessages.filter(msg => !msg.isRead).length;
    const clientMessages = chatMessages.filter(msg => msg.senderRole !== 'admin').length;
    const adminResponses = chatMessages.filter(msg => msg.senderRole === 'admin').length;
    
    // Regrouper par utilisateur
    const userStats = {};
    chatMessages.forEach(msg => {
      if (!userStats[msg.senderId]) {
        userStats[msg.senderId] = {
          name: msg.senderName,
          role: msg.senderRole,
          messageCount: 0,
          lastMessage: null
        };
      }
      userStats[msg.senderId].messageCount++;
      if (!userStats[msg.senderId].lastMessage || 
          new Date(msg.timestamp) > new Date(userStats[msg.senderId].lastMessage)) {
        userStats[msg.senderId].lastMessage = msg.timestamp;
      }
    });
    
    res.json({
      success: true,
      stats: {
        totalMessages,
        unreadMessages,
        clientMessages,
        adminResponses,
        responseRate: totalMessages > 0 ? (adminResponses / totalMessages * 100).toFixed(1) : 0
      },
      users: Object.values(userStats)
    });
    
  } catch (error) {
    console.error('❌ Erreur stats chat:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Fonction pour envoyer une notification email
async function sendNotificationEmail(message) {
  try {
    console.log(`📧 Notification email: Nouveau message de ${message.senderName}`);
    
    // Ici vous pourriez intégrer un service d'email réel comme:
    // - Nodemailer + SMTP
    // - SendGrid
    // - AWS SES
    // - Mailgun
    
    // Pour l'instant, simulation
    const emailData = {
      to: 'admin@miatech.com',
      subject: `💬 Nouveau message de ${message.senderName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
            <h1>💬 MiaTech Chat</h1>
            <p>Nouveau message reçu</p>
          </div>
          
          <div style="padding: 30px; background: #f8fafc;">
            <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #1f2937; margin-bottom: 15px;">Message de ${message.senderName}</h2>
              <p style="color: #6b7280; font-size: 14px; margin-bottom: 15px;">
                📅 ${new Date(message.timestamp).toLocaleString('fr-FR')}
              </p>
              <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; border-left: 4px solid #667eea;">
                <p style="margin: 0; color: #374151; line-height: 1.6;">
                  "${message.message}"
                </p>
              </div>
            </div>
          </div>
          
          <div style="background: #1f2937; color: white; padding: 20px; text-align: center;">
            <p>Connectez-vous à l'administration pour répondre</p>
            <a href="http://localhost:5000/admin.html" 
               style="background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Accéder au Chat Admin
            </a>
          </div>
        </div>
      `
    };
    
    console.log('📧 Email préparé:', emailData.subject);
    
    // Ici on enverrait réellement l'email
    // await emailService.send(emailData);
    
  } catch (error) {
    console.error('❌ Erreur notification email:', error);
  }
}

// ========================
// SYSTÈME DE NOTIFICATIONS
// ========================

// Route pour récupérer les notifications admin
app.get('/api/admin/notifications', verifyAdmin, (req, res) => {
  try {
    console.log('📢 Récupération des notifications admin');
    
    // Compter les messages non lus
    const unreadMessages = chatMessages.filter(msg => !msg.isRead).length;
    
    // Compter les nouveaux devis
    const pendingQuotes = quotes.filter(q => q.status === 'pending').length;
    
    // Compter les nouvelles commandes
    const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length;
    
    // Compter les utilisateurs connectés récemment (dernières 24h)
    const recentUsers = Array.from(connectedUsers.values()).filter(user => {
      const lastSeen = new Date(user.lastSeen);
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return lastSeen > yesterday;
    }).length;

    const notifications = [
      {
        id: 'messages',
        type: 'messages',
        title: 'Messages non lus',
        count: unreadMessages,
        icon: '💬',
        priority: unreadMessages > 0 ? 'high' : 'normal',
        description: unreadMessages > 0 ? 
          `Vous avez ${unreadMessages} nouveau${unreadMessages > 1 ? 'x' : ''} message${unreadMessages > 1 ? 's' : ''}` :
          'Aucun nouveau message'
      },
      {
        id: 'quotes',
        type: 'quotes', 
        title: 'Demandes de devis',
        count: pendingQuotes,
        icon: '📋',
        priority: pendingQuotes > 0 ? 'medium' : 'normal',
        description: pendingQuotes > 0 ?
          `${pendingQuotes} demande${pendingQuotes > 1 ? 's' : ''} de devis en attente` :
          'Aucune demande en attente'
      },
      {
        id: 'orders',
        type: 'orders',
        title: 'Commandes',
        count: pendingOrders,
        icon: '🛒', 
        priority: pendingOrders > 0 ? 'medium' : 'normal',
        description: pendingOrders > 0 ?
          `${pendingOrders} commande${pendingOrders > 1 ? 's' : ''} à traiter` :
          'Aucune commande en attente'
      },
      {
        id: 'users',
        type: 'activity',
        title: 'Activité récente',
        count: recentUsers,
        icon: '👥',
        priority: 'low',
        description: `${recentUsers} utilisateur${recentUsers > 1 ? 's' : ''} actif${recentUsers > 1 ? 's' : ''} (24h)`
      }
    ];

    // Calculer le total des notifications importantes
    const totalImportant = unreadMessages + pendingQuotes + pendingOrders;
    
    res.json({
      success: true,
      notifications: notifications,
      summary: {
        total: totalImportant,
        unreadMessages: unreadMessages,
        pendingQuotes: pendingQuotes,
        pendingOrders: pendingOrders,
        recentUsers: recentUsers
      },
      lastUpdate: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erreur récupération notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// Route pour marquer tous les messages comme lus (DOIT ÊTRE AVANT la route avec :id)
app.put('/api/admin/messages/read-all', verifyAdmin, (req, res) => {
  try {
    const unreadMessages = chatMessages.filter(m => !m.isRead);
    const count = unreadMessages.length;
    
    unreadMessages.forEach(message => {
      message.isRead = true;
      message.readAt = new Date().toISOString();
      message.readBy = req.admin.email;
    });
    
    if (count > 0) {
      saveMessagesToFile();
    }
    
    console.log(`📧 ${count} messages marqués comme lus par ${req.admin.email}`);
    
    res.json({
      success: true,
      message: `${count} message${count > 1 ? 's' : ''} marqué${count > 1 ? 's' : ''} comme lu${count > 1 ? 's' : ''}`,
      count: count
    });

  } catch (error) {
    console.error('❌ Erreur marquage tous messages lus:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// Route pour marquer un message comme lu
app.put('/api/admin/messages/:id/read', verifyAdmin, (req, res) => {
  try {
    const messageId = parseInt(req.params.id);
    const message = chatMessages.find(m => m.id === messageId);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé'
      });
    }
    
    message.isRead = true;
    message.readAt = new Date().toISOString();
    message.readBy = req.admin.email;
    
    // Sauvegarder
    saveMessagesToFile();
    
    console.log(`📧 Message #${messageId} marqué comme lu par ${req.admin.email}`);
    
    res.json({
      success: true,
      message: 'Message marqué comme lu',
      data: message
    });

  } catch (error) {
    console.error('❌ Erreur marquage message lu:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// Route 404
app.use('*', (req, res) => {
  console.log('❌ Route non trouvée:', req.originalUrl);
  res.status(404).json({ message: 'Route non trouvée' });
});

// Middleware de gestion d'erreurs global
app.use((err, req, res, next) => {
  console.error('🚨 Erreur middleware:', err.message);
  console.error('Stack:', err.stack);
  
  // Ne pas exposer les erreurs en production
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  res.status(err.status || 500).json({
    success: false,
    message: isDevelopment ? err.message : 'Erreur serveur interne',
    ...(isDevelopment && { stack: err.stack })
  });
});

// Route pour les 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route non trouvée: ${req.method} ${req.originalUrl}`
  });
});

// Démarrage du serveur avec gestion d'erreurs
let httpServer;

const startServer = () => {
  try {
    httpServer = app.listen(PORT, () => {
      console.log('🚀 ====================================');
      console.log(`   MiaTech Serveur Temporaire`);
      console.log(`   📍 Port: ${PORT}`);
      console.log(`   🌍 URL: http://localhost:${PORT}`);
      console.log(`   👤 Utilisateurs: ${users.length}`);
      console.log(`   📧 Test: admin@miatech.com / admin123`);
      console.log(`   🛡️  Gestion d'erreurs: Activée`);
      console.log(`   🔄 Auto-restart: Disponible`);
      console.log('====================================');
    });
    
    httpServer.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`❌ Port ${PORT} déjà utilisé. Tentative sur port ${PORT + 1}...`);
        PORT = PORT + 1;
        setTimeout(startServer, 1000);
      } else {
        console.error('� Erreur serveur:', err);
        // Retry après erreur
        setTimeout(startServer, 5000);
      }
    });
    
    // Heartbeat pour vérifier la santé du serveur
    setInterval(() => {
      if (httpServer && httpServer.listening) {
        console.log(`💚 Serveur en vie - ${new Date().toLocaleTimeString()}`);
      }
    }, 300000); // Toutes les 5 minutes
    
  } catch (error) {
    console.error('� Erreur démarrage serveur:', error);
    setTimeout(startServer, 5000); // Retry après 5 secondes
  }
};

// Route de test pour réinitialiser les mots de passe (développement seulement)
app.post('/api/test/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Hacher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    
    // Sauvegarder
    await saveClientsToFile();
    
    console.log(`🔄 Mot de passe réinitialisé pour ${email}`);
    res.json({ message: `Mot de passe réinitialisé pour ${user.name}` });
    
  } catch (error) {
    console.error('❌ Erreur réinitialisation:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ========================
// ROUTES DE LIVRAISON DE PROJET
// ========================

// Route pour livrer un projet
app.post('/api/projects/:id/delivery', (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const { deliverables, deliveryNotes, clientMessage } = req.body;
    
    const project = projects.find(p => p.id === projectId);
    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }
    
    // Marquer le projet comme livré
    project.status = 'delivered';
    project.deliveryDate = new Date().toISOString().split('T')[0];
    project.deliveryNotes = deliveryNotes;
    
    // Ajouter les livrables
    if (deliverables && deliverables.length > 0) {
      project.files = project.files || [];
      deliverables.forEach(deliverable => {
        project.files.push({
          id: project.files.length + 1,
          name: deliverable.name,
          type: deliverable.type || 'other',
          url: deliverable.url || '#',
          uploadDate: new Date().toISOString().split('T')[0],
          isDeliverable: true,
          description: deliverable.description || ''
        });
      });
    }
    
    // Ajouter message de livraison
    project.comments = project.comments || [];
    project.comments.push({
      id: project.comments.length + 1,
      author: "Équipe MiaTech",
      message: clientMessage || `🎉 Félicitations ! Votre projet "${project.title}" est maintenant terminé et livré. Vous trouverez tous les fichiers finaux ci-dessous. Merci pour votre confiance !`,
      date: new Date().toISOString().split('T')[0],
      isFromClient: false,
      isDeliveryMessage: true
    });
    
    // Marquer tous les milestones comme complétés
    project.milestones.forEach(milestone => {
      if (!milestone.completed) {
        milestone.completed = true;
        milestone.completedDate = new Date().toISOString().split('T')[0];
      }
    });
    
    project.progress = 100;
    
    // Sauvegarder
    saveProjectsToFile();
    
    console.log(`🚀 PROJET LIVRÉ: ${project.title} pour client ID ${project.userId}`);
    
    res.json({
      message: 'Projet livré avec succès',
      project: project
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la livraison:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route pour télécharger tous les fichiers d'un projet
app.get('/api/projects/:id/download-all', (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }
    
    const deliverables = project.files?.filter(file => file.isDeliverable) || [];
    
    console.log(`📥 TÉLÉCHARGEMENT: ${deliverables.length} fichiers pour projet ${project.title}`);
    
    res.json({
      projectTitle: project.title,
      deliverables: deliverables,
      deliveryDate: project.deliveryDate,
      deliveryNotes: project.deliveryNotes,
      downloadInfo: {
        totalFiles: deliverables.length,
        projectStatus: project.status,
        completionDate: project.deliveryDate
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur lors du téléchargement:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route pour envoyer un email de livraison
app.post('/api/projects/:id/send-delivery-email', (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }
    
    const client = clients.find(c => c.id == project.userId);
    if (!client) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }
    
    const deliverables = project.files?.filter(f => f.isDeliverable) || [];
    
    // Simuler l'envoi d'email de livraison
    console.log(`\n📧 ===============================`);
    console.log(`   EMAIL DE LIVRAISON ENVOYÉ`);
    console.log(`===============================`);
    console.log(`👤 CLIENT: ${client.name} (${client.email})`);
    console.log(`📋 PROJET: ${project.title}`);
    console.log(`📅 DATE DE LIVRAISON: ${project.deliveryDate}`);
    console.log(`📎 FICHIERS LIVRÉS: ${deliverables.length} fichiers`);
    console.log(`💼 SERVICE: ${project.service}`);
    if (project.deliveryNotes) {
      console.log(`📝 NOTES: ${project.deliveryNotes}`);
    }
    console.log(`🔗 ACCÈS PROJET: http://localhost:5175/projects/${project.id}`);
    console.log(`===============================\n`);
    
    res.json({
      message: 'Email de livraison envoyé avec succès',
      emailSentTo: client.email,
      clientName: client.name,
      projectTitle: project.title,
      deliverables: deliverables,
      deliveryInfo: {
        projectId: project.id,
        deliveryDate: project.deliveryDate,
        totalFiles: deliverables.length,
        projectUrl: `http://localhost:5175/projects/${project.id}`
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route pour marquer un projet comme terminé (avant livraison)
app.put('/api/projects/:id/complete', (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }
    
    project.status = 'completed';
    project.completedDate = new Date().toISOString().split('T')[0];
    
    // Marquer tous les milestones comme complétés
    project.milestones.forEach(milestone => {
      if (!milestone.completed) {
        milestone.completed = true;
        milestone.completedDate = new Date().toISOString().split('T')[0];
      }
    });
    
    project.progress = 100;
    
    // Ajouter un commentaire de completion
    project.comments = project.comments || [];
    project.comments.push({
      id: project.comments.length + 1,
      author: "Équipe MiaTech",
      message: `✅ Le projet "${project.title}" est maintenant terminé ! Nous préparons les fichiers pour la livraison finale.`,
      date: new Date().toISOString().split('T')[0],
      isFromClient: false,
      isCompletionMessage: true
    });
    
    saveProjectsToFile();
    
    console.log(`✅ PROJET TERMINÉ: ${project.title}`);
    
    res.json({
      message: 'Projet marqué comme terminé',
      project: project
    });
    
  } catch (error) {
    console.error('❌ Erreur completion projet:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route pour créer un paiement (test)
app.post('/api/payments', (req, res) => {
  try {
    const { userId, orderId, amount, method, status, description } = req.body;
    
    const payment = {
      id: payments.length + 1,
      userId,
      orderId,
      amount,
      method,
      status: status || 'pending',
      description,
      createdAt: new Date().toISOString()
    };
    
    payments.push(payment);
    console.log(`💳 Paiement créé: $${amount} pour user ${userId}`);
    
    res.json({
      message: 'Paiement créé avec succès',
      payment
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur création paiement' });
  }
});

// Démarrer le serveur
startServer();