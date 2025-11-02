// Serveur de test simple sans dépendances externes
const http = require('http');
const url = require('url');

// Configuration
const PORT = process.env.PORT || 5000;

// Données de test
const testRoutes = {
  '/': {
    message: '🚀 Serveur MiaTech - Test basique',
    status: 'Opérationnel',
    version: '1.0.0',
    features: [
      '✅ Authentification JWT',
      '✅ Système de commandes',
      '✅ Chat en temps réel',
      '✅ Paiements Stripe',
      '✅ Dashboard client/admin',
      '✅ Notifications',
      '✅ Support multilingue',
      '✅ Panel administration'
    ]
  },
  '/health': {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version
  },
  '/api': {
    message: 'API MiaTech',
    endpoints: [
      'GET /api/auth - Authentification',
      'GET /api/services - Services disponibles',
      'GET /api/orders - Gestion des commandes',
      'GET /api/projects - Suivi des projets',
      'GET /api/payments - Paiements Stripe',
      'GET /api/users - Dashboard utilisateurs',
      'GET /api/communications - Notifications & Chat',
      'GET /api/i18n - Support multilingue'
    ]
  }
};

// Serveur HTTP basique
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  
  // Headers CORS et JSON
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');
  
  // Gestion OPTIONS pour CORS
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  console.log(`${new Date().toISOString()} - ${req.method} ${path}`);
  
  // Router simple
  if (testRoutes[path]) {
    res.writeHead(200);
    res.end(JSON.stringify(testRoutes[path], null, 2));
  } else if (path.startsWith('/api/')) {
    // Simulation des réponses API
    res.writeHead(200);
    res.end(JSON.stringify({
      endpoint: path,
      method: req.method,
      message: `Endpoint ${path} implémenté dans les routes complètes`,
      status: 'À tester avec les vraies dépendances npm'
    }, null, 2));
  } else {
    // 404
    res.writeHead(404);
    res.end(JSON.stringify({
      error: 'Route non trouvée',
      path: path,
      availableRoutes: Object.keys(testRoutes)
    }, null, 2));
  }
});

server.listen(PORT, () => {
  console.log('🚀 ===============================================');
  console.log('🎉 Serveur MiaTech - Test de Base DÉMARRÉ');
  console.log('🚀 ===============================================');
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`🔍 Health: http://localhost:${PORT}/health`);
  console.log(`📋 API Info: http://localhost:${PORT}/api`);
  console.log('🚀 ===============================================');
  console.log('✅ Toutes les fonctionnalités MiaTech sont implémentées !');
  console.log('💡 Pour tester avec npm: installer les dépendances puis "node server.js"');
  console.log('🚀 ===============================================');
});

// Gestion des erreurs
server.on('error', (err) => {
  console.error('❌ Erreur serveur:', err);
});

process.on('SIGINT', () => {
  console.log('\n👋 Arrêt du serveur...');
  server.close(() => {
    console.log('✅ Serveur arrêté proprement');
    process.exit(0);
  });
});