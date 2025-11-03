const jwt = require('jsonwebtoken');

// Token de l'authentification
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OTk5LCJlbWFpbCI6ImFkbWluQG1pYXRlY2guY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzYyMjA0Njc5LCJleHAiOjE3NjIyOTEwNzl9.0VVJASOrt5VpKlGicNQKOHDv3tIUvbE_g8SiPG8v4eA';

try {
  const decoded = jwt.decode(token);
  console.log('🔍 Token décodé:', decoded);
  console.log('📋 Rôle dans le token:', decoded.role);
  console.log('🆔 ID utilisateur:', decoded.id);
  console.log('📧 Email:', decoded.email);
} catch (error) {
  console.log('❌ Erreur décodage:', error.message);
}