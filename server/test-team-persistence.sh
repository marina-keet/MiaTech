#!/bin/bash

echo "🧪 === Test de Persistance de l'Équipe ==="

# 1. Connexion admin
echo -e "\n1️⃣ Connexion admin..."
TOKEN=$(curl -s -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@miatech.com","password":"admin123"}' | \
  grep -o '"token":"[^"]*"' | \
  sed 's/"token":"\(.*\)"/\1/')

if [ -z "$TOKEN" ]; then
    echo "❌ Échec connexion admin"
    exit 1
fi

echo "✅ Token récupéré"

# 2. Vérifier la liste actuelle de l'équipe
echo -e "\n2️⃣ Récupération équipe actuelle..."
TEAM_RESPONSE=$(curl -s -X GET http://localhost:5000/api/admin/team-members \
  -H "Authorization: Bearer $TOKEN")

echo "📋 Équipe actuelle: $TEAM_RESPONSE"

CURRENT_COUNT=$(echo "$TEAM_RESPONSE" | grep -o '"totalMembers":[0-9]*' | cut -d':' -f2)
echo "👥 Nombre actuel de membres: $CURRENT_COUNT"

# 3. Créer un nouveau membre d'équipe
echo -e "\n3️⃣ Création nouveau membre équipe..."
CREATE_RESPONSE=$(curl -s -X POST http://localhost:5000/api/admin/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Développeur",
    "email": "testdev@miatech.com",
    "password": "testpass123",
    "role": "dev",
    "phone": "+33 6 12 34 56 78"
  }')

echo "📋 Réponse création: $CREATE_RESPONSE"

if echo "$CREATE_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Membre créé avec succès"
else
    echo "❌ Échec création membre"
fi

# 4. Vérifier que le membre apparaît dans l'équipe
echo -e "\n4️⃣ Vérification dans l'équipe..."
sleep 1
UPDATED_TEAM=$(curl -s -X GET http://localhost:5000/api/admin/team-members \
  -H "Authorization: Bearer $TOKEN")

if echo "$UPDATED_TEAM" | grep -q "testdev@miatech.com"; then
    echo "✅ Nouveau membre trouvé dans l'équipe"
else
    echo "❌ Nouveau membre non trouvé"
fi

NEW_COUNT=$(echo "$UPDATED_TEAM" | grep -o '"totalMembers":[0-9]*' | cut -d':' -f2)
echo "👥 Nouveau nombre de membres: $NEW_COUNT"

# 5. Vérifier la sauvegarde dans le fichier
echo -e "\n5️⃣ Vérification sauvegarde fichier..."
if grep -q "testdev@miatech.com" /home/marina/MiaTech/server/data/clients.json; then
    echo "✅ Membre trouvé dans clients.json"
else
    echo "❌ Membre non trouvé dans clients.json"
fi

# 6. Test après actualisation (simulation)
echo -e "\n6️⃣ Test après 'actualisation'..."
REFRESH_TEAM=$(curl -s -X GET http://localhost:5000/api/admin/team-members \
  -H "Authorization: Bearer $TOKEN")

if echo "$REFRESH_TEAM" | grep -q "testdev@miatech.com"; then
    echo "✅ Membre persiste après actualisation !"
    FINAL_COUNT=$(echo "$REFRESH_TEAM" | grep -o '"totalMembers":[0-9]*' | cut -d':' -f2)
    echo "👥 Nombre final de membres: $FINAL_COUNT"
else
    echo "❌ Membre disparu après actualisation"
fi

echo -e "\n📊 === Résumé ==="
echo "• Membres au début: $CURRENT_COUNT"
echo "• Membres à la fin: $FINAL_COUNT"

if [ "$FINAL_COUNT" -gt "$CURRENT_COUNT" ]; then
    echo "✅ SUCCÈS: La gestion d'équipe persiste correctement !"
else
    echo "❌ ÉCHEC: Problème de persistance"
fi

echo -e "\n🎉 === Test Terminé ==="