#!/bin/bash

# Test de persistance des administrateurs
echo "🧪 === Test de Persistance des Administrateurs ==="

# 1. Connexion et récupération du token
echo -e "\n1️⃣ Connexion admin..."
TOKEN=$(curl -s -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@miatech.com","password":"admin123"}' | \
  grep -o '"token":"[^"]*"' | \
  sed 's/"token":"\(.*\)"/\1/')

if [ -z "$TOKEN" ]; then
    echo "❌ Échec de la connexion admin"
    exit 1
fi

echo "✅ Token récupéré: ${TOKEN:0:20}..."

# 2. Créer un nouvel administrateur
echo -e "\n2️⃣ Création nouvel administrateur..."
RESPONSE=$(curl -s -X POST http://localhost:5000/api/admin/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Admin Persistent",
    "email": "testpersistent@miatech.com",
    "password": "testpass123",
    "role": "admin"
  }')

echo "📋 Réponse création: $RESPONSE"

if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "✅ Admin créé avec succès"
else
    echo "❌ Échec création admin"
    exit 1
fi

# 3. Attendre un peu pour la sauvegarde
echo -e "\n3️⃣ Attente sauvegarde..."
sleep 3

# 4. Vérifier qu'il est dans la liste des membres équipe
echo -e "\n4️⃣ Vérification dans la liste équipe..."
TEAM_RESPONSE=$(curl -s -X GET http://localhost:5000/api/admin/team-members \
  -H "Authorization: Bearer $TOKEN")

echo "📋 Membres équipe: $TEAM_RESPONSE"

if echo "$TEAM_RESPONSE" | grep -q "testpersistent@miatech.com"; then
    echo "✅ Admin trouvé dans la liste équipe"
else
    echo "⚠️ Admin non trouvé dans la liste équipe"
fi

# 5. Test de connexion avec le nouvel admin
echo -e "\n5️⃣ Test connexion nouvel admin..."
NEW_LOGIN=$(curl -s -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testpersistent@miatech.com","password":"testpass123"}')

if echo "$NEW_LOGIN" | grep -q '"success":true'; then
    echo "✅ Connexion nouvel admin réussie"
else
    echo "❌ Échec connexion nouvel admin"
fi

# 6. Vérifier qu'il est sauvé dans le fichier
echo -e "\n6️⃣ Vérification sauvegarde fichier..."
if grep -q "testpersistent@miatech.com" /home/marina/MiaTech/server/data/clients.json; then
    echo "✅ Admin trouvé dans clients.json"
else
    echo "❌ Admin non trouvé dans clients.json"
fi

echo -e "\n🎉 === Test Terminé ==="