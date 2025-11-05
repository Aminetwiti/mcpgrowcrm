# 🐳 Gestion des Conteneurs Docker GROWCRM MCP

## 📋 État Actuel

### ✅ Conteneur Actif (À CONSERVER)

```
Nom:     growcrm-mcp-server
ID:      a1b1693737b4
Status:  En cours d'exécution (healthy)
Image:   growcrm-mcp-server_growcrm-mcp:latest
IP:      172.20.0.2
Réseau:  growcrm-mcp-network
Créé:    2025-11-05 11:56:34
```

**Ce conteneur fonctionne correctement et doit rester actif.**

### ❌ Conteneur Problématique (SUPPRIMÉ)

```
Nom:     mcp-growcrm
ID:      a9b80b236c6c
Status:  Interrompu (boucle de redémarrage)
Image:   growcrm-mcp-server_growcrm-mcp:latest
```

**Ce conteneur était en boucle de redémarrage et a été supprimé.**

---

## 🎯 Commandes de Gestion

### 1️⃣ Vérifier l'état des conteneurs

```bash
# Liste tous les conteneurs GROWCRM
docker ps -a --filter "name=growcrm" --filter "name=mcp-growcrm"

# Format lisible
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

### 2️⃣ Vérifier la santé du conteneur actif

```bash
# Statut de santé
docker inspect growcrm-mcp-server | grep -A 10 Health

# Logs en temps réel
docker logs -f growcrm-mcp-server

# Dernières 50 lignes
docker logs --tail 50 growcrm-mcp-server
```

### 3️⃣ Utilisation des ressources

```bash
# Statistiques en temps réel
docker stats growcrm-mcp-server

# Utilisation mémoire/CPU
docker stats growcrm-mcp-server --no-stream
```

### 4️⃣ Redémarrer le conteneur

```bash
# Redémarrage simple
docker restart growcrm-mcp-server

# Redémarrage avec reconstruction
cd /www/wwwroot/app-tydev/GROWCRM/growcrm-mcp-server
docker-compose down
docker-compose up -d --build
```

### 5️⃣ Accéder au terminal du conteneur

```bash
# Shell interactif
docker exec -it growcrm-mcp-server sh

# Exécuter une commande
docker exec growcrm-mcp-server node --version
docker exec growcrm-mcp-server ps aux
```

### 6️⃣ Tester le serveur MCP

```bash
# Lister les outils disponibles
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | \
  docker exec -i growcrm-mcp-server node index.js

# Tester un outil spécifique
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"list_clients","arguments":{"page":1,"perPage":5}}}' | \
  docker exec -i growcrm-mcp-server node index.js
