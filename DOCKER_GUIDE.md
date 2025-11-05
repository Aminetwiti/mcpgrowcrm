# ============================================================================
# GUIDE DOCKER - SERVEUR MCP GROWCRM v2.0
# ============================================================================

## 🐳 DÉPLOIEMENT DOCKER

Le serveur MCP GROWCRM peut être déployé dans Docker pour :
- ✅ **Isolation complète** : Pas de conflit avec d'autres applications
- ✅ **Portabilité** : Déploiement identique sur n'importe quel serveur
- ✅ **Facilité** : Un seul script pour tout installer
- ✅ **Sécurité** : Conteneur avec utilisateur non-root
- ✅ **Monitoring** : Healthcheck et logs centralisés

---

## 📋 PRÉREQUIS

### 1. Installer Docker

```bash
# Sur Ubuntu/Debian
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# Vérifier l'installation
docker --version
```

### 2. Installer Docker Compose

```bash
# Sur Ubuntu/Debian
sudo apt-get update
sudo apt-get install docker-compose -y

# Vérifier l'installation
docker-compose --version
```

### 3. Configurer le fichier .env

Le fichier `.env` doit être configuré avec vos identifiants :

```env
GROWCRM_BASE_URL=https://app.ty-dev.fr/api/v1
AUTH_MODE=token
GROWCRM_API_TOKEN=1|votre_token_ici
```

---

## 🚀 DÉPLOIEMENT AUTOMATIQUE (RECOMMANDÉ)

### Option 1 : Script automatique (le plus simple)

```bash
cd /www/wwwroot/app-tydev/GROWCRM/growcrm-mcp-server
./docker-deploy.sh
```

Ce script va :
1. ✅ Vérifier Docker et Docker Compose
2. ✅ Vérifier la configuration .env
3. ✅ Arrêter les conteneurs existants
4. ✅ Construire l'image Docker
5. ✅ Démarrer le conteneur
6. ✅ Valider le déploiement

---

## 🔧 DÉPLOIEMENT MANUEL

### Étape 1 : Construire l'image

```bash
cd /www/wwwroot/app-tydev/GROWCRM/growcrm-mcp-server
docker-compose build
```

### Étape 2 : Démarrer le conteneur

```bash
docker-compose up -d
```

### Étape 3 : Vérifier le statut

```bash
docker-compose ps
docker-compose logs -f growcrm-mcp
```

---

## 📊 COMMANDES DOCKER UTILES

### Gestion du conteneur

```bash
# Démarrer
docker-compose up -d

# Arrêter
docker-compose down

# Redémarrer
docker-compose restart growcrm-mcp

# Voir les logs en temps réel
docker-compose logs -f growcrm-mcp

# Voir les 100 dernières lignes de logs
docker-compose logs --tail=100 growcrm-mcp

# Voir le statut
docker-compose ps

# Statistiques de ressources
docker stats growcrm-mcp-server
```

### Accès au conteneur

```bash
# Ouvrir un shell dans le conteneur
docker-compose exec growcrm-mcp sh

# Exécuter une commande dans le conteneur
docker-compose exec growcrm-mcp node -v

# Inspecter le conteneur
docker inspect growcrm-mcp-server
```

### Maintenance

```bash
# Reconstruire l'image (après modification du code)
docker-compose up -d --build

# Reconstruire complètement (nettoyer le cache)
docker-compose build --no-cache
docker-compose up -d --force-recreate

# Nettoyer les images inutilisées
docker image prune -a

# Nettoyer tout (attention !)
docker system prune -a --volumes
```

---

## 🔌 INTÉGRATION AVEC CLAUDE DESKTOP

### Configuration pour conteneur Docker

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

### Alternative : Utiliser docker-compose

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

## 📈 MONITORING ET LOGS

### Voir les logs

```bash
# Logs en temps réel
docker-compose logs -f growcrm-mcp

# Logs avec horodatage
docker-compose logs -f -t growcrm-mcp

# Filtrer les erreurs
docker-compose logs growcrm-mcp | grep -i error

# Sauvegarder les logs
docker-compose logs growcrm-mcp > logs_$(date +%Y%m%d_%H%M%S).txt
```

### Healthcheck

Le conteneur a un healthcheck automatique toutes les 30 secondes :

```bash
# Voir le statut de santé
docker inspect growcrm-mcp-server --format='{{.State.Health.Status}}'

# Historique des healthchecks
docker inspect growcrm-mcp-server --format='{{json .State.Health}}' | jq
```

### Ressources utilisées

```bash
# En temps réel
docker stats growcrm-mcp-server

# Snapshot
docker stats --no-stream growcrm-mcp-server
```

