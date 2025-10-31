# Guide d'installation MiaTech

## 🚨 Résolution des problèmes SSL

Si vous rencontrez des erreurs SSL lors de l'installation des dépendances npm, voici plusieurs solutions :

### Solution 1: Configuration npm
```bash
npm config set strict-ssl false
npm config set registry http://registry.npmjs.org/
```

### Solution 2: Variables d'environnement
```bash
export NODE_TLS_REJECT_UNAUTHORIZED=0
npm install
```

### Solution 3: Utiliser Yarn
```bash
npm install -g yarn
yarn install  # À la place de npm install
```

### Solution 4: Mise à jour Node.js
Assurez-vous d'avoir Node.js v18+ :
```bash
node --version  # Vérifier la version
# Si nécessaire, mettre à jour via nvm ou télécharger depuis nodejs.org
```

## 📦 Installation étape par étape

### Backend
```bash
cd server
npm install
# OU si problèmes SSL:
yarn install
```

### Frontend
```bash
cd client
npm install
# OU si problèmes SSL:
yarn install
```

## 🚀 Démarrage

### Option 1: Via VS Code Tasks
1. Ouvrir VS Code dans le dossier MiaTech
2. `Ctrl+Shift+P` → "Tasks: Run Task"
3. Sélectionner "Start Backend Server" 
4. Répéter pour "Start Frontend Development"

### Option 2: Manuellement
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend  
cd client
npm run dev
```

### Option 3: Avec MongoDB local
```bash
# Terminal 1 - MongoDB
mongod

# Terminal 2 - Backend
cd server
npm run dev

# Terminal 3 - Frontend
cd client  
npm run dev
```

## 🔧 Configuration

### Fichier .env (server/.env)
```env
MONGODB_URI=mongodb://localhost:27017/miatech
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### Ports par défaut
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017

## ✅ Vérification
Une fois démarré, vérifiez :
- Frontend accessible sur http://localhost:3000
- API health check : http://localhost:5000/health
- MongoDB connecté (vérifier les logs du backend)