```

---

## 🔧 Résolution de Problèmes

### ❌ Conteneur en boucle de redémarrage

**Symptômes:**
- Status: `Restarting (0) XX seconds ago`
- Logs montrent des erreurs répétées

**Solutions:**

1. **Vérifier les logs**
   ```bash
   docker logs --tail 100 mcp-growcrm
   ```

2. **Arrêter et supprimer**
   ```bash
   docker stop mcp-growcrm
   docker rm mcp-growcrm
   ```

3. **Vérifier la configuration**
   ```bash
   cat docker-compose.yml
   ```

### ❌ Plusieurs conteneurs en conflit

**Symptômes:**
- 2+ conteneurs avec des noms similaires
- Ports en conflit
- Comportement imprévisible

**Solutions:**

1. **Lister tous les conteneurs**
   ```bash
   docker ps -a | grep -E "growcrm|mcp"
   ```

2. **Supprimer les doublons**
   ```bash
   # Arrêter tous les conteneurs GROWCRM
   docker ps -a --filter "name=growcrm" --filter "name=mcp" --format "{{.Names}}" | \
     xargs -I {} docker stop {}
   
   # Supprimer tous sauf le bon
   docker rm mcp-growcrm
   docker rm mcp-growcrm-old
   # etc.
   ```

3. **Recréer le conteneur correct**
   ```bash
   cd /www/wwwroot/app-tydev/GROWCRM/growcrm-mcp-server
   docker-compose up -d
   ```

### ❌ Conteneur "unhealthy"

**Symptômes:**
- Status: `Up XX minutes (unhealthy)`
- Healthcheck échoue

**Solutions:**

1. **Vérifier le healthcheck**
   ```bash
   docker inspect growcrm-mcp-server | grep -A 20 Healthcheck
   ```

2. **Tester manuellement le healthcheck**
   ```bash
   docker exec growcrm-mcp-server node --version
   ```

3. **Redémarrer le conteneur**
   ```bash
   docker restart growcrm-mcp-server
   ```

4. **Si ça persiste, reconstruire**
   ```bash
   cd /www/wwwroot/app-tydev/GROWCRM/growcrm-mcp-server
   docker-compose down
   docker-compose up -d --build
   ```

### ❌ Conteneur ne démarre pas

**Symptômes:**
- Status: `Exited (1) XX seconds ago`
- Conteneur s'arrête immédiatement

**Solutions:**

1. **Vérifier les logs**
   ```bash
   docker logs growcrm-mcp-server
   ```

2. **Vérifier les fichiers**
   ```bash
   ls -la /www/wwwroot/app-tydev/GROWCRM/growcrm-mcp-server/
   ```

3. **Vérifier le .env**
   ```bash
   cat /www/wwwroot/app-tydev/GROWCRM/growcrm-mcp-server/.env
   ```

4. **Reconstruire l'image**
   ```bash
   cd /www/wwwroot/app-tydev/GROWCRM/growcrm-mcp-server
   docker-compose build --no-cache
   docker-compose up -d
   ```

---

## 🧹 Nettoyage et Maintenance

### Supprimer les conteneurs arrêtés

```bash
# Supprimer tous les conteneurs arrêtés
docker container prune -f

# Supprimer les images non utilisées
docker image prune -a -f

# Supprimer les volumes non utilisés
docker volume prune -f

# Nettoyage complet
docker system prune -a --volumes -f
```

### Sauvegarder l'image

```bash
# Exporter l'image
docker save growcrm-mcp-server_growcrm-mcp:latest | gzip > growcrm-mcp-backup.tar.gz

# Restaurer l'image
gunzip -c growcrm-mcp-backup.tar.gz | docker load
```

### Mettre à jour le conteneur

```bash
cd /www/wwwroot/app-tydev/GROWCRM/growcrm-mcp-server

# Arrêter le conteneur
docker-compose down

# Mettre à jour le code (si nécessaire)
git pull  # ou copier les nouveaux fichiers

# Reconstruire et redémarrer
docker-compose build --no-cache
docker-compose up -d

# Vérifier
docker ps
docker logs -f growcrm-mcp-server
```

---

## 📊 Monitoring

### Dashboard de santé

```bash
#!/bin/bash
# Créer un script de monitoring

cat > /www/wwwroot/app-tydev/GROWCRM/growcrm-mcp-server/monitor.sh << 'EOF'
#!/bin/bash

echo "🐳 GROWCRM MCP Server - Health Check"
echo "======================================"
echo ""

# Statut du conteneur
echo "📦 Conteneur:"
docker ps --filter "name=growcrm-mcp-server" --format "  Status: {{.Status}}"
echo ""

# Santé
echo "💚 Santé:"
HEALTH=$(docker inspect growcrm-mcp-server --format='{{.State.Health.Status}}' 2>/dev/null)
echo "  Health: $HEALTH"
echo ""

# Ressources
echo "📊 Ressources:"
docker stats growcrm-mcp-server --no-stream --format "  CPU: {{.CPUPerc}}\n  MEM: {{.MemUsage}}"
echo ""

# Réseau
echo "🌐 Réseau:"
docker inspect growcrm-mcp-server --format='  IP: {{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}'
echo ""

# Uptime
echo "⏱️  Uptime:"
docker ps --filter "name=growcrm-mcp-server" --format "  {{.Status}}"
echo ""

