# 🚀 Accès au MCP GROWCRM SANS SSH

## 📋 3 Méthodes Principales

---

## 1️⃣ Docker Local (Le Plus Simple)

### ✅ Prérequis
- Claude Desktop installé **SUR LE MÊME SERVEUR** (62.169.27.8)
- Docker en cours d'exécution
- Container `growcrm-mcp-server` actif

### 📝 Configuration Claude Desktop

**Fichier:** `~/.config/Claude/claude_desktop_config.json` (Linux)

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
      ],
      "env": {}
    }
  }
}
```

### ✅ Avantages
- ✅ Pas de SSH nécessaire
- ✅ Isolation complète (Docker)
- ✅ Facile à gérer
- ✅ Redémarrage automatique

### 🧪 Tester
```bash
# Vérifier que le container tourne
docker ps | grep growcrm-mcp-server

# Tester manuellement
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | \
  docker exec -i growcrm-mcp-server node index.js
```

---

## 2️⃣ Node.js Direct (Sans Docker)

### ✅ Prérequis
- Claude Desktop installé **SUR LE MÊME SERVEUR** (62.169.27.8)
- Node.js installé (v20+)
- Dépendances installées (`npm install`)

### 📝 Configuration Claude Desktop

**Fichier:** `~/.config/Claude/claude_desktop_config.json` (Linux)

```json
{
  "mcpServers": {
    "growcrm": {
      "command": "node",
      "args": [
        "/www/wwwroot/app-tydev/GROWCRM/growcrm-mcp-server/index.js"
      ],
      "env": {
        "DEBUG": "false"
      }
    }
  }
}
```

### ✅ Avantages
- ✅ Pas de Docker nécessaire
- ✅ Consommation minimale (5-10 MB RAM)
- ✅ Démarrage rapide
- ✅ Facile à déboguer

### 🧪 Tester
```bash
# Vérifier Node.js
node --version  # Doit être v20+

# Tester manuellement
cd /www/wwwroot/app-tydev/GROWCRM/growcrm-mcp-server
node index.js
# Tapez : {"jsonrpc":"2.0","id":1,"method":"tools/list"}
# Puis Ctrl+C
```

---

## 3️⃣ HTTP/REST API (Accès Distant Sans SSH)

### ✅ Prérequis
- Claude Desktop installé **SUR UN AUTRE ORDINATEUR**
- Serveur HTTP actif sur 62.169.27.8
- Port 3000 ouvert dans le pare-feu

### 📝 Étape 1 : Démarrer le Serveur HTTP

**Sur le serveur (62.169.27.8) :**

```bash
cd /www/wwwroot/app-tydev/GROWCRM/growcrm-mcp-server

# Installer PM2 (gestionnaire de processus)
npm install -g pm2

# Démarrer le serveur HTTP
pm2 start index-http.js --name growcrm-mcp-http

# Configurer le démarrage auto
pm2 save
pm2 startup

# Vérifier le statut
pm2 status
pm2 logs growcrm-mcp-http
```

### 📝 Étape 2 : Ouvrir le Port 3000

```bash
# Sur le serveur, vérifier le pare-feu
sudo ufw status

# Si UFW est actif, ouvrir le port
sudo ufw allow 3000/tcp

# Vérifier que le serveur écoute
netstat -tlnp | grep 3000
# Ou
ss -tlnp | grep 3000
```

### 📝 Étape 3 : Configuration Claude Desktop (Client)

**Sur votre ordinateur local :**

Créer un script proxy `mcp-proxy.js` :

```javascript
#!/usr/bin/env node

const http = require('http');
const readline = require('readline');

const SERVER_URL = 'http://62.169.27.8:3000';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', (line) => {
  const request = JSON.parse(line);
  
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  };

  const req = http.request(SERVER_URL, options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log(data);
    });
  });

  req.write(JSON.stringify(request));
  req.end();
});
```

**Configuration Claude Desktop :**

```json
{
  "mcpServers": {
    "growcrm": {
      "command": "node",
      "args": [
        "/path/to/mcp-proxy.js"
      ],
      "env": {}
    }
  }
}
```

### ✅ Avantages
- ✅ Accès depuis n'importe où (pas de SSH)
- ✅ Peut être sécurisé avec HTTPS/tokens
- ✅ Scalable (load balancer possible)
- ✅ Compatible avec WebHooks

### 🧪 Tester

```bash
# Depuis votre ordinateur local
curl -X POST http://62.169.27.8:3000 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

---

## 🆚 Comparaison des Méthodes

| Critère | Docker Local | Node Direct | HTTP/REST |
|---------|--------------|-------------|-----------|
| **SSH requis** | ❌ Non | ❌ Non | ❌ Non |
| **Accès distant** | ❌ Non | ❌ Non | ✅ Oui |
| **RAM utilisée** | 15 MB | 5-10 MB | 10-15 MB |
| **Sécurité** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Complexité** | ⭐ Facile | ⭐ Facile | ⭐⭐⭐ Moyenne |
| **Performance** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Recommandé pour** | Local, Production | Local, Dev | Distant, Multi-client |

---

## 🎯 Recommandation par Cas d'Usage

### 💼 Cas 1 : Claude Desktop sur le serveur (62.169.27.8)

**👉 Utilisez la Méthode 1 (Docker Local)**

```json
{
  "mcpServers": {
    "growcrm": {
      "command": "docker",
      "args": ["exec", "-i", "growcrm-mcp-server", "node", "index.js"]
    }
  }
}
```

### 💻 Cas 2 : Claude Desktop sur le serveur, pas de Docker

