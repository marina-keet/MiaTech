const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// Connexion à la base de données
const connectDB = require('./config/database');

// Import des routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const serviceRoutes = require('./routes/services');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');

const app = express();

// Middleware de sécurité
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    message: '🚀 MiaTech API fonctionnelle',
    database: 'mia_tech',
    timestamp: new Date().toISOString()
  });
});

// Gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

// Middleware de gestion d'erreurs globales
app.use((err, req, res, next) => {
  console.error('❌ Erreur serveur:', err.stack);
  res.status(500).json({ 
    message: 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
  });
});

const PORT = process.env.PORT || 5000;

// Démarrage du serveur
const startServer = async () => {
  try {
    // Connexion à MongoDB
    await connectDB();
    
    // Démarrage du serveur HTTP
    app.listen(PORT, () => {
      console.log('🚀 ====================================');
      console.log(`   MiaTech Server démarré !`);
      console.log(`   📍 Port: ${PORT}`);
      console.log(`   🌍 URL: http://localhost:${PORT}`);
      console.log(`   📊 Base: mia_tech`);
      console.log(`   🏠 Health: http://localhost:${PORT}/api/health`);
      console.log('====================================');
    });
    
  } catch (error) {
    console.error('❌ Erreur au démarrage:', error.message);
    process.exit(1);
  }
};

// Démarrage
startServer();

module.exports = app;