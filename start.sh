#!/bin/bash

echo "🚀 ========================================"
echo "🚀 DÉMARRAGE RAPIDE MIATECH"
echo "🚀 ========================================"

# Aller dans le dossier server
cd "$(dirname "$0")/server"

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé"
    echo "📦 Installez Node.js depuis: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Vérifier si les dépendances sont installées
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances npm..."
    npm install --no-optional
    if [ $? -ne 0 ]; then
        echo "❌ Erreur lors de l'installation des dépendances"
        echo "💡 Essayez manuellement: cd server && npm install"
        exit 1
    fi
fi

# Créer le fichier .env s'il n'existe pas
if [ ! -f ".env" ]; then
    echo "🔧 Création du fichier .env..."
    cp .env.example .env
    echo "⚠️  Modifiez le fichier server/.env avec vos vraies configurations"
fi

# Démarrer le serveur
echo "🚀 Démarrage du serveur MiaTech..."
echo "🌐 URL: http://localhost:5000"
echo "🔍 Health check: http://localhost:5000/health"
echo "🔧 Pour arrêter: Ctrl+C"
echo "🚀 ========================================"

node server.js