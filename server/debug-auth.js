const express = require('express');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('./models/User');

const app = express();
app.use(express.json());

// Connexion MongoDB
mongoose.connect('mongodb://localhost:27017/mia_tech');

app.post('/debug/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('\n🔍 DEBUG LOGIN:');
    console.log('Email reçu:', email);
    console.log('Password reçu:', password);

    // Trouver l'utilisateur
    const user = await User.findOne({ email });
    console.log('Utilisateur trouvé:', user ? 'OUI' : 'NON');
    
    if (!user) {
      console.log('❌ Utilisateur non trouvé');
      return res.status(400).json({ message: 'Utilisateur non trouvé' });
    }

    console.log('Hash en DB:', user.password);
    console.log('Longueur du hash:', user.password.length);
    console.log('Type du password:', typeof password, typeof user.password);

    // Test de comparaison
    const isValid = await bcrypt.compare(password, user.password);
    console.log('✅ Résultat bcrypt.compare:', isValid);

    // Test manuel
    const testHash = await bcrypt.hash(password, 12);
    console.log('Hash de test:', testHash);
    const testCompare = await bcrypt.compare(password, testHash);
    console.log('✅ Test manuel:', testCompare);

    res.json({ 
      found: !!user,
      passwordMatch: isValid,
      user: user ? { id: user._id, email: user.email } : null
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(5001, () => {
  console.log('🔍 Debug serveur sur port 5001');
});

module.exports = app;