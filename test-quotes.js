// Test script for quote management system
const fetch = require('node-fetch');

async function testQuoteSystem() {
    const baseUrl = 'http://localhost:5002';
    
    console.log('🧪 Test du système de devis...');
    
    // 1. Login as admin to get token
    console.log('👤 Connexion admin...');
    const loginResponse = await fetch(`${baseUrl}/api/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'admin@miatech.com',
            password: 'admin123'
        })
    });
    
    const loginData = await loginResponse.json();
    if (!loginData.success) {
        console.error('❌ Erreur login admin:', loginData.message);
        return;
    }
    
    const adminToken = loginData.token;
    console.log('✅ Admin connecté');
    
    // 2. Create a test quote
    console.log('📄 Création d\'un devis de test...');
    const quoteResponse = await fetch(`${baseUrl}/api/quotes`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
            service: 'Développement Web',
            description: 'Site e-commerce complet avec système de paiement et gestion des stocks',
            budget: 3500,
            requirements: 'Interface moderne, responsive, intégration Stripe, panneau admin',
            clientName: 'Jean Dupont',
            clientEmail: 'jean.dupont@example.com'
        })
    });
    
    const quoteData = await quoteResponse.json();
    if (!quoteData.success) {
        console.error('❌ Erreur création devis:', quoteData.message);
        return;
    }
    
    const quoteId = quoteData.quote.id;
    console.log('✅ Devis créé avec ID:', quoteId);
    
    // 3. Get all quotes as admin
    console.log('📋 Récupération des devis...');
    const quotesResponse = await fetch(`${baseUrl}/api/admin/quotes`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    const quotesData = await quotesResponse.json();
    if (quotesData.success) {
        console.log('✅ Devis récupérés:', quotesData.quotes.length);
        console.log('📄 Premier devis:', JSON.stringify(quotesData.quotes[0], null, 2));
    }
    
    // 4. Respond to the quote
    console.log('💬 Réponse au devis...');
    const responseData = {
        proposedAmount: 4200,
        estimatedTime: '4-6 semaines',
        terms: `Bonjour Jean,

Merci pour votre demande de devis pour le développement de votre site e-commerce.

Après analyse de vos besoins, nous vous proposons:

SOLUTION PROPOSÉE: 4200$
- Site e-commerce complet avec React.js
- Panel d'administration avancé
- Intégration Stripe pour les paiements
- Gestion complète des stocks
- Design responsive et moderne
- Formation à l'utilisation incluse

DÉLAI: 4-6 semaines

CONDITIONS:
- 50% à la commande (2100$)
- 50% à la livraison (2100$)
- 3 révisions incluses
- Support technique 30 jours

Nous restons à votre disposition pour toute question.

Cordialement,
L'équipe MiaTech`
    };
    
    const respondResponse = await fetch(`${baseUrl}/api/admin/quotes/${quoteId}/respond`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(responseData)
    });
    
    const respondResult = await respondResponse.json();
    if (respondResult.success) {
        console.log('✅ Réponse envoyée au devis');
    } else {
        console.error('❌ Erreur réponse devis:', respondResult.message);
    }
    
    // 5. Update quote status
    console.log('🔄 Mise à jour du statut...');
    const statusResponse = await fetch(`${baseUrl}/api/admin/quotes/${quoteId}/status`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status: 'accepted' })
    });
    
    const statusResult = await statusResponse.json();
    if (statusResult.success) {
        console.log('✅ Statut mis à jour vers "accepted"');
    }
    
    // 6. Final check
    console.log('🔍 Vérification finale...');
    const finalCheck = await fetch(`${baseUrl}/api/admin/quotes`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    const finalData = await finalCheck.json();
    if (finalData.success) {
        console.log('📊 Résumé final:');
        console.log(`   - Total devis: ${finalData.quotes.length}`);
        finalData.quotes.forEach(q => {
            console.log(`   - Devis #${q.id}: ${q.status} - Client: ${q.client.name}`);
        });
    }
    
    console.log('🎉 Test terminé avec succès !');
}

// Install node-fetch if not available and run test
testQuoteSystem().catch(error => {
    console.error('❌ Erreur test:', error);
});