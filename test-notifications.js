#!/usr/bin/env node

/**
 * 🔔 Test Système de Notifications MiaTech
 */

const http = require('http');

async function testNotifications() {
    console.log('🔔 Test du système de notifications MiaTech');
    console.log('===============================================\n');

    try {
        // 1. Authentification
        console.log('🔐 1. Authentification admin...');
        const authResponse = await makeRequest({
            hostname: 'localhost',
            port: 5000,
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

        const token = authResponse.json.token;
        console.log('✅ Authentifié avec succès');

        // 2. Test API notifications
        console.log('\n📢 2. Test API notifications...');
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

        if (!notifResponse.json?.success) {
            throw new Error('Échec récupération notifications');
        }

        const notifications = notifResponse.json;
        console.log('✅ Notifications récupérées');
        
        // Afficher le résumé
        console.log('\n📊 RÉSUMÉ DES NOTIFICATIONS:');
        console.log('=============================');
        console.log(`📧 Messages non lus: ${notifications.summary.unreadMessages}`);
        console.log(`📋 Devis en attente: ${notifications.summary.pendingQuotes}`);
        console.log(`🛒 Commandes en attente: ${notifications.summary.pendingOrders}`);
        console.log(`👥 Utilisateurs récents: ${notifications.summary.recentUsers}`);
        console.log(`🚨 TOTAL IMPORTANT: ${notifications.summary.total}`);

        // Afficher les détails
        console.log('\n📋 DÉTAILS DES NOTIFICATIONS:');
        console.log('=============================');
        notifications.notifications.forEach((notif, index) => {
            console.log(`${index + 1}. ${notif.icon} ${notif.title}`);
            console.log(`   Count: ${notif.count} | Priority: ${notif.priority}`);
            console.log(`   Description: ${notif.description}`);
            console.log('');
        });

        // 3. Test marquage messages lus (si il y en a)
        if (notifications.summary.unreadMessages > 0) {
            console.log('📧 3. Test marquage messages comme lus...');
            const markResponse = await makeRequest({
                hostname: 'localhost',
                port: 5000,
                path: '/api/admin/messages/read-all',
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (markResponse.json?.success) {
                console.log(`✅ ${markResponse.json.count} messages marqués comme lus`);
                console.log(`📝 Message: ${markResponse.json.message}`);
            } else {
                console.log('⚠️ Erreur marquage messages');
            }
        } else {
            console.log('📧 3. Aucun message non lu à marquer');
        }

        console.log('\n🎉 SYSTÈME DE NOTIFICATIONS TESTÉ AVEC SUCCÈS !');
        console.log('🌐 Interface disponible: http://localhost:5000/admin-login');

    } catch (error) {
        console.error('\n❌ ERREUR:', error.message);
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
testNotifications().catch(console.error);