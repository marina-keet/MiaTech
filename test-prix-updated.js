#!/usr/bin/env node

/**
 * Test de validation des nouveaux prix MiaTech
 * Vérifie que tous les prix ont été mis à jour correctement
 */

const fs = require('fs');

console.log('🔍 Vérification des nouveaux prix MiaTech...\n');

// Nouveaux prix attendus
const newPrices = {
  'web-dev': 700,
  'ui-ux': 300,
  'poster': 150,
  'logo': 80,
  'business-card': 150
};

console.log('💰 Nouveaux prix définis:');
console.log('- Développement Site Web: $700');
console.log('- Design UI/UX: $300');
console.log('- Conception d\'affiches: $150');
console.log('- Logo Professionnel: $80 (négociable)');
console.log('- Cartes de visite: $150\n');

// Tester les fichiers clients
const clientFiles = [
  './client/src/pages/HomePage.tsx',
  './client/src/pages/OrderPage.tsx',
  './client/src/pages/QuotePage.tsx'
];

let testsPassedClient = 0;
let totalTestsClient = 0;

console.log('📱 Tests côté CLIENT:');

clientFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`\n📄 ${filePath}`);
    
    // Test HomePage.tsx
    if (filePath.includes('HomePage.tsx')) {
      totalTestsClient += 3;
      
      if (content.includes('$700')) {
        console.log('  ✅ Prix développement web: $700');
        testsPassedClient++;
      } else {
        console.log('  ❌ Prix développement web non trouvé');
      }
      
      if (content.includes('$300')) {
        console.log('  ✅ Prix UI/UX: $300');
        testsPassedClient++;
      } else {
        console.log('  ❌ Prix UI/UX non mis à jour');
      }
      
      if (content.includes('$80')) {
        console.log('  ✅ Prix logo: $80');
        testsPassedClient++;
      } else {
        console.log('  ❌ Service logo non ajouté');
      }
    }
    
    // Test OrderPage.tsx
    if (filePath.includes('OrderPage.tsx')) {
      totalTestsClient += 4;
      
      if (content.includes("'web-dev': 700")) {
        console.log('  ✅ Prix développement dans getServicePrice: 700');
        testsPassedClient++;
      } else {
        console.log('  ❌ Prix développement non mis à jour dans getServicePrice');
      }
      
      if (content.includes("'ui-ux': 300")) {
        console.log('  ✅ Prix UI/UX dans getServicePrice: 300');
        testsPassedClient++;
      } else {
        console.log('  ❌ Prix UI/UX non mis à jour dans getServicePrice');
      }
      
      if (content.includes("'logo': 80")) {
        console.log('  ✅ Prix logo dans getServicePrice: 80');
        testsPassedClient++;
      } else {
        console.log('  ❌ Service logo non ajouté dans getServicePrice');
      }
      
      if (content.includes('Logo Professionnel')) {
        console.log('  ✅ Service "Logo Professionnel" ajouté dans la liste');
        testsPassedClient++;
      } else {
        console.log('  ❌ Service "Logo Professionnel" manquant');
      }
    }
    
    // Test QuotePage.tsx
    if (filePath.includes('QuotePage.tsx')) {
      totalTestsClient += 3;
      
      if (content.includes('basePrice: 700')) {
        console.log('  ✅ Prix de base développement: 700');
        testsPassedClient++;
      } else {
        console.log('  ❌ Prix de base développement non mis à jour');
      }
      
      if (content.includes('basePrice: 300')) {
        console.log('  ✅ Prix de base UI/UX: 300');
        testsPassedClient++;
      } else {
        console.log('  ❌ Prix de base UI/UX non mis à jour');
      }
      
      if (content.includes('basePrice: 80')) {
        console.log('  ✅ Prix de base logo: 80');
        testsPassedClient++;
      } else {
        console.log('  ❌ Prix de base logo non mis à jour');
      }
    }
  } else {
    console.log(`  ❌ Fichier non trouvé: ${filePath}`);
  }
});

// Test côté serveur
let testsPassedServer = 0;
let totalTestsServer = 0;

console.log('\n🖥️  Tests côté SERVEUR:');

const serverFile = './server/server-temp.js';
if (fs.existsSync(serverFile)) {
  const content = fs.readFileSync(serverFile, 'utf8');
  
  console.log(`\n📄 ${serverFile}`);
  
  totalTestsServer += 4;
  
  if (content.includes('Développement Site Web')) {
    console.log('  ✅ Nom service développement mis à jour');
    testsPassedServer++;
  } else {
    console.log('  ❌ Nom service développement non mis à jour');
  }
  
  if (content.includes('Logo Professionnel')) {
    console.log('  ✅ Service "Logo Professionnel" ajouté');
    testsPassedServer++;
  } else {
    console.log('  ❌ Service "Logo Professionnel" manquant');
  }
  
  if (content.includes('Logo Professionnel Unique')) {
    console.log('  ✅ Titre projet logo mis à jour');
    testsPassedServer++;
  } else {
    console.log('  ❌ Titre projet logo non mis à jour');
  }
  
  if (content.includes("'logo': 'Logo Professionnel'")) {
    console.log('  ✅ Nom de service PDF mis à jour');
    testsPassedServer++;
  } else {
    console.log('  ❌ Nom de service PDF non mis à jour');
  }
} else {
  console.log(`  ❌ Fichier serveur non trouvé: ${serverFile}`);
}

// Résultats finaux
const totalTests = totalTestsClient + totalTestsServer;
const totalPassed = testsPassedClient + testsPassedServer;

console.log('\n📊 RÉSULTATS:');
console.log(`Tests côté client: ${testsPassedClient}/${totalTestsClient} ✅`);
console.log(`Tests côté serveur: ${testsPassedServer}/${totalTestsServer} ✅`);
console.log(`TOTAL: ${totalPassed}/${totalTests} tests passés`);

if (totalPassed === totalTests) {
  console.log('\n🎉 SUCCÈS: Tous les prix ont été mis à jour correctement!');
  process.exit(0);
} else {
  console.log('\n⚠️  ATTENTION: Certains prix n\'ont pas été mis à jour');
  process.exit(1);
}