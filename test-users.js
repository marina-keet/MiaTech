// Test des comptes utilisateurs MiaTech

const testUsers = [
  {
    email: 'admin@miatech.com',
    password: 'password123',
    fullName: 'Administrateur MiaTech',
    role: 'admin',
    company: 'MiaTech',
    phone: '+33123456789'
  },
  {
    email: 'client@miatech.com', 
    password: 'password123',
    fullName: 'Client Test',
    role: 'client',
    company: 'Entreprise Client',
    phone: '+33987654321'
  }
];

console.log('👥 Comptes de test MiaTech:');
console.log('================================');

testUsers.forEach(user => {
  console.log(`📧 ${user.email}`);
  console.log(`🔑 ${user.password}`);
  console.log(`👤 ${user.fullName} (${user.role})`);
  console.log(`🏢 ${user.company}`);
  console.log('--------------------------------');
});

console.log('\n🔐 Pour tester la connexion:');
console.log('1. Ouvrez http://localhost:5174');
console.log('2. Utilisez un des comptes ci-dessus');
console.log('3. Le serveur backend écoute sur http://localhost:5000');

module.exports = testUsers;