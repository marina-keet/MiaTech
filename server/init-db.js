const mongoose = require('mongoose');
require('dotenv').config();

// Import des modèles
const User = require('./models/User');
const Service = require('./models/Service');
const Order = require('./models/Order');
const Payment = require('./models/Payment');
const Message = require('./models/Message');
const File = require('./models/File');

const connectDB = require('./config/database');

const initializeDatabase = async () => {
  try {
    console.log('🚀 Initialisation de la base de données MiaTech...');
    
    // Connexion à MongoDB
    await connectDB();
    
    console.log('📊 Création des collections et indexes...');
    
    // Créer les collections avec des données de test
    await createTestData();
    
    console.log('✅ Base de données initialisée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error.message);
  } finally {
    mongoose.connection.close();
  }
};

const createTestData = async () => {
  try {
    // Nettoyer les collections existantes (optionnel)
    // await User.deleteMany({});
    // await Service.deleteMany({});
    // await Order.deleteMany({});
    // await Payment.deleteMany({});
    // await Message.deleteMany({});
    // await File.deleteMany({});
    
    // Créer un administrateur par défaut
    const adminExists = await User.findOne({ email: 'admin@miatech.com' });
    if (!adminExists) {
      const admin = new User({
        name: 'Administrateur MiaTech',
        email: 'admin@miatech.com',
        password: 'admin123', // Sera hashé par le middleware pre('save')
        role: 'admin'
      });
      await admin.save();
      console.log('👤 Administrateur créé: admin@miatech.com / admin123');
    }
    
    // Créer quelques services par défaut
    const servicesCount = await Service.countDocuments();
    if (servicesCount === 0) {
      const services = [
        {
          name: 'Développement Web',
          description: 'Création de sites web modernes et responsive',
          price_base: 2500
        },
        {
          name: 'Application Mobile',
          description: 'Développement d\'applications iOS et Android',
          price_base: 5000
        },
        {
          name: 'Design UI/UX',
          description: 'Conception d\'interfaces utilisateur modernes',
          price_base: 1500
        },
        {
          name: 'E-commerce',
          description: 'Boutique en ligne complète avec paiement',
          price_base: 3500
        },
        {
          name: 'Consultation Technique',
          description: 'Audit et conseil en technologie',
          price_base: 150
        }
      ];
      
      await Service.insertMany(services);
      console.log('🛠️  Services créés:', services.length);
    }
    
    console.log('📈 Collections initialisées:');
    console.log(`   - Users: ${await User.countDocuments()}`);
    console.log(`   - Services: ${await Service.countDocuments()}`);
    console.log(`   - Orders: ${await Order.countDocuments()}`);
    console.log(`   - Payments: ${await Payment.countDocuments()}`);
    console.log(`   - Messages: ${await Message.countDocuments()}`);
    console.log(`   - Files: ${await File.countDocuments()}`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la création des données:', error.message);
    throw error;
  }
};

// Exécuter l'initialisation si ce fichier est appelé directement
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase, createTestData };