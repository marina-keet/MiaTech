const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware de sécurité basique
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes essentielles seulement
app.use('/api/auth', require('./routes/auth'));

// Route de santé
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Serveur MiaTech opérationnel',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Une erreur interne est survenue',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

// Route 404
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

// Connexion à MongoDB (avec fallback local)
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/miatech';
mongoose.connect(mongoURI)
  .then(() => console.log('✅ Connecté à MongoDB'))
  .catch(err => {
    console.error('❌ Erreur de connexion MongoDB:', err.message);
    console.log('🔄 Continuons sans base de données pour les tests...');
  });

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Serveur MiaTech (Login) démarré sur le port ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Login API: http://localhost:${PORT}/api/auth/login`);
});

module.exports = app;