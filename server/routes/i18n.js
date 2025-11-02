const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');

// Langues supportées
const supportedLanguages = {
  'fr': 'Français',
  'en': 'English',
  'es': 'Español',
  'de': 'Deutsch',
  'it': 'Italiano',
  'ar': 'العربية'
};

// Traductions par défaut (peuvent être étendues depuis la base de données)
const translations = {
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.services': 'Services',
    'nav.portfolio': 'Portfolio',
    'nav.about': 'À propos',
    'nav.contact': 'Contact',
    'nav.login': 'Connexion',
    'nav.register': 'Inscription',
    'nav.dashboard': 'Tableau de bord',
    'nav.logout': 'Déconnexion',
    
    // Page d'accueil
    'home.title': 'MiaTech - Solutions Technologiques Professionnelles',
    'home.subtitle': 'Votre partenaire pour tous vos projets numériques',
    'home.cta': 'Découvrir nos services',
    'home.features.title': 'Pourquoi choisir MiaTech ?',
    'home.features.expertise': 'Expertise reconnue',
    'home.features.expertise.desc': 'Plus de 10 ans d\'expérience dans le développement',
    'home.features.support': 'Support 24/7',
    'home.features.support.desc': 'Une équipe dédiée pour vous accompagner',
    'home.features.quality': 'Qualité garantie',
    'home.features.quality.desc': 'Livrables testés et optimisés',
    
    // Services
    'services.title': 'Nos Services',
    'services.web.title': 'Développement Web',
    'services.web.desc': 'Sites web modernes et applications web sur mesure',
    'services.mobile.title': 'Applications Mobiles',
    'services.mobile.desc': 'Apps iOS et Android natives ou cross-platform',
    'services.design.title': 'Design UI/UX',
    'services.design.desc': 'Interfaces utilisateur intuitives et attractives',
    'services.consulting.title': 'Conseil IT',
    'services.consulting.desc': 'Accompagnement stratégique et technique',
    
    // Authentification
    'auth.login.title': 'Connexion',
    'auth.register.title': 'Créer un compte',
    'auth.email': 'Adresse email',
    'auth.password': 'Mot de passe',
    'auth.fullName': 'Nom complet',
    'auth.company': 'Entreprise',
    'auth.phone': 'Téléphone',
    'auth.login.button': 'Se connecter',
    'auth.register.button': 'Créer le compte',
    'auth.forgot.password': 'Mot de passe oublié ?',
    'auth.no.account': 'Pas de compte ?',
    'auth.have.account': 'Déjà un compte ?',
    
    // Dashboard
    'dashboard.title': 'Tableau de Bord',
    'dashboard.welcome': 'Bienvenue',
    'dashboard.stats.projects': 'Projets',
    'dashboard.stats.orders': 'Commandes',
    'dashboard.stats.messages': 'Messages',
    'dashboard.recent.projects': 'Projets récents',
    'dashboard.recent.orders': 'Commandes récentes',
    
    // Projets
    'projects.title': 'Mes Projets',
    'projects.status.pending': 'En attente',
    'projects.status.active': 'En cours',
    'projects.status.completed': 'Terminé',
    'projects.status.cancelled': 'Annulé',
    'projects.progress': 'Progression',
    'projects.team': 'Équipe',
    'projects.timeline': 'Planning',
    
    // Commandes
    'orders.title': 'Mes Commandes',
    'orders.new': 'Nouvelle commande',
    'orders.number': 'N° Commande',
    'orders.service': 'Service',
    'orders.amount': 'Montant',
    'orders.status': 'Statut',
    'orders.date': 'Date',
    
    // Messages/Chat
    'chat.title': 'Messages',
    'chat.new.message': 'Nouveau message',
    'chat.type.message': 'Tapez votre message...',
    'chat.send': 'Envoyer',
    'chat.typing': 'En train d\'écrire...',
    'chat.online': 'En ligne',
    'chat.offline': 'Hors ligne',
    
    // Notifications
    'notifications.title': 'Notifications',
    'notifications.mark.read': 'Marquer comme lu',
    'notifications.mark.all.read': 'Tout marquer comme lu',
    'notifications.settings': 'Paramètres de notification',
    
    // Formulaires
    'form.required': 'Champ obligatoire',
    'form.save': 'Enregistrer',
    'form.cancel': 'Annuler',
    'form.submit': 'Soumettre',
    'form.loading': 'Chargement...',
    
    // Messages système
    'success.save': 'Sauvegarde réussie',
    'success.delete': 'Suppression réussie',
    'error.general': 'Une erreur est survenue',
    'error.network': 'Erreur de connexion',
    'error.unauthorized': 'Accès non autorisé',
    'error.not.found': 'Ressource non trouvée',
    
    // Administration
    'admin.title': 'Administration',
    'admin.users': 'Utilisateurs',
    'admin.projects': 'Projets',
    'admin.orders': 'Commandes',
    'admin.statistics': 'Statistiques',
    'admin.settings': 'Paramètres'
  },
  
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.services': 'Services',
    'nav.portfolio': 'Portfolio',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.dashboard': 'Dashboard',
    'nav.logout': 'Logout',
    
    // Homepage
    'home.title': 'MiaTech - Professional Technology Solutions',
    'home.subtitle': 'Your partner for all digital projects',
    'home.cta': 'Discover our services',
    'home.features.title': 'Why choose MiaTech?',
    'home.features.expertise': 'Recognized expertise',
    'home.features.expertise.desc': 'Over 10 years of development experience',
    'home.features.support': '24/7 Support',
    'home.features.support.desc': 'A dedicated team to support you',
    'home.features.quality': 'Guaranteed quality',
    'home.features.quality.desc': 'Tested and optimized deliverables',
    
    // Services
    'services.title': 'Our Services',
    'services.web.title': 'Web Development',
    'services.web.desc': 'Modern websites and custom web applications',
    'services.mobile.title': 'Mobile Applications',
    'services.mobile.desc': 'Native or cross-platform iOS and Android apps',
    'services.design.title': 'UI/UX Design',
    'services.design.desc': 'Intuitive and attractive user interfaces',
    'services.consulting.title': 'IT Consulting',
    'services.consulting.desc': 'Strategic and technical guidance',
    
    // Authentication
    'auth.login.title': 'Login',
    'auth.register.title': 'Create Account',
    'auth.email': 'Email address',
    'auth.password': 'Password',
    'auth.fullName': 'Full name',
    'auth.company': 'Company',
    'auth.phone': 'Phone',
    'auth.login.button': 'Sign in',
    'auth.register.button': 'Create account',
    'auth.forgot.password': 'Forgot password?',
    'auth.no.account': 'No account?',
    'auth.have.account': 'Already have an account?',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Welcome',
    'dashboard.stats.projects': 'Projects',
    'dashboard.stats.orders': 'Orders',
    'dashboard.stats.messages': 'Messages',
    'dashboard.recent.projects': 'Recent projects',
    'dashboard.recent.orders': 'Recent orders',
    
    // Projects
    'projects.title': 'My Projects',
    'projects.status.pending': 'Pending',
    'projects.status.active': 'Active',
    'projects.status.completed': 'Completed',
    'projects.status.cancelled': 'Cancelled',
    'projects.progress': 'Progress',
    'projects.team': 'Team',
    'projects.timeline': 'Timeline',
    
    // Orders
    'orders.title': 'My Orders',
    'orders.new': 'New order',
    'orders.number': 'Order #',
    'orders.service': 'Service',
    'orders.amount': 'Amount',
    'orders.status': 'Status',
    'orders.date': 'Date',
    
    // Messages/Chat
    'chat.title': 'Messages',
    'chat.new.message': 'New message',
    'chat.type.message': 'Type your message...',
    'chat.send': 'Send',
    'chat.typing': 'Typing...',
    'chat.online': 'Online',
    'chat.offline': 'Offline',
    
    // Notifications
    'notifications.title': 'Notifications',
    'notifications.mark.read': 'Mark as read',
    'notifications.mark.all.read': 'Mark all as read',
    'notifications.settings': 'Notification settings',
    
    // Forms
    'form.required': 'Required field',
    'form.save': 'Save',
    'form.cancel': 'Cancel',
    'form.submit': 'Submit',
    'form.loading': 'Loading...',
    
    // System messages
    'success.save': 'Successfully saved',
    'success.delete': 'Successfully deleted',
    'error.general': 'An error occurred',
    'error.network': 'Connection error',
    'error.unauthorized': 'Unauthorized access',
    'error.not.found': 'Resource not found',
    
    // Administration
    'admin.title': 'Administration',
    'admin.users': 'Users',
    'admin.projects': 'Projects',
    'admin.orders': 'Orders',
    'admin.statistics': 'Statistics',
    'admin.settings': 'Settings'
  },
  
  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.services': 'Servicios',
    'nav.portfolio': 'Portafolio',
    'nav.about': 'Acerca de',
    'nav.contact': 'Contacto',
    'nav.login': 'Iniciar sesión',
    'nav.register': 'Registrarse',
    'nav.dashboard': 'Panel',
    'nav.logout': 'Cerrar sesión',
    
    // Homepage
    'home.title': 'MiaTech - Soluciones Tecnológicas Profesionales',
    'home.subtitle': 'Su socio para todos los proyectos digitales',
    'home.cta': 'Descubrir nuestros servicios',
    
    // Authentication
    'auth.login.title': 'Iniciar sesión',
    'auth.register.title': 'Crear cuenta',
    'auth.email': 'Correo electrónico',
    'auth.password': 'Contraseña',
    'auth.fullName': 'Nombre completo',
    'auth.company': 'Empresa',
    'auth.phone': 'Teléfono',
    
    // Dashboard
    'dashboard.title': 'Panel de Control',
    'dashboard.welcome': 'Bienvenido'
    // ... autres traductions espagnoles
  },
  
  ar: {
    // Navigation (RTL)
    'nav.home': 'الرئيسية',
    'nav.services': 'الخدمات',
    'nav.portfolio': 'المعرض',
    'nav.about': 'من نحن',
    'nav.contact': 'اتصل بنا',
    'nav.login': 'تسجيل الدخول',
    'nav.register': 'إنشاء حساب',
    'nav.dashboard': 'لوحة التحكم',
    'nav.logout': 'تسجيل الخروج',
    
    // Homepage
    'home.title': 'مياتك - حلول تقنية متخصصة',
    'home.subtitle': 'شريككم في جميع المشاريع الرقمية',
    'home.cta': 'اكتشف خدماتنا',
    
    // Authentication
    'auth.login.title': 'تسجيل الدخول',
    'auth.register.title': 'إنشاء حساب',
    'auth.email': 'البريد الإلكتروني',
    'auth.password': 'كلمة المرور',
    'auth.fullName': 'الاسم الكامل',
    'auth.company': 'الشركة',
    'auth.phone': 'الهاتف',
    
    // Dashboard
    'dashboard.title': 'لوحة التحكم',
    'dashboard.welcome': 'مرحباً'
    // ... autres traductions arabes
  }
};

