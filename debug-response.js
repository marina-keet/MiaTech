const http = require('http');

// Test direct de l'API de réponse
async function testDirectResponse() {
  console.log('🔍 Test direct de l\'API de réponse...');
  
  // 1. D'abord, s'authentifier
  console.log('1️⃣ Authentification...');
  const authOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const authData = JSON.stringify({
    email: 'admin@miatech.com',
    password: 'admin123'
  });

  const authResponse = await new Promise((resolve, reject) => {
    const req = http.request(authOptions, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, body: body });
      });
    });
    req.on('error', reject);
    req.write(authData);
    req.end();
  });

  console.log('Auth Status:', authResponse.statusCode);
  const authResult = JSON.parse(authResponse.body);
  console.log('Auth Success:', authResult.success);
  
  if (!authResult.success) {
    console.log('❌ Échec authentification');
    return;
  }

  const token = authResult.token;
  console.log('✅ Token obtenu');

  // 2. Ensuite, tester la réponse
  console.log('2️⃣ Test réponse au devis...');
  
  const responseOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/quotes/1/respond',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  const responseData = JSON.stringify({
    message: 'Test de réponse',
    proposedAmount: '10000€',
    estimatedTime: '4 semaines',
    terms: 'Conditions test'
  });

  console.log('Données envoyées:', responseData);
  console.log('Headers:', responseOptions.headers);

  const apiResponse = await new Promise((resolve, reject) => {
    const req = http.request(responseOptions, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, body: body, headers: res.headers });
      });
    });
    req.on('error', reject);
    req.write(responseData);
    req.end();
  });

  console.log('Response Status:', apiResponse.statusCode);
  console.log('Response Headers:', apiResponse.headers);
  console.log('Response Body:', apiResponse.body);

  try {
    const result = JSON.parse(apiResponse.body);
    console.log('Parsed Result:', result);
  } catch (e) {
    console.log('❌ Impossible de parser la réponse JSON');
  }
}

testDirectResponse().catch(console.error);