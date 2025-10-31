# 🚀 MiaTech - Plateforme Web Professionnelle

> Une plateforme complète pour un cabinet de technologie permettant aux clients de découvrir les services, passer commande, suivre leurs projets et effectuer des paiements en ligne.

## 📋 Table des matières

- [🎯 Fonctionnalités](#-fonctionnalités)
- [🏗️ Architecture](#️-architecture)
- [🚀 Installation](#-installation)
- [💻 Développement](#-développement)
- [📱 Pages et fonctionnalités](#-pages-et-fonctionnalités)
- [🔧 Configuration](#-configuration)
- [🧪 Tests](#-tests)
- [📚 Documentation](#-documentation)
- [🤝 Contribution](#-contribution)

## 🎯 Fonctionnalités

### 🌐 Site vitrine
- **Page d'accueil** : Présentation du cabinet et de l'équipe
- **Page services** : Applications, UI/UX, Branding, etc.
- **Portfolio/Blog** : Showcases des réalisations
- **Page contact** : Formulaire et chat en direct

### 💼 Espace client
- **Tableau de bord personnalisé** : Vue d'ensemble des projets
- **Système de commande** : Interface intuitive pour commander des services
- **Suivi en temps réel** : Progression des projets avec milestones
- **Gestion des factures** : Historique et téléchargement
- **Communication** : Messagerie intégrée avec l'équipe

### 💳 Gestion des paiements
- **Intégration Stripe/PayPal** : Paiements sécurisés en ligne
- **Gestion des devis** : Génération et validation automatique
- **Facturation** : Système complet de facturation

## 🏗️ Architecture

```
miatech/
├── 📁 client/              # Frontend React + TypeScript
│   ├── 📁 src/
│   │   ├── 📁 components/   # Composants réutilisables
│   │   ├── 📁 pages/        # Pages de l'application
│   │   ├── 📁 hooks/        # Custom hooks React
│   │   ├── 📁 stores/       # Gestion d'état (Zustand)
│   │   ├── 📁 services/     # API calls
│   │   └── 📁 utils/        # Utilitaires
│   ├── 📄 package.json
│   └── 📄 vite.config.ts
├── 📁 server/              # Backend Node.js + Express
│   ├── 📁 models/          # Modèles MongoDB
│   ├── 📁 routes/          # Routes API
│   ├── 📁 middleware/      # Middlewares Express
│   ├── 📄 server.js        # Point d'entrée
│   └── 📄 package.json
├── 📁 shared/              # Types et utilitaires partagés
└── 📁 docs/                # Documentation
```

### 🛠️ Stack Technologique

#### Frontend
- **React 18** + **TypeScript** : Interface utilisateur moderne
- **Vite** : Build tool ultra-rapide
- **Tailwind CSS** : Framework CSS utilitaire
- **React Router** : Routing côté client
- **React Query** : Gestion des données serveur
- **Zustand** : Gestion d'état simple et efficace
- **Framer Motion** : Animations fluides
- **React Hook Form** : Gestion des formulaires

#### Backend
- **Node.js** + **Express.js** : Serveur web robuste
- **MongoDB** + **Mongoose** : Base de données NoSQL
- **JWT** : Authentification sécurisée
- **Stripe API** : Traitement des paiements
- **Nodemailer** : Envoi d'emails
- **Helmet** + **CORS** : Sécurité renforcée

## 🚀 Installation

### Prérequis
- **Node.js** (v18+)
- **MongoDB** (v6+)
- **Git**

### Installation complète

```bash
# 1. Cloner le repository
git clone https://github.com/votre-username/miatech.git
cd miatech

# 2. Installer les dépendances du backend
cd server
npm install

# 3. Installer les dépendances du frontend
cd ../client
npm install

# 4. Configuration des variables d'environnement
cd ../server
cp .env.example .env
# Éditer le fichier .env avec vos configurations

# 5. Démarrer MongoDB (si local)
mongod

# 6. Démarrer le backend (terminal 1)
cd server
npm run dev

# 7. Démarrer le frontend (terminal 2)
cd client
npm run dev
```

## 💻 Développement

### Commandes utiles

```bash
# Backend (dans /server)
npm run dev      # Démarrage avec nodemon
npm start        # Démarrage production
npm test         # Tests unitaires

# Frontend (dans /client)
npm run dev      # Serveur de développement
npm run build    # Build de production
npm run preview  # Aperçu du build
npm run lint     # Linting ESLint
```

### Structure des URLs

#### Frontend
- `/` - Page d'accueil
- `/services` - Liste des services
- `/services/:serviceId` - Détail d'un service
- `/order/:serviceId?` - Page de commande
- `/login` - Connexion
- `/register` - Inscription
- `/dashboard/*` - Espace client (protégé)
- `/contact` - Contact
- `/blog` - Blog/Portfolio
- `/blog/:slug` - Article de blog

#### API Backend
- `GET /health` - Santé de l'API
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur
- `GET /api/services` - Liste des services
- `POST /api/orders` - Créer une commande
- `GET /api/projects` - Projets de l'utilisateur
- `POST /api/payments` - Traitement des paiements

## 📱 Pages et fonctionnalités

### 🏠 Page d'accueil
- Hero section avec CTA
- Présentation des services
- Témoignages clients
- Formulaire de contact rapide

### 💼 Services
- Catalogue des services disponibles
- Filtrage par catégorie
- Détails et tarification
- Bouton "Commander"

### 🛒 Système de commande
- Formulaire multi-étapes
- Upload de fichiers
- Calcul automatique des prix
- Intégration paiement

### 👤 Espace client
- **Dashboard** : Vue d'ensemble des projets actifs
- **Projets** : Suivi détaillé avec milestones
- **Factures** : Historique et téléchargements
- **Messages** : Communication avec l'équipe
- **Profil** : Gestion des informations personnelles

## 🔧 Configuration

### Variables d'environnement (.env)

```env
# Base de données
MONGODB_URI=mongodb://localhost:27017/miatech

# JWT
JWT_SECRET=votre_secret_jwt_super_securise
JWT_EXPIRE=7d

# Serveur
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre-email@gmail.com
EMAIL_PASS=votre-mot-de-passe-app

# Paiements
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Configuration MongoDB

```javascript
// Exemple de collections
users: {
  firstName, lastName, email, password, role, company, ...
}

services: {
  name, description, pricing, duration, features, ...
}

orders: {
  orderNumber, client, service, status, pricing, payment, ...
}

projects: {
  title, order, client, team, progress, timeline, ...
}

blogPosts: {
  title, content, author, status, category, seo, ...
}
```

## 🧪 Tests

```bash
# Backend
cd server && npm test

# Frontend  
cd client && npm run test

# Tests d'intégration
npm run test:integration
```

## 📚 Documentation

- [📖 Guide d'utilisation](./docs/user-guide.md)
- [🔧 Guide développeur](./docs/developer-guide.md)
- [📡 Documentation API](./docs/api.md)
- [🎨 Guide de design](./docs/design-system.md)

## 🚀 Déploiement

### Production

```bash
# Build frontend
cd client && npm run build

# Démarrer en production
cd server && npm start
```

### Variables d'environnement production
- Configurer `NODE_ENV=production`
- Utiliser une base MongoDB Atlas
- Configurer les clés Stripe de production
- Activer HTTPS

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/nouvelle-fonctionnalité`)
3. Commit (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Push (`git push origin feature/nouvelle-fonctionnalité`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👥 Équipe

- **Développeur Principal** : Votre nom
- **Design** : Équipe design
- **Product Owner** : Votre nom

---

<div align="center">
  <p>Fait avec ❤️ par l'équipe MiaTech</p>
  <p>
    <a href="https://miatech.com">🌐 Website</a> •
    <a href="mailto:contact@miatech.com">📧 Email</a> •
    <a href="https://linkedin.com/company/miatech">💼 LinkedIn</a>
  </p>
</div>