#!/bin/bash

echo "🧪 === Test de Persistance des Paramètres ==="

# 1. Démarrer le serveur en arrière-plan
echo "🚀 Démarrage du serveur..."
cd /home/marina/MiaTech/server
node server-temp.js > /dev/null 2>&1 &
SERVER_PID=$!
echo "📍 Serveur démarré avec PID: $SERVER_PID"

# Attendre que le serveur démarre
sleep 3

# 2. Se connecter admin
echo -e "\n1️⃣ Connexion admin..."
TOKEN=$(curl -s -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@miatech.com","password":"admin123"}' | \
  grep -o '"token":"[^"]*"' | \
  sed 's/"token":"\(.*\)"/\1/')

if [ -z "$TOKEN" ]; then
    echo "❌ Échec connexion admin"
    kill $SERVER_PID
    exit 1
fi

echo "✅ Token récupéré"

# 3. Sauvegarder de nouveaux paramètres
echo -e "\n2️⃣ Mise à jour des paramètres..."
UPDATE_RESPONSE=$(curl -s -X PUT http://localhost:5000/api/admin/settings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "MiaTech - Édition Modifiée",
    "email": "nouveau@miatech.com",
    "phone": "+33 9 87 65 43 21",
    "address": "456 Avenue de Test, 69000 Lyon",
    "website": "https://test.miatech.com",
    "description": "Description modifiée pour le test"
  }')

echo "📋 Réponse mise à jour: $UPDATE_RESPONSE"

if echo "$UPDATE_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Paramètres mis à jour avec succès"
else
    echo "❌ Échec mise à jour paramètres"
    kill $SERVER_PID
    exit 1
fi

# 4. Vérifier le contenu du fichier
echo -e "\n3️⃣ Vérification sauvegarde fichier..."
if grep -q "MiaTech - Édition Modifiée" /home/marina/MiaTech/server/data/settings.json; then
    echo "✅ Paramètres trouvés dans settings.json"
else
    echo "❌ Paramètres non trouvés dans settings.json"
    echo "📄 Contenu actuel du fichier:"
    cat /home/marina/MiaTech/server/data/settings.json
fi

# 5. Redémarrer le serveur pour tester la persistance
echo -e "\n4️⃣ Redémarrage serveur pour test persistance..."
kill $SERVER_PID
sleep 2

# Redémarrer
node server-temp.js > /dev/null 2>&1 &
NEW_SERVER_PID=$!
sleep 3

# 6. Vérifier que les paramètres sont bien chargés
echo -e "\n5️⃣ Vérification après redémarrage..."
# Nouvelle connexion
NEW_TOKEN=$(curl -s -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@miatech.com","password":"admin123"}' | \
  grep -o '"token":"[^"]*"' | \
  sed 's/"token":"\(.*\)"/\1/')

GET_RESPONSE=$(curl -s -X GET http://localhost:5000/api/admin/settings \
  -H "Authorization: Bearer $NEW_TOKEN")

if echo "$GET_RESPONSE" | grep -q "MiaTech - Édition Modifiée"; then
    echo "✅ Paramètres persistés après redémarrage !"
else
    echo "❌ Paramètres non persistés"
    echo "📋 Réponse: $GET_RESPONSE"
fi

# Nettoyer
kill $NEW_SERVER_PID

echo -e "\n🎉 === Test Terminé ==="