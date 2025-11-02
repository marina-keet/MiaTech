const express = require('express');
const cors = require('cors');
require('dotenv').config();

console.log('🚀 Démarrage du serveur de debug...');

const app = express();

// CORS
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Body parser
app.use(express.json());

// Route de test simple
app.get('/api/health', (req, res) => {
  console.log('📊 Health check');
  res.json({ 
    status: '✅ OK',
    message: '🚀 Serveur de debug fonctionnel',
    timestamp: new Date().toISOString()
  });
});

// Route de test pour l'inscription
app.post('/api/auth/register', (req, res) => {
  console.log('📝 Test inscription - données reçues:', req.body);
  
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    console.log('❌ Champs manquants');
    return res.status(400).json({ message: 'Tous les champs sont requis' });
  }
  
  console.log('✅ Inscription réussie (mode test)');
  res.status(201).json({ 
    message: 'Test réussi - inscription simulée',
    user: { id: 'test-123', name, email, role: 'client' }
  });
});

// Route 404
app.use('*', (req, res) => {
  console.log('❌ Route non trouvée:', req.originalUrl);
  res.status(404).json({ message: 'Route non trouvée' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('🚀 ====================================');
  console.log(`   Serveur Debug démarré !`);
  console.log(`   📍 Port: ${PORT}`);
  console.log(`   🌍 URL: http://localhost:${PORT}`);
  console.log('====================================');
});

console.log('✅ Serveur configuré, en attente de requêtes...');