// Middleware pour détecter la langue
router.use((req, res, next) => {
  const acceptLanguage = req.headers['accept-language'];
  const cookieLanguage = req.cookies?.language;
  const queryLanguage = req.query.lang;
  
  // Priorité: query > cookie > header > défaut (français)
  let language = queryLanguage || cookieLanguage;
  
  if (!language && acceptLanguage) {
    // Parser Accept-Language header
    const languages = acceptLanguage.split(',').map(lang => {
      const parts = lang.trim().split(';');
      const code = parts[0].split('-')[0]; // Prendre seulement le code de langue
      const quality = parts[1] ? parseFloat(parts[1].split('=')[1]) : 1.0;
      return { code, quality };
    });
    
    // Trouver la première langue supportée
    languages.sort((a, b) => b.quality - a.quality);
    for (const lang of languages) {
      if (supportedLanguages[lang.code]) {
        language = lang.code;
        break;
      }
    }
  }
  
  // Langue par défaut
  req.language = supportedLanguages[language] ? language : 'fr';
  next();
});

// Récupérer les langues supportées
router.get('/languages', (req, res) => {
  res.json(supportedLanguages);
});

// Récupérer les traductions pour une langue
router.get('/translations/:lang?', (req, res) => {
  try {
    const lang = req.params.lang || req.language;
    
    if (!supportedLanguages[lang]) {
      return res.status(400).json({
        message: 'Langue non supportée',
        supportedLanguages: Object.keys(supportedLanguages)
      });
    }
    
    const langTranslations = translations[lang] || translations.fr;
    
    res.json({
      language: lang,
      languageName: supportedLanguages[lang],
      isRTL: lang === 'ar', // Support RTL pour l'arabe
      translations: langTranslations
    });
  } catch (error) {
    console.error('Erreur récupération traductions:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des traductions' 
    });
  }
});