**👉 Utilisez la Méthode 2 (Node Direct)**

```json
{
  "mcpServers": {
    "growcrm": {
      "command": "node",
      "args": ["/www/wwwroot/app-tydev/GROWCRM/growcrm-mcp-server/index.js"]
    }
  }
}
```

### 🌍 Cas 3 : Claude Desktop sur un autre ordinateur, pas de SSH

**👉 Utilisez la Méthode 3 (HTTP/REST)**

1. Sur le serveur : `pm2 start index-http.js`
2. Sur le client : Utilisez le proxy HTTP

### 🔒 Cas 4 : Accès sécurisé distant (recommandé)

**👉 Utilisez SSH** (même si vous voulez éviter SSH, c'est la méthode la plus sécurisée)

```json
{
  "mcpServers": {
    "growcrm": {
      "command": "ssh",
      "args": ["root@62.169.27.8", "-p", "3200", "docker exec -i growcrm-mcp-server node index.js"]
    }
  }
}
```

---

## 🛠️ Scripts Utiles

### Script de Test Complet

```bash
#!/bin/bash
# test-access.sh - Tester les 3 méthodes

echo "🧪 Test des méthodes d'accès MCP"
echo "================================="
echo ""

# Test 1: Docker Local
echo "1️⃣ Test Docker Local..."
if docker ps | grep -q growcrm-mcp-server; then
  echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | \
    docker exec -i growcrm-mcp-server node index.js | grep -q list_clients
  if [ $? -eq 0 ]; then
    echo "   ✅ Docker Local fonctionne"
  else
    echo "   ❌ Docker Local échoue"
  fi
else
  echo "   ⚠️  Container non trouvé"
fi
echo ""

# Test 2: Node Direct
echo "2️⃣ Test Node Direct..."
if command -v node &> /dev/null; then
  cd /www/wwwroot/app-tydev/GROWCRM/growcrm-mcp-server
  echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | \
    timeout 5 node index.js | grep -q list_clients
  if [ $? -eq 0 ]; then
    echo "   ✅ Node Direct fonctionne"
  else
    echo "   ❌ Node Direct échoue"
  fi
else
  echo "   ⚠️  Node.js non installé"
fi
echo ""

# Test 3: HTTP
echo "3️⃣ Test HTTP..."
if pm2 list | grep -q growcrm-mcp-http; then
  curl -s -X POST http://localhost:3000 \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | grep -q list_clients
  if [ $? -eq 0 ]; then
    echo "   ✅ HTTP fonctionne"
  else
    echo "   ❌ HTTP échoue"
  fi
else
  echo "   ⚠️  Serveur HTTP non démarré"
fi
echo ""

echo "================================="
echo "Tests terminés !"
```

### Script de Démarrage Automatique

```bash
#!/bin/bash
# start-mcp.sh - Démarrer le MCP automatiquement

MODE=${1:-docker}  # docker, node, ou http

case $MODE in
  docker)
    echo "🐳 Démarrage via Docker..."
    docker start growcrm-mcp-server
    docker ps | grep growcrm-mcp-server
    ;;
    
  node)
    echo "📦 Démarrage via Node.js..."
    cd /www/wwwroot/app-tydev/GROWCRM/growcrm-mcp-server
    pm2 start index.js --name growcrm-mcp-node
    pm2 save
    ;;
    
  http)
    echo "🌐 Démarrage via HTTP..."
    cd /www/wwwroot/app-tydev/GROWCRM/growcrm-mcp-server
    pm2 start index-http.js --name growcrm-mcp-http
    pm2 save
    ;;
    
  *)
    echo "Usage: $0 [docker|node|http]"
    exit 1
    ;;
esac
```

Usage :
```bash
chmod +x start-mcp.sh test-access.sh

# Démarrer en mode Docker
./start-mcp.sh docker

# Démarrer en mode Node
./start-mcp.sh node

# Démarrer en mode HTTP
./start-mcp.sh http

# Tester tous les modes
./test-access.sh
```

---

## ❓ FAQ

### Q: Quelle méthode consomme le moins de ressources ?

**R:** Node Direct (5-10 MB) < Docker Local (15 MB) < HTTP (10-15 MB)

### Q: Quelle méthode est la plus sécurisée ?

**R:** Docker Local (isolation complète) > Node Direct > HTTP > SSH

### Q: Puis-je utiliser plusieurs méthodes en même temps ?

**R:** Oui ! Vous pouvez avoir Docker + HTTP simultanément :
```bash
# Docker pour accès local
docker start growcrm-mcp-server

# HTTP pour accès distant
pm2 start index-http.js --name growcrm-mcp-http
```

### Q: Comment choisir entre Docker et Node Direct ?

**R:** 
- **Docker** : Si vous voulez isolation, sécurité, facilité de gestion
- **Node** : Si vous voulez performance maximale, débogage facile

### Q: Le mode HTTP est-il sécurisé ?

**R:** Par défaut non. Pour le sécuriser :
1. Utilisez HTTPS (certificat SSL)
2. Ajoutez un token d'authentification
3. Utilisez un reverse proxy (Nginx)
4. Limitez les IPs autorisées (firewall)

---

## 📚 Ressources

- **Guide principal** : `GUIDE_UTILISATION_AI.md`
- **Guide Docker** : `DOCKER_GUIDE.md`
- **Gestion conteneurs** : `GESTION_CONTENEURS.md`
- **Démarrage rapide** : `QUICKSTART.md`

---

**Créé le** : 5 novembre 2025  
**Serveur** : 62.169.27.8:3200  
**Version** : 1.0.0
