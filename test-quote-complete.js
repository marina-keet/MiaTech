// Test rapide du système de devis complet
const fetch = require('node-fetch');

async function testCompleteQuoteSystem() {
    const baseUrl = 'http://localhost:5000';
    
    console.log('🧪 Test du système complet de gestion des devis...');
    
    // 1. Login admin
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
        console.error('❌ Erreur login:', loginData.message);
        return;
    }
    
    const token = loginData.token;
    console.log('✅ Admin connecté');
    
    // 2. Créer un devis de test
    const quoteData = {
        service: 'Site Web Vitrine',
        description: 'Site web moderne pour cabinet dentaire avec prise de rendez-vous en ligne, galerie photos, et informations pratiques.',
        budget: 2500,
        requirements: 'Design moderne, responsive, système de RDV, SEO optimisé',
        clientName: 'Dr. Marie Petit',
        clientEmail: 'contact@cabinet-petit.fr'
    };
    
    const createResponse = await fetch(`${baseUrl}/api/quotes`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(quoteData)
    });
    
    const createResult = await createResponse.json();
    if (!createResult.success) {
        console.error('❌ Erreur création:', createResult.message);
        return;
    }
    
    const quoteId = createResult.quote.id;
    console.log('✅ Devis créé:', quoteId);
    
    // 3. Envoyer accusé de réception
    const ackResponse = await fetch(`${baseUrl}/api/admin/quotes/${quoteId}/acknowledge`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            message: "Bonjour Dr. Petit,\n\nMerci pour votre demande de site web pour votre cabinet dentaire.\n\nNotre équipe étudie votre projet et vous enverra un devis détaillé sous 24h.\n\nCordialement,\nL'équipe MiaTech"
        })
    });
    
    if (ackResponse.ok) {
        console.log('✅ Accusé de réception envoyé');
    }
    
    // 4. Répondre au devis
    const responseData = {
        proposedAmount: 3200,
        estimatedTime: '3-4 semaines',
        terms: `Bonjour Dr. Petit,

Nous sommes ravis de vous proposer nos services pour votre site web de cabinet dentaire.

🦷 SOLUTION PROPOSÉE: 3200$

📋 PRESTATIONS INCLUSES:
• Site web responsive (mobile/tablette/desktop)
• Système de prise de RDV en ligne
• Galerie photos avant/après (avec consentements)
• Pages informatives (soins, équipe, tarifs)
• Optimisation SEO pour référencement local
• Formulaire de contact sécurisé
• Hébergement 1 an inclus

⏱️ DÉLAI: 3-4 semaines

💰 CONDITIONS:
• 50% à la commande (1600$)
• 50% à la mise en ligne (1600$)

🎁 BONUS:
• Formation à la gestion du site
• Support technique 3 mois
• 2 révisions incluses

Nous serions honorés de vous accompagner !

Cordialement,
L'équipe MiaTech`
    };
    
    const respondResponse = await fetch(`${baseUrl}/api/admin/quotes/${quoteId}/respond`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(responseData)
    });
    
    if (respondResponse.ok) {
        console.log('✅ Réponse envoyée au devis');
    }
    
    console.log('🎉 Test terminé ! Allez voir l\'interface admin pour tester toutes les fonctionnalités :');
    console.log('   📧 Accusé de réception');
    console.log('   💬 Réponse au devis');
    console.log('   ✅ Acceptation');
    console.log('   ❌ Rejet');
    console.log('   📜 Historique complet');
}

testCompleteQuoteSystem().catch(console.error);