# 🤖 Guide d'Utilisation du MCP GROWCRM avec les Outils AI

## 📚 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [1. Claude Desktop (Desktop App)](#1-claude-desktop-desktop-app)
- [2. ChatGPT avec Custom GPTs](#2-chatgpt-avec-custom-gpts)
- [3. Cline (VS Code Extension)](#3-cline-vs-code-extension)
- [4. Continue.dev (VS Code Extension)](#4-continuedev-vs-code-extension)
- [5. Autres Clients MCP](#5-autres-clients-mcp)
- [Commandes Utiles](#commandes-utiles)
- [Dépannage](#dépannage)

---

## Vue d'ensemble

Votre serveur MCP GROWCRM est maintenant **déployé et opérationnel** avec :
- ✅ **38 outils MCP** pour gérer votre CRM
- ✅ **Docker container** en cours d'exécution (`growcrm-mcp-server`)
- ✅ **API REST Laravel** sécurisée avec Sanctum
- ✅ **Token d'authentification** configuré

**URL API:** `https://app.ty-dev.fr/api/v1`  
**Token:** `1|ewMkTeTioHy523VhvcN7T8VM7qrQqzCBqMHlSUR7a9ae25dd`

---

## 1. Claude Desktop (Desktop App)

### 🎯 Installation

1. **Télécharger Claude Desktop**
   ```bash
   # macOS
   https://claude.ai/download
   
   # Windows
   https://claude.ai/download
   
   # Linux
   https://claude.ai/download
   ```

2. **Trouver le fichier de configuration**

   **macOS:**
   ```bash
   ~/Library/Application Support/Claude/claude_desktop_config.json
   ```

   **Linux:**
   ```bash
   ~/.config/Claude/claude_desktop_config.json
   ```

   **Windows:**
   ```
   %APPDATA%\Claude\claude_desktop_config.json
   ```

3. **Configurer le MCP**

   **Option A: Via Docker Local (🚀 RECOMMANDÉ - Sans SSH)**
   
   Si Claude Desktop est sur le **MÊME serveur** (62.169.27.8) :
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

   **Option B: Via Node.js Local (Sans Docker, Sans SSH)**
   
   Si Claude Desktop est sur le **MÊME serveur** :
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

   **Option C: Via npx/stdio (Alternative sans Docker)**
   ```json
   {
     "mcpServers": {
       "growcrm": {
         "command": "npx",
         "args": [
           "-y",
           "@modelcontextprotocol/server-stdio",
           "node",
           "/www/wwwroot/app-tydev/GROWCRM/growcrm-mcp-server/index.js"
         ],
         "env": {}
       }
     }
   }
   ```

   **Option D: Via HTTP/WebSocket (Sans SSH, accès distant)**
   
   Si vous voulez accéder **depuis un autre ordinateur SANS SSH** :
   
   1. D'abord, démarrez le serveur HTTP sur le serveur :
   ```bash
   cd /www/wwwroot/app-tydev/GROWCRM/growcrm-mcp-server
   node index-http.js
   ```
   
   2. Puis configurez Claude avec un proxy WebSocket :
   ```json
   {
     "mcpServers": {
       "growcrm": {
         "command": "npx",
         "args": [
           "mcp-client-cli",
           "http://62.169.27.8:3000/mcp"
         ],
         "env": {}
       }
     }
   }
   ```

   **Option E: Via SSH (Si vous êtes sur un autre ordinateur)**
   ```json
   {
     "mcpServers": {
       "growcrm": {
         "command": "ssh",
         "args": [
           "root@62.169.27.8",
           "-p", "3200",
           "docker exec -i growcrm-mcp-server node index.js"
         ],
         "env": {}
       }
     }
   }
   ```

4. **Redémarrer Claude Desktop**

5. **Vérifier la connexion**
   - Ouvrez Claude Desktop
   - Tapez : "Liste-moi les 5 derniers clients de GROWCRM"
   - Claude devrait utiliser l'outil `list_clients`

### 🎯 Quelle Option Choisir ?

| Situation | Option Recommandée | Commande |
|-----------|-------------------|----------|
| Claude Desktop **sur le serveur** | Option A (Docker Local) | `docker exec -i ...` |
| Claude Desktop **sur le serveur** sans Docker | Option B (Node Local) | `node index.js` |
| Accès **distant sans SSH** | Option D (HTTP) | Démarrer `index-http.js` |
| Accès **distant avec SSH** | Option E (SSH) | `ssh ... docker exec` |

### 🔧 Configuration Avancée

**Pour accès local sans SSH :**

1. **Vérifier que Docker fonctionne localement**
   ```bash
   docker ps | grep growcrm-mcp-server
   # Si OK, utilisez Option A
   ```

2. **Si pas Docker, utiliser Node.js directement**
   ```bash
   # Tester que ça fonctionne
   cd /www/wwwroot/app-tydev/GROWCRM/growcrm-mcp-server
   node index.js
   # Puis Ctrl+C
   
   # Utilisez Option B dans Claude config
   ```

3. **Pour accès HTTP distant (sans SSH)**
   ```bash
   # Sur le serveur, installer PM2
   npm install -g pm2
   
   # Démarrer le serveur HTTP en background
   cd /www/wwwroot/app-tydev/GROWCRM/growcrm-mcp-server
   pm2 start index-http.js --name growcrm-mcp-http
   pm2 save
   pm2 startup
   
   # Le serveur est maintenant accessible sur http://62.169.27.8:3000
   ```

**Configuration SSH (Si nécessaire - Option E) :**

```bash
# Sur votre machine locale
ssh-keygen -t rsa -b 4096
ssh-copy-id -p 3200 root@62.169.27.8

# Tester la connexion
ssh -p 3200 root@62.169.27.8 "echo 'Connexion OK'"

# Ajouter dans ~/.ssh/config pour simplifier
cat >> ~/.ssh/config << 'EOF'
Host growcrm-server
    HostName 62.169.27.8
    Port 3200
    User root
    ServerAliveInterval 60
    ServerAliveCountMax 3
EOF

# Puis utiliser simplement : ssh growcrm-server
```

---

## 2. ChatGPT avec Custom GPTs

### 🎯 Méthode 1: Via API Gateway (Recommandé)

ChatGPT ne supporte pas directement le protocole MCP stdio. Vous devez exposer une API HTTP.

1. **Utiliser la version HTTP du MCP**
   ```bash
   cd /www/wwwroot/app-tydev/GROWCRM/growcrm-mcp-server
   node index-http.js
   ```

2. **Créer un Custom GPT**
   - Allez sur https://chat.openai.com/gpts/editor
   - Créez un nouveau GPT
   - Dans "Configure" → "Actions" → "Create new action"

3. **Importer le schéma OpenAPI**
   ```yaml
   openapi: 3.0.0
   info:
     title: GROWCRM MCP API
     version: 1.0.0
   servers:
     - url: https://app.ty-dev.fr:3000
   paths:
     /clients:
       get:
         summary: Liste des clients
         parameters:
           - name: page
             in: query
             schema:
               type: integer
           - name: perPage
             in: query
             schema:
               type: integer
     /clients/{id}:
       get:
         summary: Détails d'un client
         parameters:
           - name: id
             in: path
             required: true
             schema:
               type: string
     /projects:
       get:
         summary: Liste des projets
     /tasks:
       get:
         summary: Liste des tâches
   ```

4. **Configurer l'authentification**
   - Type: "API Key"
   - Header: "Authorization"
   - Valeur: "Bearer 1|ewMkTeTioHy523VhvcN7T8VM7qrQqzCBqMHlSUR7a9ae25dd"

### 🎯 Méthode 2: Via Zapier/Make.com

1. **Créer un Zap/Scenario**
   - Trigger: "Webhook" (pour recevoir les demandes de ChatGPT)
   - Action: "HTTP Request" vers `https://app.ty-dev.fr/api/v1`

2. **Utiliser dans ChatGPT**
   - Créez un Custom GPT
   - Ajoutez l'URL Zapier comme action

---

## 3. Cline (VS Code Extension)

### 🎯 Installation

1. **Installer Cline**
   ```bash
   # Dans VS Code
   Ctrl+Shift+X (ou Cmd+Shift+X sur Mac)
   Rechercher "Cline"
   Cliquer sur "Install"
   ```

2. **Configurer le MCP**
   ```bash
   # Créer le fichier de configuration
   mkdir -p ~/.config/cline
   nano ~/.config/cline/mcp_settings.json
   ```

3. **Ajouter la configuration**
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
         "description": "GROWCRM CRM Management"
       }
     }
   }
   ```

4. **Redémarrer VS Code**

5. **Utiliser Cline**
   - Ouvrez la palette de commandes (Ctrl+Shift+P)
   - Tapez "Cline: Chat"
   - Demandez : "Affiche-moi les projets en cours dans GROWCRM"

---

## 4. Continue.dev (VS Code Extension)

### 🎯 Installation

1. **Installer Continue**
   ```bash
   # Dans VS Code
   Ctrl+Shift+X (ou Cmd+Shift+X sur Mac)
   Rechercher "Continue"
   Cliquer sur "Install"
   ```

2. **Configurer le MCP**
   ```bash
   # Créer le fichier de configuration
   mkdir -p ~/.continue
   nano ~/.continue/config.json
   ```

3. **Ajouter la configuration**
   ```json
   {
     "models": [
       {
         "title": "Claude 3.5",
         "provider": "anthropic",
         "model": "claude-3-5-sonnet-20241022",
         "apiKey": "votre-api-key-anthropic"
       }
     ],
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

4. **Redémarrer VS Code**

5. **Utiliser Continue**
   - Appuyez sur Ctrl+L (ou Cmd+L sur Mac)
   - Demandez : "Liste les tickets ouverts dans GROWCRM"

---

## 5. Autres Clients MCP

### 🎯 n8n (Automation)

1. **Créer un workflow n8n**
2. **Ajouter un node "Execute Command"**
   ```bash
   docker exec -i growcrm-mcp-server node index.js
   ```
3. **Envoyer des requêtes JSON via stdin**

### 🎯 Langchain

```python
from langchain.tools import Tool
import subprocess
import json

def call_mcp_tool(tool_name, arguments):
    process = subprocess.Popen(
        ["docker", "exec", "-i", "growcrm-mcp-server", "node", "index.js"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        text=True
    )
    
    request = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "tools/call",
        "params": {
            "name": tool_name,
            "arguments": arguments
        }
    }
    
    stdout, _ = process.communicate(json.dumps(request))
    return json.loads(stdout)

# Créer un outil Langchain
growcrm_tool = Tool(
    name="GROWCRM",
    func=lambda x: call_mcp_tool("list_clients", {}),
    description="Accède au CRM GROWCRM"
)
```

### 🎯 AutoGen

```python
from autogen import AssistantAgent, UserProxyAgent
import subprocess
import json

def growcrm_function(tool_name, **kwargs):
    process = subprocess.Popen(
        ["docker", "exec", "-i", "growcrm-mcp-server", "node", "index.js"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        text=True
    )
    
    request = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "tools/call",
        "params": {
            "name": tool_name,
            "arguments": kwargs
        }
    }
    
    stdout, _ = process.communicate(json.dumps(request))
    return json.loads(stdout)

assistant = AssistantAgent(
    name="assistant",
    functions=[
        {
            "name": "list_clients",
            "description": "Liste les clients GROWCRM",
            "parameters": {
                "type": "object",
                "properties": {
                    "page": {"type": "integer"},
                    "perPage": {"type": "integer"}
                }
            }
        }
    ],
    function_map={
        "list_clients": lambda **kwargs: growcrm_function("list_clients", **kwargs)
    }
)
```

---

## Commandes Utiles

### 🔍 Vérifier le statut du serveur

```bash
# Vérifier que le container est en cours d'exécution
docker ps | grep growcrm-mcp-server

# Vérifier les logs
docker logs growcrm-mcp-server

# Vérifier la santé
docker inspect growcrm-mcp-server | grep -A 10 Health

# Tester manuellement
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | docker exec -i growcrm-mcp-server node index.js
```

### 🛠️ Redémarrer le serveur

```bash
# Redémarrer le container
docker restart growcrm-mcp-server

# Reconstruire et redémarrer
cd /www/wwwroot/app-tydev/GROWCRM/growcrm-mcp-server
docker-compose down
docker-compose up -d --build
```

### 📊 Monitoring

```bash
# Voir l'utilisation des ressources
docker stats growcrm-mcp-server

# Voir les processus actifs
docker exec growcrm-mcp-server ps aux

# Tester l'API GROWCRM
curl -H "Authorization: Bearer 1|ewMkTeTioHy523VhvcN7T8VM7qrQqzCBqMHlSUR7a9ae25dd" \
     https://app.ty-dev.fr/api/v1/clients
```

---

## Dépannage

### ❌ "Connection refused" dans Claude Desktop

**Solution:**
1. Vérifiez que le container est actif : `docker ps | grep growcrm-mcp-server`
2. Vérifiez les logs : `docker logs growcrm-mcp-server`
3. Testez manuellement : `echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | docker exec -i growcrm-mcp-server node index.js`

### ❌ "Authentication failed"

**Solution:**
1. Vérifiez le token dans `.env` : `cat /www/wwwroot/app-tydev/GROWCRM/growcrm-mcp-server/.env | grep SANCTUM_TOKEN`
2. Générez un nouveau token : `cd /www/wwwroot/app-tydev/GROWCRM/application && php artisan tinker` puis `User::first()->createToken('mcp-server')->plainTextToken`
3. Mettez à jour `.env` et redémarrez : `docker restart growcrm-mcp-server`

### ❌ "Tool not found"

**Solution:**
1. Listez les outils disponibles : `echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | docker exec -i growcrm-mcp-server node index.js`
2. Vérifiez l'orthographe du nom de l'outil
3. Consultez `PROJET_COMPLET.md` pour la liste complète des 38 outils

### ❌ Claude Desktop ne voit pas le serveur

**Solution:**
1. Vérifiez le chemin du fichier de config : `ls -la ~/Library/Application\ Support/Claude/` (macOS)
2. Vérifiez la syntaxe JSON : `cat ~/Library/Application\ Support/Claude/claude_desktop_config.json | jq .`
3. Redémarrez complètement Claude Desktop (Quit et relancer)
4. Vérifiez les logs Claude : `~/Library/Logs/Claude/` (macOS)

### ❌ SSH connection timeout

**Solution:**
1. Testez la connexion SSH : `ssh -p 3200 root@62.169.27.8 "echo 'OK'"`
2. Configurez la clé SSH : `ssh-copy-id -p 3200 root@62.169.27.8`
3. Augmentez le timeout SSH dans `~/.ssh/config` :
   ```
   Host growcrm-server
       HostName 62.169.27.8
       Port 3200
       User root
       ServerAliveInterval 60
       ServerAliveCountMax 3
       ConnectTimeout 30
   ```

---

## � Consommation de Ressources du MCP

### 📊 Ressources Utilisées

Le serveur MCP GROWCRM est **très léger** et optimisé :

| Ressource | Utilisation | Limite Configurée |
|-----------|-------------|-------------------|
| **RAM** | ~15 MB | 512 MB max |
| **CPU** | ~0.00% (idle) | 1.0 CPU max |
| **Disque** | ~50 MB | - |
| **Réseau** | Minimal (requêtes API) | - |

### 🔋 Impact sur le Serveur

**Lorsque le MCP est INACTIF (90% du temps):**
- RAM : ~15 MB (négligeable)
- CPU : 0% (processus en veille)
- Réseau : 0 Ko/s

**Lorsque le MCP est ACTIF (requête en cours):**
- RAM : ~20-30 MB (pic temporaire)
- CPU : 1-5% (traitement requête)
- Réseau : 10-100 Ko/s (appel API GROWCRM)
- Durée : 0.5-2 secondes par requête

### 🎯 Comparaison avec Autres Services

Sur votre serveur **62.169.27.8**, le MCP consomme **moins** que :
- ❌ MySQL : ~200-500 MB RAM
- ❌ PHP-FPM : ~100-300 MB RAM
- ❌ Nginx : ~50-100 MB RAM
- ✅ **MCP GROWCRM** : ~15 MB RAM (le plus léger !)

### 📈 Monitoring en Temps Réel

```bash
# Voir la consommation actuelle
docker stats growcrm-mcp-server --no-stream

# Sortie typique :
# CONTAINER           CPU %     MEM USAGE / LIMIT     MEM %
# growcrm-mcp-server  0.00%     14.96MiB / 512MiB    2.92%

# Monitoring continu
./monitor.sh

# Watch en temps réel
watch -n 5 'docker stats growcrm-mcp-server --no-stream'
```

### 🚀 Optimisations Appliquées

Le conteneur est déjà optimisé pour une **consommation minimale** :

1. ✅ **Image Alpine Linux** (5 MB vs 1 GB Ubuntu)
2. ✅ **Node.js 20 Slim** (pas de packages inutiles)
3. ✅ **Production mode** (pas de dev dependencies)
4. ✅ **Healthcheck intelligent** (vérifie toutes les 30s)
5. ✅ **Limite RAM 512 MB** (protection contre fuite mémoire)
6. ✅ **Limite CPU 1.0** (évite surcharge serveur)

### 💡 Recommandations

**Pour un serveur avec 2 GB RAM :**
- ✅ MCP GROWCRM consomme < 1% des ressources
- ✅ Peut tourner 24/7 sans impact
- ✅ Pas besoin d'optimisation supplémentaire

**Pour un serveur avec < 1 GB RAM :**
- ⚠️ Réduire la limite RAM à 256 MB dans `docker-compose.yml`
- ⚠️ Arrêter le MCP quand non utilisé

**Pour optimiser encore plus :**
```bash
# Éditer docker-compose.yml
nano docker-compose.yml

# Réduire les limites :
deploy:
  resources:
    limits:
      cpus: '0.5'      # Au lieu de 1.0
      memory: 256M     # Au lieu de 512M
    reservations:
      cpus: '0.1'      # Au lieu de 0.25
      memory: 64M      # Au lieu de 128M

# Puis redémarrer
docker-compose down && docker-compose up -d
```

### 🔍 Vérifier la Consommation

```bash
# Voir l'historique de consommation
docker stats growcrm-mcp-server

# Voir les processus dans le conteneur
docker exec growcrm-mcp-server ps aux

# Taille de l'image Docker
docker images | grep growcrm-mcp

# Espace disque utilisé
docker system df
```

**Résumé : Le MCP GROWCRM est ultra-léger et ne va PAS ralentir votre serveur !** 🚀

---

## �📖 Exemples de Demandes

Une fois configuré, vous pouvez demander à votre IA :

### Clients
- "Liste-moi les 10 derniers clients créés"
- "Affiche les détails du client avec l'ID 42"
- "Crée un nouveau client nommé 'Acme Corp' avec l'email contact@acme.com"

### Projets
- "Montre-moi tous les projets en cours"
- "Quels sont les projets du client ID 15 ?"
- "Crée un projet 'Refonte site web' pour le client ID 23"

### Tâches
- "Liste les tâches non terminées"
- "Affiche les tâches assignées à l'utilisateur ID 5"
- "Crée une tâche 'Appeler le client' pour le projet ID 8"

### Factures
- "Montre-moi les factures impayées"
- "Quelles sont les statistiques des factures ce mois-ci ?"
- "Affiche la facture numéro INV-2024-001"

### Dashboard
- "Affiche-moi les statistiques du dashboard"
- "Donne-moi un résumé de l'activité CRM"

### Recherche
- "Recherche 'Smith' dans tout le CRM"
- "Trouve tous les éléments liés à 'projet web'"

---

## 🎉 Félicitations !

Votre serveur MCP GROWCRM est maintenant prêt à être utilisé avec tous vos outils AI préférés !

**Ressources supplémentaires :**
- Documentation complète : `PROJET_COMPLET.md`
- Guide Docker : `DOCKER_GUIDE.md`
- Guide API : `API_REST_GUIDE.md`
- Démarrage rapide : `QUICKSTART.md`

**Support :**
- GitHub Issues : [Votre repo]
- Documentation MCP : https://modelcontextprotocol.io/
- Discord : [Votre serveur Discord]

---

**Créé avec ❤️ pour GROWCRM**  
**Version:** 1.0.0  
**Date:** 5 novembre 2025
