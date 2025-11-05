# 🐳 DÉPLOIEMENT DOCKER RÉUSSI !

## ✅ ÉTAT ACTUEL

Le serveur MCP GROWCRM v2.0 est **déployé avec succès dans Docker** !

### 📊 Statut du conteneur
- **Nom** : `growcrm-mcp-server`
- **État** : ✅ Running (Healthy)
- **Image** : `growcrm-mcp-server_growcrm-mcp:latest`
- **Réseau** : `growcrm-mcp-network`
- **Mémoire** : 14.96 MiB / 512 MiB
- **CPU** : 0.00%

### 🎯 Tests validés
- ✅ Conteneur actif et healthy
- ✅ Processus Node.js opérationnel
- ✅ Aucune erreur dans les logs
- ✅ API GROWCRM accessible
- ✅ Ressources optimisées

---

## 📂 FICHIERS DOCKER CRÉÉS

### Structure complète
```
growcrm-mcp-server/
├── Dockerfile                 # Image Docker optimisée (Alpine Linux)
├── docker-compose.yml         # Production (avec healthcheck)
├── docker-compose.dev.yml     # Développement (avec hot-reload)
├── .dockerignore             # Exclusions de build
├── docker-deploy.sh          # Script de déploiement automatique
├── test-docker.sh            # Tests de validation
├── DOCKER_GUIDE.md           # Documentation complète
├── index.js                  # Serveur MCP stdio
└── index-http.js             # Serveur MCP HTTP (optionnel)
```

---

## 🚀 COMMANDES ESSENTIELLES

### Démarrage et arrêt
```bash
# Déploiement automatique (recommandé)
./docker-deploy.sh

# Démarrer manuellement
docker-compose up -d

# Arrêter
docker-compose down

# Redémarrer
docker-compose restart growcrm-mcp
```

### Monitoring
```bash
# Voir les logs en temps réel
docker-compose logs -f growcrm-mcp

# Statut du conteneur
docker-compose ps

# Ressources utilisées
docker stats growcrm-mcp-server

# Tests complets
./test-docker.sh
```

### Maintenance
```bash
# Reconstruire l'image
docker-compose up -d --build

# Accéder au shell
docker-compose exec growcrm-mcp sh

# Voir la configuration
docker-compose config
```

---

## 🔌 INTÉGRATION AVEC CLAUDE DESKTOP

### Configuration pour Docker

Modifiez `~/.config/Claude/claude_desktop_config.json` :

```json
{
  "mcpServers": {
    "growcrm": {
      "command": "docker",
      "args": [
        "exec",
        "-i",
        "growcrm-mcp-server",
        "node",
        "index.js"
      ]
    }
  }
}
```

### Alternative avec docker-compose

```json
{
  "mcpServers": {
    "growcrm": {
      "command": "docker-compose",
      "args": [
        "-f",
        "/www/wwwroot/app-tydev/GROWCRM/growcrm-mcp-server/docker-compose.yml",
        "exec",
        "-T",
        "growcrm-mcp",
        "node",
        "index.js"
      ]
    }
  }
}
```

---

## 🌐 MODE HTTP (OPTIONNEL)

Pour activer le mode HTTP sur le port 3200 :

### 1. Décommenter dans docker-compose.yml
```yaml
ports:
  - "3200:3200"
```

### 2. Utiliser index-http.js
```bash
# Dans le Dockerfile, remplacer :
CMD ["node", "index-http.js"]
```

### 3. Reconstruire
```bash
docker-compose up -d --build
```

### 4. Tester
```bash
# Health check
curl http://localhost:3200/health

# Documentation
open http://localhost:3200

# Liste des outils
curl http://localhost:3200/tools
```

---

## 🛡️ SÉCURITÉ

### Points de sécurité implémentés
- ✅ **Image Alpine Linux** : Minimale (15 MB vs 1 GB)
- ✅ **Utilisateur non-root** : Processus sous `mcpuser`
- ✅ **Secrets via .env** : Pas de credentials dans l'image
- ✅ **Limites de ressources** : CPU 1.0, RAM 512MB
- ✅ **Healthcheck actif** : Vérification toutes les 30s
- ✅ **Logs rotatifs** : Max 3 fichiers de 10 MB
- ✅ **Réseau isolé** : `growcrm-mcp-network`

---

## 📈 MONITORING

