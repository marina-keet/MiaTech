# Structure du Projet MiaTech

## 📁 Vue d'ensemble

```
miatech/
├── 📄 README.md                     # Documentation principale
├── 📄 package.json                  # Métadonnées du projet
├── 📁 .github/                      # Configuration GitHub
│   └── 📄 copilot-instructions.md   # Instructions pour Copilot
├── 📁 .vscode/                      # Configuration VS Code
│   └── 📄 tasks.json                # Tâches de développement
├── 📁 client/                       # 🎨 Frontend React
├── 📁 server/                       # ⚙️ Backend Node.js
├── 📁 shared/                       # 🔄 Code partagé
└── 📁 docs/                         # 📚 Documentation
```

## 🎨 Frontend (/client)

```
client/
├── 📄 package.json                  # Dépendances frontend
├── 📄 vite.config.ts               # Configuration Vite
├── 📄 tailwind.config.js           # Configuration Tailwind CSS
├── 📄 postcss.config.js            # Configuration PostCSS
├── 📄 tsconfig.json                # Configuration TypeScript
├── 📄 index.html                   # Point d'entrée HTML
├── 📁 public/                      # Fichiers statiques
└── 📁 src/                         # Code source
    ├── 📄 main.tsx                 # Point d'entrée React
    ├── 📄 App.tsx                  # Composant principal
    ├── 📄 index.css                # Styles globaux
    ├── 📁 components/              # Composants réutilisables
    │   ├── 📁 Layout/              # Composants de mise en page
    │   │   ├── 📄 Layout.tsx       # Layout principal
    │   │   ├── 📄 Header.tsx       # En-tête du site
    │   │   └── 📄 Footer.tsx       # Pied de page
    │   ├── 📁 UI/                  # Composants d'interface
    │   └── 📄 ProtectedRoute.tsx   # Route protégée
    ├── 📁 pages/                   # Pages de l'application
    │   ├── 📄 HomePage.tsx         # Page d'accueil
    │   ├── 📄 ServicesPage.tsx     # Page des services
    │   ├── 📄 OrderPage.tsx        # Page de commande
    │   ├── 📄 LoginPage.tsx        # Page de connexion
    │   ├── 📄 RegisterPage.tsx     # Page d'inscription
    │   ├── 📄 DashboardPage.tsx    # Tableau de bord client
    │   ├── 📄 ContactPage.tsx      # Page de contact
    │   ├── 📄 BlogPage.tsx         # Page blog/portfolio
    │   └── 📄 BlogPostPage.tsx     # Article de blog
    ├── 📁 hooks/                   # Custom hooks React
    │   ├── 📄 useAuth.ts           # Hook d'authentification
    │   ├── 📄 useApi.ts            # Hook pour les appels API
    │   └── 📄 useLocalStorage.ts   # Hook pour localStorage
    ├── 📁 stores/                  # Gestion d'état (Zustand)
    │   ├── 📄 authStore.ts         # Store d'authentification
    │   ├── 📄 orderStore.ts        # Store des commandes
    │   └── 📄 notificationStore.ts # Store des notifications
    ├── 📁 services/                # Services API
    │   ├── 📄 api.ts               # Configuration Axios
    │   ├── 📄 authService.ts       # Service d'authentification
    │   ├── 📄 orderService.ts      # Service des commandes
    │   ├── 📄 projectService.ts    # Service des projets
    │   └── 📄 paymentService.ts    # Service de paiement
    ├── 📁 utils/                   # Utilitaires
    │   ├── 📄 constants.ts         # Constantes
    │   ├── 📄 formatters.ts        # Formatage de données
    │   ├── 📄 validators.ts        # Validation de formulaires
    │   └── 📄 helpers.ts           # Fonctions utilitaires
    └── 📁 types/                   # Types TypeScript
        ├── 📄 auth.types.ts        # Types d'authentification
        ├── 📄 order.types.ts       # Types de commandes
        └── 📄 project.types.ts     # Types de projets
```

## ⚙️ Backend (/server)

