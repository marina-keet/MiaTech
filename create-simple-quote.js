const http = require('http');

function createSimpleQuote() {
  const postData = JSON.stringify({
    userId: 1,
    serviceId: 1,
    projectType: 'Site Web Entreprise',
    description: 'Nous avons besoin d\'un site web professionnel pour notre entreprise. Le site doit présenter nos services, avoir une page de contact et être responsive sur mobile.',
    features: 'Design moderne, Page d\'accueil, Présentation services, Formulaire contact, Responsive mobile',
    timeline: '4-6 semaines',
    budget: '8000-12000€',
    contact: 'marie.dupont@entreprise-abc.fr',
    clientName: 'Marie Dupont',
    clientPhone: '+33 6 12 34 56 78'
  });

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/quotes',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    let responseBody = '';
    res.on('data', (chunk) => {
      responseBody += chunk;
    });
    res.on('end', () => {
      console.log('✅ Devis créé avec succès !');
      console.log('📱 Allez à: http://localhost:5000/admin-login');
      console.log('🔑 Connexion: admin@miatech.com / admin123');
      console.log('📋 Puis cliquez sur "Devis" dans le menu');
    });
  });

  req.on('error', (err) => {
    console.error('❌ Erreur:', err.message);
  });

  req.write(postData);
  req.end();
}

console.log('🚀 Création d\'un devis de test...');
createSimpleQuote();