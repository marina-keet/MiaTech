const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware d'authentification
const auth = async (req, res, next) => {
  const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Accès refusé. Token manquant.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.user.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Token invalide. Utilisateur non trouvé.' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Compte désactivé.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error.message);
    res.status(401).json({ message: 'Token invalide.' });
  }
};

// Middleware pour vérifier les rôles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Accès refusé. Permissions insuffisantes.' 
      });
    }
    next();
  };
};

// Middleware pour vérifier si l'utilisateur est admin ou propriétaire de la ressource
const authorizeOwnerOrAdmin = (resourceField = 'client') => {
  return (req, res, next) => {
    // Si c'est un admin, autoriser
    if (req.user.role === 'admin') {
      return next();
    }

    // Sinon, vérifier si c'est le propriétaire
    const resourceId = req[resourceField] || req.params.id || req.body[resourceField];
    
    if (req.user.id.toString() === resourceId?.toString()) {
      return next();
    }

    return res.status(403).json({ 
      message: 'Accès refusé. Vous ne pouvez accéder qu\'à vos propres ressources.' 
    });
  };
};

module.exports = {
  auth,
  authorize,
  authorizeOwnerOrAdmin
};