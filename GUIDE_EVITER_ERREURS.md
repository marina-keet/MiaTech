# Configuration MiaTech - Comptes de test

## Éviter les erreurs de connexion

### Serveurs
- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:5175
- **Admin Dashboard**: http://localhost:5000/admin-dashboard-protected.html

### Monitoring
```bash
# Surveiller le serveur (évite les coupures)
./monitor-server.sh monitor

# Vérifier l'état
./monitor-server.sh status

# Redémarrer si nécessaire  
./monitor-server.sh restart
```

### Comptes de test fonctionnels

#### Admin
- **Email**: admin@miatech.com
- **Password**: admin123

#### Client Chancel (principal)
- **Email**: chancel@test.com  
- **Password**: 123456

### Commandes utiles

```bash
# Démarrer les serveurs
cd /home/marina/MiaTech
./monitor-server.sh start
cd client && npm run dev

# Tester l'API
curl http://localhost:5000/api/users
```

### Prévention des erreurs

1. ✅ **CORS configuré** pour tous les ports (3000, 5173, 5174, 5175)
2. ✅ **Auto-surveillance** du serveur avec redémarrage automatique
3. ✅ **Comptes de test** avec mots de passe simples
4. ✅ **Base de données** nettoyée (seulement admins + chancel)
5. ✅ **Persistance** garantie dans /data/clients.json

### En cas de problème
1. Vérifier: `./monitor-server.sh status`
2. Redémarrer: `./monitor-server.sh restart`  
3. Utiliser le compte: **chancel@test.com** / **123456**