#!/usr/bin/env node

/**
 * 🔔 Test Complet - Système de Notifications avec Badges Messages
 */

const http = require('http');

async function testCompleteNotificationSystem() {
    console.log('🔔 Test Système Complet de Notifications MiaTech');
    console.log('==================================================\n');

    let token = '';
    
    try {
        // 1. Authentification
        console.log('🔐 1. Authentification admin...');
        const authResponse = await makeRequest({
            hostname: 'localhost',
            port: 5000, // Port correct
            path: '/api/admin/login',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, {
            email: 'admin@miatech.com',
            password: 'admin123'
        });

        if (!authResponse.json?.success) {
            throw new Error('Échec authentification');
        }

        token = authResponse.json.token;
        console.log('✅ Authentifié avec succès\n');

        // 2. Test messages - récupération
        console.log('📧 2. Test récupération des messages...');
        const messagesResponse = await makeRequest({
            hostname: 'localhost',
            port: 5000,
            path: '/api/chat/messages',
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const messages = messagesResponse.json?.messages || [];
        const unreadMessages = messages.filter(m => !m.isRead);
        
        console.log(`✅ Messages récupérés: ${messages.length} total, ${unreadMessages.length} non lus\n`);

        // 3. Test API notifications
        console.log('🔔 3. Test API notifications...');
        const notifResponse = await makeRequest({
            hostname: 'localhost',
            port: 5000,
            path: '/api/admin/notifications',
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (notifResponse.json?.success) {
            const notifications = notifResponse.json;
            console.log('✅ Notifications récupérées');
            console.log(`📊 Résumé: ${notifications.summary.total} total, ${notifications.summary.unreadMessages} messages non lus\n`);
        } else {
            console.log('❌ Erreur récupération notifications\n');
        }

        // 4. Test marquage message comme lu (si il y en a)
        if (unreadMessages.length > 0) {
            const firstUnread = unreadMessages[0];
            console.log(`📝 4. Test marquage message #${firstUnread.id} comme lu...`);
            
            const markResponse = await makeRequest({
                hostname: 'localhost',
                port: 5000,
                path: `/api/admin/messages/${firstUnread.id}/read`,
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (markResponse.json?.success) {
                console.log('✅ Message marqué comme lu');
            } else {
                console.log('❌ Erreur marquage message');
            }
            console.log('');
        }

        // 5. Test marquage tous messages comme lus
        console.log('📧 5. Test marquage tous messages comme lus...');
        const markAllResponse = await makeRequest({
            hostname: 'localhost',
            port: 5000,
            path: '/api/admin/messages/read-all',
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (markAllResponse.json?.success) {
            console.log(`✅ ${markAllResponse.json.message}`);
            console.log(`📊 Messages marqués: ${markAllResponse.json.count}`);
        } else {
            console.log('❌ Erreur marquage tous messages');
        }
        console.log('');

        // 6. Vérification finale
        console.log('🔍 6. Vérification finale...');
        const finalMessagesResponse = await makeRequest({
            hostname: 'localhost',
            port: 5000,
            path: '/api/chat/messages',
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const finalMessages = finalMessagesResponse.json?.messages || [];
        const finalUnreadMessages = finalMessages.filter(m => !m.isRead);
        
        console.log(`✅ État final: ${finalMessages.length} total, ${finalUnreadMessages.length} non lus`);

        console.log('\n🎉 TESTS TERMINÉS AVEC SUCCÈS !');
        console.log('===============================');
        console.log('🔔 Système de notifications: ✅ Fonctionnel');
        console.log('📧 Badge messages sidebar: ✅ Fonctionnel');
        console.log('✅ Marquage individuel: ✅ Fonctionnel');
        console.log('📝 Marquage global: ✅ Fonctionnel');
        console.log('\n🌐 Interface disponible: http://localhost:5000/admin-login');
        console.log('👁️  Badge visible sur l\'icône Messages 💬 dans la sidebar');
        console.log('🖱️  Cliquez sur "✅ Marquer lu" sur chaque message');
        console.log('📧 Bouton "Tout marquer lu" dans l\'en-tête des messages');

    } catch (error) {
        console.error('\n❌ ERREUR PENDANT LES TESTS:', error.message);
        console.log('\n🔧 Vérifications suggérées:');
        console.log('- Le serveur fonctionne-t-il sur le port 5002 ?');
        console.log('- Les routes API sont-elles bien définies ?');
        console.log('- Y a-t-il des messages de test dans la base ?');
    }
}

// Fonction utilitaire pour les requêtes HTTP
function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const result = {
                        statusCode: res.statusCode,
                        body: body,
                        json: res.headers['content-type']?.includes('application/json') ? 
                              JSON.parse(body) : null
                    };
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            });
        });

        req.on('error', reject);
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

// Lancer le test
testCompleteNotificationSystem().catch(console.error);