```
server/
├── 📄 package.json                 # Dépendances backend
├── 📄 server.js                    # Point d'entrée du serveur
├── 📄 .env.example                 # Template des variables d'environnement
├── 📁 models/                      # Modèles de données MongoDB
│   ├── 📄 User.js                  # Modèle utilisateur
│   ├── 📄 Service.js               # Modèle service
│   ├── 📄 Order.js                 # Modèle commande
│   ├── 📄 Project.js               # Modèle projet
│   └── 📄 BlogPost.js              # Modèle article de blog
├── 📁 routes/                      # Routes API
│   ├── 📄 auth.js                  # Routes d'authentification
│   ├── 📄 services.js              # Routes des services
│   ├── 📄 orders.js                # Routes des commandes
│   ├── 📄 projects.js              # Routes des projets
│   ├── 📄 payments.js              # Routes de paiement
│   ├── 📄 blog.js                  # Routes du blog
│   ├── 📄 contact.js               # Routes de contact
│   └── 📄 users.js                 # Routes des utilisateurs
├── 📁 middleware/                  # Middlewares Express
│   ├── 📄 auth.js                  # Middleware d'authentification
│   ├── 📄 validation.js            # Middleware de validation
│   ├── 📄 upload.js                # Middleware d'upload de fichiers
│   └── 📄 errorHandler.js          # Gestionnaire d'erreurs
├── 📁 controllers/                 # Contrôleurs (logique métier)
│   ├── 📄 authController.js        # Contrôleur d'authentification
│   ├── 📄 orderController.js       # Contrôleur des commandes
│   └── 📄 paymentController.js     # Contrôleur de paiement
├── 📁 services/                    # Services métier
│   ├── 📄 emailService.js          # Service d'envoi d'emails
│   ├── 📄 paymentService.js        # Service de paiement
│   └── 📄 notificationService.js   # Service de notifications
├── 📁 utils/                       # Utilitaires backend
│   ├── 📄 database.js              # Configuration base de données
│   ├── 📄 logger.js                # Configuration des logs
│   └── 📄 helpers.js               # Fonctions utilitaires
└── 📁 tests/                       # Tests backend
    ├── 📄 auth.test.js             # Tests d'authentification
    ├── 📄 orders.test.js           # Tests des commandes
    └── 📄 setup.js                 # Configuration des tests
```

## 🔄 Shared (/shared)

```
shared/
├── 📄 package.json                 # Dépendances partagées
├── 📁 types/                       # Types TypeScript partagés
│   ├── 📄 common.types.ts          # Types communs
│   ├── 📄 api.types.ts             # Types d'API
│   └── 📄 database.types.ts        # Types de base de données
├── 📁 constants/                   # Constantes partagées
│   ├── 📄 status.ts                # Statuts des commandes/projets
│   ├── 📄 roles.ts                 # Rôles utilisateurs
│   └── 📄 categories.ts            # Catégories de services
└── 📁 utils/                       # Utilitaires partagés
    ├── 📄 validation.ts            # Schémas de validation
    └── 📄 formatters.ts            # Formatage de données
```

## 📚 Documentation (/docs)

```
docs/
├── 📄 INSTALLATION.md              # Guide d'installation
├── 📄 API.md                       # Documentation API
├── 📄 DEPLOYMENT.md                # Guide de déploiement
├── 📄 CONTRIBUTING.md              # Guide de contribution
└── 📄 CHANGELOG.md                 # Historique des versions
```

## 🔧 Configuration VS Code (/.vscode)

```
.vscode/
├── 📄 tasks.json                   # Tâches de développement
├── 📄 settings.json                # Paramètres du workspace
└── 📄 extensions.json              # Extensions recommandées
```

## 🎯 Flux de données

```
┌─────────────┐    HTTP/API     ┌─────────────┐    Mongoose    ┌─────────────┐
│   Frontend  │◄──────────────►│   Backend   │◄──────────────►│   MongoDB   │
│ (React/TS)  │   REST/JSON     │ (Node/Exp)  │    ODM         │   Database  │
└─────────────┘                 └─────────────┘                └─────────────┘
       ▲                               ▲
       │ State Management              │ Business Logic
       │ (Zustand + React Query)       │ (Controllers + Services)
       ▼                               ▼
┌─────────────┐                 ┌─────────────┐
│  Component  │                 │ Middleware  │
│    Tree     │                 │   Stack     │
└─────────────┘                 └─────────────┘
```

Cette architecture modulaire permet une séparation claire des responsabilités et facilite la maintenance et l'évolution du projet.