// Définir la langue préférée de l'utilisateur
router.post('/language', authenticate, async (req, res) => {
  try {
    const { language } = req.body;
    
    if (!supportedLanguages[language]) {
      return res.status(400).json({
        message: 'Langue non supportée',
        supportedLanguages: Object.keys(supportedLanguages)
      });
    }
    
    // TODO: Sauvegarder en base de données
    // await User.findByIdAndUpdate(req.user.id, { preferredLanguage: language });
    
    // Définir le cookie de langue
    res.cookie('language', language, {
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 an
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production'
    });
    
    res.json({
      message: 'Langue mise à jour',
      language: language,
      languageName: supportedLanguages[language]
    });
  } catch (error) {
    console.error('Erreur définition langue:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la définition de la langue' 
    });
  }
});

// Récupérer les traductions avec interpolation
router.post('/translate', (req, res) => {
  try {
    const { keys, language, variables = {} } = req.body;
    
    if (!keys || !Array.isArray(keys)) {
      return res.status(400).json({
        message: 'Clés de traduction requises (tableau)'
      });
    }
    
    const lang = language || req.language;
    const langTranslations = translations[lang] || translations.fr;
    
    const result = {};
    
    keys.forEach(key => {
      let translation = langTranslations[key] || key;
      
      // Interpolation simple des variables
      Object.keys(variables).forEach(varKey => {
        const placeholder = `{{${varKey}}}`;
        translation = translation.replace(placeholder, variables[varKey]);
      });
      
      result[key] = translation;
    });
    
    res.json({
      language: lang,
      translations: result
    });
  } catch (error) {
    console.error('Erreur traduction:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la traduction' 
    });
  }
});

