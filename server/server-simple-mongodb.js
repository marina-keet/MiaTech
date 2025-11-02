const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Connexion à la base de données
const connectDB = require('./config/database');

// Import des modèles
const User = require('./models/User');
const Service = require('./models/Service');
const Order = require('./models/Order');
const Payment = require('./models/Payment');
const Message = require('./models/Message');
const File = require('./models/File');

const app = express();

// CORS
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Body parser
app.use(express.json());

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({ 
    status: '✅ OK',
    message: '🚀 MiaTech API avec MongoDB',
    database: 'mia_tech',
    collections: ['users', 'services', 'orders', 'payments', 'messages', 'files'],
    timestamp: new Date().toISOString()
  });
});

// Routes de test pour les données
app.get('/api/test/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ count: users.length, users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/test/services', async (req, res) => {
  try {
    const services = await Service.find();
    res.json({ count: services.length, services });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/test/orders', async (req, res) => {
  try {
    const orders = await Order.find().populate('user_id').populate('service_id');
    res.json({ count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route d'authentification simple
app.post('/api/auth/register', async (req, res) => {
  console.log('📝 Tentative d\'inscription:', req.body);
  
  try {
    const { name, email, password } = req.body;
    
    console.log('Données reçues:', { name, email, password: password ? '***' : 'vide' });
    
    if (!name || !email || !password) {
      console.log('❌ Champs manquants');
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }

    console.log('🔍 Vérification email existant...');
    // Vérifier si l'utilisateur existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ Email déjà utilisé:', email);
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    console.log('👤 Création de l\'utilisateur...');
    // Créer l'utilisateur (le mot de passe sera hashé par le modèle)
    const user = new User({
      name,
      email,
      password: password // Le middleware pre('save') va s'en occuper
    });

    console.log('💾 Sauvegarde en cours...');
    await user.save();
    console.log('✅ Utilisateur sauvegardé avec ID:', user._id);

    res.status(201).json({ 
      message: 'Utilisateur créé avec succès',
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });

  } catch (error) {
    console.error('❌ Erreur register complète:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      message: 'Erreur serveur', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Une erreur est survenue'
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    // Trouver l'utilisateur
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Identifiants invalides' });
    }

    // Vérifier le mot de passe
    const bcrypt = require('bcryptjs');
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Identifiants invalides' });
    }

    // Générer un token JWT
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Connexion réussie',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });

  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route 404
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

const PORT = process.env.PORT || 5000;

// Démarrage du serveur
const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log('🚀 ====================================');
      console.log(`   MiaTech Server MongoDB démarré !`);
      console.log(`   📍 Port: ${PORT}`);
      console.log(`   🌍 URL: http://localhost:${PORT}`);
      console.log(`   📊 Base: mia_tech`);
      console.log(`   🏥 Health: /api/health`);
      console.log(`   👤 Auth: /api/auth/login|register`);
      console.log(`   🧪 Test: /api/test/users|services|orders`);
      console.log('====================================');
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
};

startServer();