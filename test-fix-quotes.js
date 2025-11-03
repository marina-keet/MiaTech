#!/usr/bin/env node

const https = require('http');
const fs = require('fs');

// Configuration
const BASE_URL = 'http://localhost:5000';
const ADMIN_EMAIL = 'admin@miatech.com';
const ADMIN_PASSWORD = 'admin123';

let adminToken = null;

// Fonction pour faire des requêtes HTTP
function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testQuotesSystem() {
  console.log('🔧 Test du système de devis MiaTech\n');

  try {
    // 1. Test de connexion admin
    console.log('1️⃣ Test de connexion admin...');
    const loginResponse = await makeRequest('POST', '/api/login', {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });

    if (loginResponse.status === 200 && loginResponse.data.token) {
      adminToken = loginResponse.data.token;
      console.log('✅ Connexion admin réussie');
    } else {
      console.log('❌ Échec connexion admin:', loginResponse);
      return;
    }

    // 2. Test de création de devis
    console.log('\n2️⃣ Test de création de devis...');
    const newQuote = {
      userId: 1,
      serviceId: 1,
      projectType: 'Site Web E-commerce',
      description: 'Développement d\'un site e-commerce complet avec système de paiement et gestion des commandes',
      features: 'Catalogue produits, Panier, Paiement sécurisé, Administration, Responsive design',
      timeline: '3-4 mois',
      budget: '15000-20000€',
      contact: 'client@test.com'
    };

    const createResponse = await makeRequest('POST', '/api/quotes', newQuote);
    console.log('Création devis:', createResponse);

    // 3. Test de récupération des devis (admin)
    console.log('\n3️⃣ Test de récupération des devis admin...');
    const quotesResponse = await makeRequest('GET', '/api/admin/quotes', null, {
      'Authorization': `Bearer ${adminToken}`
    });
    console.log('Récupération devis:', quotesResponse);

    // 4. Vérifier le fichier de données
    console.log('\n4️⃣ Vérification fichier quotes.json...');
    if (fs.existsSync('./server/data/quotes.json')) {
      const fileContent = fs.readFileSync('./server/data/quotes.json', 'utf8');
      const quotesData = JSON.parse(fileContent);
      console.log('Contenu du fichier:', quotesData);
    } else {
      console.log('❌ Fichier quotes.json introuvable');
    }

    // 5. Test logo
    console.log('\n5️⃣ Test disponibilité logo...');
    const logoResponse = await makeRequest('GET', '/miatech-logo.svg');
    console.log('Logo status:', logoResponse.status);

  } catch (error) {
    console.error('❌ Erreur test:', error);
  }
}

// Attendre un peu puis lancer le test
setTimeout(() => {
  testQuotesSystem();
}, 2000);