---

## 🛡️ SÉCURITÉ

### Bonnes pratiques appliquées

1. ✅ **Image Alpine Linux** : Image minimale (5 MB vs 1 GB)
2. ✅ **Utilisateur non-root** : Le processus tourne sous `mcpuser`
3. ✅ **Secrets via .env** : Pas de credentials en dur
4. ✅ **Limites de ressources** : CPU et RAM limités
5. ✅ **Healthcheck** : Détection automatique des problèmes
6. ✅ **Logs rotatifs** : Max 3 fichiers de 10 MB

### Vérifier la sécurité

```bash
# Vérifier l'utilisateur du processus
docker-compose exec growcrm-mcp whoami
# Devrait afficher : mcpuser

# Vérifier les ports exposés
docker port growcrm-mcp-server
# Devrait être vide (pas de port exposé)

# Scanner les vulnérabilités
docker scan growcrm-mcp-server
```

---

## 🔄 MISE À JOUR

### Mettre à jour le serveur MCP

```bash
# 1. Sauvegarder le .env
cp .env .env.backup

# 2. Arrêter le conteneur
docker-compose down

# 3. Récupérer les dernières modifications
git pull  # Si vous utilisez Git

# 4. Reconstruire et redémarrer
docker-compose up -d --build

# 5. Vérifier les logs
docker-compose logs -f growcrm-mcp
```

---

## 🐛 DÉPANNAGE

### Le conteneur ne démarre pas

```bash
# Voir les logs détaillés
docker-compose logs growcrm-mcp

# Vérifier la configuration
docker-compose config

# Reconstruire sans cache
docker-compose build --no-cache
docker-compose up -d
```

### Erreur "Token invalide"

```bash
# Régénérer un token
./generate-token.sh

# Mettre à jour .env avec le nouveau token

# Redémarrer le conteneur
docker-compose restart growcrm-mcp
```

### Erreur "Cannot connect to API"

```bash
# Vérifier que l'URL est correcte dans .env
cat .env | grep GROWCRM_BASE_URL

# Tester la connexion depuis le conteneur
docker-compose exec growcrm-mcp wget -O- https://app.ty-dev.fr/api/v1/dashboard/stats
```

### Le conteneur consomme trop de ressources

```bash
# Voir la consommation actuelle
docker stats growcrm-mcp-server

# Modifier les limites dans docker-compose.yml
# Puis redémarrer
docker-compose up -d --force-recreate
```

---

## 📦 STRUCTURE DES FICHIERS DOCKER

```
growcrm-mcp-server/
├── Dockerfile              # Image Docker
├── docker-compose.yml      # Orchestration
├── .dockerignore          # Fichiers exclus du build
├── docker-deploy.sh       # Script de déploiement automatique
├── DOCKER_GUIDE.md        # Ce guide
├── .env                   # Configuration (à créer)
├── index.js              # Code du serveur MCP
└── package.json          # Dépendances Node.js
```

---

## 🎯 PRODUCTION

### Recommandations pour la production

1. **Utiliser Docker Swarm ou Kubernetes** pour la haute disponibilité
2. **Configurer un reverse proxy** (Traefik, Nginx) si HTTP
3. **Mettre en place des backups** automatiques de .env
4. **Activer le monitoring** (Prometheus + Grafana)
5. **Configurer des alertes** (en cas de crash)

### Exemple avec Traefik (HTTP futur)

```yaml
services:
  growcrm-mcp:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.growcrm-mcp.rule=Host(`mcp.example.com`)"
      - "traefik.http.services.growcrm-mcp.loadbalancer.server.port=3200"
```

---

## ✅ CHECKLIST DE DÉPLOIEMENT

Avant de déployer en production :

- [ ] Docker et Docker Compose installés
- [ ] Fichier .env configuré avec le bon token
- [ ] Token Sanctum généré et valide
- [ ] API REST Laravel fonctionnelle
- [ ] Tests passés (npm test ou test-final.cjs)
- [ ] Logs visibles (docker-compose logs)
- [ ] Healthcheck actif (docker inspect)
- [ ] Ressources limitées (CPU/RAM)
- [ ] Backup du .env effectué
- [ ] Documentation lue

---

## 🎉 SUCCÈS !

Votre serveur MCP GROWCRM tourne maintenant dans Docker ! 🐳

**Commande de démarrage rapide** :
```bash
./docker-deploy.sh
```

**Vérifier que tout fonctionne** :
```bash
docker-compose ps
docker-compose logs -f growcrm-mcp
```

**Pour plus d'aide** : Consultez README.md et STATUS.md