### Healthcheck automatique
```bash
# Voir le statut de santé
docker inspect growcrm-mcp-server --format='{{.State.Health.Status}}'

# Historique des checks
docker inspect growcrm-mcp-server --format='{{json .State.Health}}' | jq
```

### Logs structurés
```bash
# Filtrer les erreurs
docker-compose logs growcrm-mcp | grep -i error

# Sauvegarder les logs
docker-compose logs growcrm-mcp > logs_$(date +%Y%m%d).txt
```

### Alertes (à configurer)
```bash
# Script de monitoring (exemple)
watch -n 10 'docker inspect growcrm-mcp-server --format="{{.State.Health.Status}}"'
```

---

## 🔄 MISE À JOUR

### Procédure de mise à jour
```bash
# 1. Sauvegarder .env
cp .env .env.backup

# 2. Arrêter le conteneur
docker-compose down

# 3. Récupérer les mises à jour (si Git)
git pull

# 4. Reconstruire et redémarrer
docker-compose up -d --build --force-recreate

# 5. Vérifier
docker-compose ps
docker-compose logs -f growcrm-mcp
```

---

## 🐛 DÉPANNAGE

### Problèmes courants

#### Le conteneur redémarre en boucle
```bash
# Voir les logs
docker logs growcrm-mcp-server --tail=100

# Vérifier la configuration
docker-compose config

# Reconstruire sans cache
docker-compose build --no-cache
docker-compose up -d
```

#### Token invalide
```bash
# Régénérer le token
./generate-token.sh

# Mettre à jour .env
# Redémarrer
docker-compose restart growcrm-mcp
```

#### Problème réseau
```bash
# Vérifier la connexion depuis le conteneur
docker-compose exec growcrm-mcp wget -O- https://app.ty-dev.fr/api/v1/dashboard/stats

# Recréer le réseau
docker-compose down
docker network prune
docker-compose up -d
```

---

## 📦 PRODUCTION

### Recommandations production

1. **Backup automatique**
```bash
# Cron job pour .env
0 2 * * * cp /path/to/.env /path/to/backups/.env.$(date +\%Y\%m\%d)
```

2. **Monitoring avec Prometheus**
```yaml
# Ajouter dans docker-compose.yml
services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
```

3. **Reverse proxy Traefik**
```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.mcp.rule=Host(`mcp.example.com`)"
```

4. **Logs centralisés**
```yaml
logging:
  driver: "gelf"
  options:
    gelf-address: "udp://localhost:12201"
```

---

## ✅ CHECKLIST FINALE

Avant de considérer le déploiement terminé :

- [x] Docker et Docker Compose installés
- [x] Fichier .env configuré
- [x] Token Sanctum valide
- [x] Image Docker construite
- [x] Conteneur démarré (healthy)
- [x] Tests de validation passés
- [x] Logs sans erreur
- [x] API GROWCRM accessible
- [x] Documentation complète
- [x] Scripts d'administration créés

---

## 🎉 RÉSULTAT

**Le serveur MCP GROWCRM v2.0 est maintenant déployé dans Docker et opérationnel !**

### Avantages du déploiement Docker
- ✅ **Isolation** : Pas de conflit avec d'autres applications
- ✅ **Portabilité** : Même environnement partout
- ✅ **Facilité** : Un seul script pour tout installer
- ✅ **Sécurité** : Conteneur avec utilisateur non-root
- ✅ **Monitoring** : Healthcheck et logs centralisés
- ✅ **Performance** : Limites de ressources définies

### Prochaines étapes suggérées
1. Configurer Claude Desktop avec Docker
2. Tester les 38 outils MCP
3. Mettre en place le monitoring
4. Configurer les backups automatiques
5. Activer le mode HTTP si besoin

---

## 📞 SUPPORT

**Documentation** :
- `DOCKER_GUIDE.md` - Guide complet Docker
- `README.md` - Guide général
- `STATUS.md` - État actuel du projet

**Scripts utiles** :
- `./docker-deploy.sh` - Déploiement automatique
- `./test-docker.sh` - Tests de validation
- `./generate-token.sh` - Générer un token

**Commandes rapides** :
```bash
# Tout redémarrer proprement
docker-compose down && docker-compose up -d --build

# Voir ce qui se passe
docker-compose logs -f growcrm-mcp

# Tests complets
./test-docker.sh
```

---

**🚀 Félicitations ! Votre serveur MCP GROWCRM tourne maintenant dans Docker !**
