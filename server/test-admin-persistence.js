// Test pour vérifier que les administrateurs se sauvegardent bien
const fetch = require('node-fetch');

async function testAdminPersistence() {
    try {
        console.log('🧪 === Test de Persistance des Administrateurs ===');
        
        // 1. Login admin
        console.log('\n1️⃣ Connexion admin...');
        const loginResponse = await fetch('http://localhost:5000/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@miatech.com',
                password: 'admin123'
            })
        });
        
        const loginData = await loginResponse.json();
        if (loginData.success) {
            console.log('✅ Connexion admin réussie');
        } else {
            console.log('❌ Échec connexion admin');
            return;
        }
        
        const adminToken = loginData.token;
        
        // 2. Créer un nouvel admin
        console.log('\n2️⃣ Création nouvel administrateur...');
        const newAdminData = {
            name: 'Test Admin Persistent',
            email: 'testpersistent@miatech.com',
            password: 'testpass123',
            role: 'admin'
        };
        
        const createResponse = await fetch('http://localhost:5000/api/admin/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify(newAdminData)
        });
        
        const createData = await createResponse.json();
        if (createData.success) {
            console.log('✅ Admin créé:', createData.admin);
        } else {
            console.log('❌ Échec création admin:', createData.message);
            return;
        }
        
        // 3. Attendre un peu pour la sauvegarde
        console.log('\n3️⃣ Attente sauvegarde...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 4. Vérifier qu'il apparaît dans la liste
        console.log('\n4️⃣ Vérification dans la liste...');
        const listResponse = await fetch('http://localhost:5000/api/admin/team-members', {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        
        const listData = await listResponse.json();
        if (listData.success) {
            const foundAdmin = listData.members.find(member => 
                member.email === newAdminData.email
            );
            if (foundAdmin) {
                console.log('✅ Admin trouvé dans la liste:', foundAdmin);
            } else {
                console.log('❌ Admin non trouvé dans la liste');
                console.log('📋 Membres trouvés:', listData.members.map(m => m.email));
            }
        }
        
        // 5. Test de connexion avec le nouvel admin
        console.log('\n5️⃣ Test connexion nouvel admin...');
        const testLoginResponse = await fetch('http://localhost:5000/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: newAdminData.email,
                password: newAdminData.password
            })
        });
        
        const testLoginData = await testLoginResponse.json();
        if (testLoginData.success) {
            console.log('✅ Connexion nouvel admin réussie');
        } else {
            console.log('❌ Échec connexion nouvel admin:', testLoginData.message);
        }
        
        console.log('\n🎉 === Test Terminé ===');
        
    } catch (error) {
        console.error('❌ Erreur test:', error);
    }
}

// Lancer le test
testAdminPersistence();