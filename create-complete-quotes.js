const http = require('http');

function createTestQuotes() {
  const quotes = [
    {
      userId: 2,
      serviceId: 2,
      projectType: 'Application Mobile',
      description: 'Nous souhaitons développer une application mobile pour iOS et Android. L\'application doit permettre à nos clients de passer des commandes, suivre leurs livraisons et payer en ligne.',
      features: 'Interface utilisateur moderne, Système de commande, Suivi GPS, Paiement sécurisé, Notifications push',
      timeline: '3-4 mois',
      budget: '25000-35000€',
      contact: 'thomas.bernard@logistique-plus.com',
      clientName: 'Thomas Bernard',
      clientPhone: '+33 6 87 65 43 21'
    },
    {
      userId: 3,
      serviceId: 1,
      projectType: 'Site E-commerce',
      description: 'Création d\'une boutique en ligne complète pour vendre nos produits artisanaux. Il nous faut un catalogue, panier d\'achat, système de paiement et interface d\'administration.',
      features: 'Catalogue produits, Panier d\'achat, Paiement Stripe/PayPal, Gestion stock, Interface admin, Design responsive',
      timeline: '6-8 semaines',
      budget: '15000-20000€',
      contact: 'sophie.martin@artisanat-france.fr',
      clientName: 'Sophie Martin',
      clientPhone: '+33 6 23 45 67 89'
    }
  ];

  let completed = 0;
  
  quotes.forEach((quoteData, index) => {
    const postData = JSON.stringify(quoteData);
    
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
        completed++;
        console.log(`✅ Devis ${index + 1} créé: ${quoteData.clientName}`);
        
        if (completed === quotes.length) {
          console.log('\n🎉 Tous les devis sont créés !');
          console.log('📱 Interface admin: http://localhost:5000/admin-login');
          console.log('🔑 admin@miatech.com / admin123');
        }
      });
    });

    req.on('error', (err) => {
      console.error(`❌ Erreur devis ${index + 1}:`, err.message);
    });

    req.write(postData);
    req.end();
  });
}

console.log('🚀 Création de devis complets avec toutes les infos...\n');
createTestQuotes();