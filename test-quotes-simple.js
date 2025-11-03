const http = require('http');

function makeRequest(method, port, path, data = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null;
    
    const options = {
      hostname: 'localhost',
      port: port,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData ? Buffer.byteLength(postData) : 0
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

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function testQuoteCreation() {
  console.log('🧪 Test de création et récupération de devis\n');

  // 1. Test connexion admin
  console.log('1️⃣ Test connexion admin...');
  try {
    const loginResult = await makeRequest('POST', 5002, '/api/login', {
      email: 'admin@miatech.com',
      password: 'admin123'
    });
    
    if (loginResult.status === 200 && loginResult.data.token) {
      console.log('✅ Connexion admin réussie');
      const token = loginResult.data.token;

      // 2. Test création devis
      console.log('\n2️⃣ Test création devis...');
      const quoteData = {
        userId: 1,
        serviceId: 1,
        projectType: 'Site Web E-commerce',
        description: 'Test de création d\'un devis complet avec toutes les fonctionnalités',
        features: 'Catalogue, Panier, Paiement, Admin, Responsive',
        timeline: '3 mois',
        budget: '12000€',
        contact: 'test@example.com'
      };

      const createResult = await makeRequest('POST', 5002, '/api/quotes', quoteData);
      console.log('Création devis:', createResult.status, createResult.data);

      // 3. Test récupération devis admin
      console.log('\n3️⃣ Test récupération devis admin...');
      const quotesResult = await makeRequest('GET', 5002, '/api/admin/quotes', null);
      if (quotesResult.status === 200) {
        console.log('✅ Récupération réussie:', quotesResult.data.stats);
      } else {
        console.log('❌ Erreur récupération:', quotesResult);
      }

    } else {
      console.log('❌ Échec connexion:', loginResult);
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testQuoteCreation();