# Test MCP
echo "🔧 Test MCP:"
TEST_OUTPUT=$(echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | docker exec -i growcrm-mcp-server node index.js 2>&1)
if echo "$TEST_OUTPUT" | grep -q "list_clients"; then
  echo "  ✅ MCP répond correctement"
else
  echo "  ❌ MCP ne répond pas"
fi
echo ""

echo "======================================"
EOF

chmod +x /www/wwwroot/app-tydev/GROWCRM/growcrm-mcp-server/monitor.sh
```

### Exécuter le monitoring

```bash
# Lancer le monitoring
/www/wwwroot/app-tydev/GROWCRM/growcrm-mcp-server/monitor.sh

# Monitoring continu (toutes les 10 secondes)
watch -n 10 /www/wwwroot/app-tydev/GROWCRM/growcrm-mcp-server/monitor.sh
```

---

## 🚀 Bonnes Pratiques

### 1. Toujours utiliser Docker Compose

```bash
# ✅ BIEN
cd /www/wwwroot/app-tydev/GROWCRM/growcrm-mcp-server
docker-compose up -d

# ❌ ÉVITER
docker run -d --name mcp-growcrm ...
```

### 2. Nommer les conteneurs de manière cohérente

Le nom du conteneur est défini dans `docker-compose.yml` :

```yaml
services:
  growcrm-mcp:
    container_name: growcrm-mcp-server  # ✅ Nom cohérent
```

### 3. Un seul conteneur à la fois

```bash
# Vérifier avant de créer
docker ps -a --filter "name=growcrm"

# Si des doublons existent, les supprimer
docker stop $(docker ps -a --filter "name=growcrm" --format "{{.Names}}")
docker rm $(docker ps -a --filter "name=growcrm" --format "{{.Names}}")

# Puis recréer proprement
docker-compose up -d
```

### 4. Vérifier les logs régulièrement

```bash
# Ajouter dans crontab
0 * * * * docker logs --tail 100 growcrm-mcp-server > /var/log/growcrm-mcp.log 2>&1
```

### 5. Sauvegardes régulières

```bash
# Script de sauvegarde automatique
cat > /www/wwwroot/app-tydev/GROWCRM/growcrm-mcp-server/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker save growcrm-mcp-server_growcrm-mcp:latest | \
  gzip > /backups/growcrm-mcp-$DATE.tar.gz
find /backups -name "growcrm-mcp-*.tar.gz" -mtime +30 -delete
EOF

chmod +x /www/wwwroot/app-tydev/GROWCRM/growcrm-mcp-server/backup.sh
```

---

## 📝 Résumé de la Configuration Actuelle

### Conteneur Actif

| Paramètre | Valeur |
|-----------|--------|
| **Nom** | `growcrm-mcp-server` |
| **Image** | `growcrm-mcp-server_growcrm-mcp:latest` |
| **Réseau** | `growcrm-mcp-network` (172.20.0.2) |
| **Ressources** | CPU: 1.0, RAM: 512MB |
| **Santé** | Healthy ✅ |
| **Uptime** | Depuis 2025-11-05 11:56:34 |

### Commandes Rapides

```bash
# Status
docker ps --filter "name=growcrm-mcp-server"

# Logs
docker logs -f growcrm-mcp-server

# Stats
docker stats growcrm-mcp-server --no-stream

# Test
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | \
  docker exec -i growcrm-mcp-server node index.js

# Redémarrer
docker restart growcrm-mcp-server
```

---

## 🎯 Pour Utiliser avec Claude Desktop

Ajoutez cette configuration dans votre `claude_desktop_config.json` :

```json
{
  "mcpServers": {
    "growcrm": {
      "command": "ssh",
      "args": [
        "root@vmi2743594.contaboserver.net",
        "docker exec -i growcrm-mcp-server node /app/index.js"
      ],
      "env": {}
    }
  }
}
```

Ou si vous êtes sur le serveur directement :

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
        "/app/index.js"
      ],
      "env": {}
    }
  }
}
```

---

**Créé le:** 5 novembre 2025  
**Version:** 1.0.0  
**Conteneur actif:** `growcrm-mcp-server` (a1b1693737b4)
