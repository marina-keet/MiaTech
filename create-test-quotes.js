const http = require('http');

function createQuote(data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
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
        try {
          const json = JSON.parse(responseBody);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseBody });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

async function createTestQuotes() {
  console.log('🧪 Création de devis de test...\n');

  const quotes = [
    {
      userId: 1,
      serviceId: 1,
      projectType: 'Site E-commerce',
      description: 'Nous souhaitons créer une boutique en ligne complète pour vendre nos produits artisanaux. Il nous faut un système de paiement sécurisé, gestion des stocks, interface admin, et design responsive.',
      features: 'Catalogue produits, Panier d\'achat, Paiement Stripe/PayPal, Gestion stocks, Interface admin, Design responsive, SEO optimisé',
      timeline: '3-4 mois',
      budget: '15000-20000€',
      contact: 'marie.dubois@artisanat.fr'
    },
    {
      userId: 2,
      serviceId: 2,
      projectType: 'Application Mobile',
      description: 'Application mobile pour notre service de livraison à domicile. Les clients doivent pouvoir passer commande, suivre la livraison en temps réel, et effectuer le paiement.',
      features: 'Géolocalisation, Suivi temps réel, Paiement intégré, Notifications push, Interface livreur, Dashboard admin',
      timeline: '4-6 mois',
      budget: '25000-30000€',
      contact: 'thomas.martin@livraison-rapide.com'
    },
    {
      userId: 3,
      serviceId: 3,
      projectType: 'Site Vitrine + Blog',
      description: 'Site web professionnel pour notre cabinet d\'architectes. Nous voulons présenter nos projets, avoir un blog pour partager notre expertise, et un formulaire de contact.',
      features: 'Portfolio projets, Blog intégré, Formulaire contact, Design moderne, Optimisation mobile, Référencement SEO',
      timeline: '6-8 semaines',
      budget: '5000-8000€',
      contact: 'sophie.laurent@architecture-design.fr'
    }
  ];

  for (let i = 0; i < quotes.length; i++) {
    try {
      const result = await createQuote(quotes[i]);
      console.log(`✅ Devis ${i + 1} créé:`, result.data.message);
    } catch (error) {
      console.error(`❌ Erreur devis ${i + 1}:`, error.message);
    }
  }

  console.log('\n🎉 Tous les devis de test ont été créés !');
  console.log('📱 Ouvrez l\'interface admin: http://localhost:5000/admin-dashboard-protected.html');
  console.log('🔑 Connexion: admin@miatech.com / admin123');
}

createTestQuotes();