// Ajouter/modifier des traductions (admin seulement)
router.put('/translations/:lang', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { lang } = req.params;
    const { translations: newTranslations } = req.body;
    
    if (!supportedLanguages[lang]) {
      return res.status(400).json({
        message: 'Langue non supportée'
      });
    }
    
    if (!newTranslations || typeof newTranslations !== 'object') {
      return res.status(400).json({
        message: 'Traductions requises (objet)'
      });
    }
    
    // Fusionner avec les traductions existantes
    if (!translations[lang]) {
      translations[lang] = {};
    }
    
    translations[lang] = {
      ...translations[lang],
      ...newTranslations
    };
    
    // TODO: Sauvegarder en base de données pour persistance
    
    res.json({
      message: 'Traductions mises à jour',
      language: lang,
      updatedKeys: Object.keys(newTranslations)
    });
  } catch (error) {
    console.error('Erreur mise à jour traductions:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la mise à jour des traductions' 
    });
  }
});

// Exporter toutes les traductions (admin seulement)
router.get('/translations/export/:lang?', authenticate, authorize(['admin']), (req, res) => {
  try {
    const { lang } = req.params;
    
    if (lang) {
      if (!supportedLanguages[lang]) {
        return res.status(400).json({
          message: 'Langue non supportée'
        });
      }
      
      res.json({
        language: lang,
        languageName: supportedLanguages[lang],
        translations: translations[lang] || {}
      });
    } else {
      res.json({
        supportedLanguages,
        allTranslations: translations
      });
    }
  } catch (error) {
    console.error('Erreur export traductions:', error);
    res.status(500).json({ 
      message: 'Erreur lors de l\'export des traductions' 
    });
  }
});

// Statistiques des langues utilisées
router.get('/language-stats', authenticate, authorize(['admin']), async (req, res) => {
  try {
    // TODO: Implémenter les vraies statistiques depuis la base de données
    const stats = {
      totalUsers: 0,
      byLanguage: {
        fr: 0,
        en: 0,
        es: 0,
        de: 0,
        it: 0,
        ar: 0
      },
      mostUsed: 'fr',
      coveragePercentage: {
        fr: 100,
        en: 90,
        es: 70,
        de: 60,
        it: 50,
        ar: 40
      }
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Erreur statistiques langues:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des statistiques' 
    });
  }
});

module.exports = router;