const http = require('http');

// Test de connexion et récupération des devis
async function testSystem() {
    console.log('🔍 Test du système de devis...\n');
    
    // 1. Connexion admin
    console.log('1. Test de connexion admin...');
    const loginData = JSON.stringify({
        email: 'admin@miatech.com',
        password: 'admin123'
    });
    
    const loginOptions = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/admin/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(loginData)
        }
    };
    
    return new Promise((resolve) => {
        const req = http.request(loginOptions, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(body);
                    if (result.token) {
                        console.log('✅ Connexion réussie');
                        
                        // 2. Test récupération des devis
                        console.log('2. Test récupération des devis...');
                        const quotesOptions = {
                            hostname: 'localhost',
                            port: 5000,
                            path: '/api/admin/quotes',
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${result.token}`
                            }
                        };
                        
                        const quotesReq = http.request(quotesOptions, (quotesRes) => {
                            let quotesBody = '';
                            quotesRes.on('data', chunk => quotesBody += chunk);
                            quotesRes.on('end', () => {
                                try {
                                    const quotesResult = JSON.parse(quotesBody);
                                    console.log('✅ Devis récupérés:', quotesResult.stats || 'Pas de stats');
                                    console.log('📋 Nombre de devis:', quotesResult.quotes?.length || 0);
                                    
                                    if (quotesResult.quotes && quotesResult.quotes.length > 0) {
                                        console.log('\n📝 Premier devis:');
                                        const firstQuote = quotesResult.quotes[0];
                                        console.log(`- ID: ${firstQuote.id}`);
                                        console.log(`- Projet: ${firstQuote.projectType}`);
                                        console.log(`- Description: ${firstQuote.description.substring(0, 50)}...`);
                                        console.log(`- Budget: ${firstQuote.budget}`);
                                        console.log(`- Statut: ${firstQuote.status}`);
                                    }
                                    
                                    resolve();
                                } catch (e) {
                                    console.log('❌ Erreur parsing devis:', e.message);
                                    console.log('Body reçu:', quotesBody);
                                    resolve();
                                }
                            });
                        });
                        
                        quotesReq.on('error', err => {
                            console.log('❌ Erreur requête devis:', err.message);
                            resolve();
                        });
                        
                        quotesReq.end();
                        
                    } else {
                        console.log('❌ Échec connexion:', result);
                        resolve();
                    }
                } catch (e) {
                    console.log('❌ Erreur parsing login:', e.message);
                    resolve();
                }
            });
        });
        
        req.on('error', err => {
            console.log('❌ Erreur connexion:', err.message);
            resolve();
        });
        
        req.write(loginData);
        req.end();
    });
}

testSystem().then(() => {
    console.log('\n✅ Test terminé');
});