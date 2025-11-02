const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Test de hashage et vérification
async function testPassword() {
  try {
    const plainPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(plainPassword, 12);
    
    console.log('🔐 Test de hashage:');
    console.log('Mot de passe clair:', plainPassword);
    console.log('Mot de passe hashé:', hashedPassword);
    
    const isValid = await bcrypt.compare(plainPassword, hashedPassword);
    console.log('✅ Vérification:', isValid);
    
    // Test avec MongoDB
    await mongoose.connect('mongodb://localhost:27017/mia_tech');
    
    const User = require('./models/User');
    const admin = await User.findOne({ email: 'admin@miatech.com' });
    
    if (admin) {
      console.log('\n👤 Admin trouvé:');
      console.log('Email:', admin.email);
      console.log('Hash en DB:', admin.password.substring(0, 20) + '...');
      
      const isValidDB = await bcrypt.compare('admin123', admin.password);
      console.log('✅ Vérification avec DB:', isValidDB);
    }
    
    mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testPassword();