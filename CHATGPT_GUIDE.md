# 🤖 Utiliser GROWCRM MCP avec ChatGPT

## 📋 Vue d'ensemble

ChatGPT **ne supporte pas directement** le protocole MCP stdio. Utilisez l'**API REST Laravel** directement.

**✅ API REST Laravel :**
- **URL** : `https://app.ty-dev.fr/api/v1`
- **Auth** : Token Bearer Sanctum
- **Status** : ✅ Production
- **Token** : `1|ewMkTeTioHy523VhvcN7T8VM7qrQqzCBqMHlSUR7a9ae25dd`

---

## 🚀 Méthode 1 : Custom GPT (Recommandé)

### Étape 1 : Créer un Custom GPT

1. Allez sur https://chat.openai.com/gpts/editor
2. Cliquez sur "Create a GPT"
3. Donnez un nom : **"GROWCRM Assistant"**
4. Description : **"Assistant pour gérer votre CRM GROWCRM - clients, projets, tâches, factures"**

### Étape 2 : Configurer les Actions

1. Dans l'onglet "Configure"
2. Allez à "Actions" → "Create new action"
3. Cliquez sur "Import from URL" ou collez le schéma ci-dessous

### Étape 3 : Schéma OpenAPI

```yaml
openapi: 3.0.0
info:
  title: GROWCRM CRM API
  version: 1.0.0
  description: API pour gérer GROWCRM - Clients, Projets, Tâches, Factures, etc.

servers:
  - url: https://app.ty-dev.fr/api/v1
    description: API REST GROWCRM Laravel

security:
  - bearerAuth: []

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

paths:
  /clients:
    get:
      summary: Liste des clients
      operationId: listClients
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: perPage
          in: query
          schema:
            type: integer
            default: 10
      responses:
        '200':
          description: Liste des clients

  /clients/{id}:
    get:
      summary: Détails d'un client
      operationId: getClient
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Détails du client

  /projects:
    get:
      summary: Liste des projets
      operationId: listProjects
      parameters:
        - name: page
          in: query
          schema:
            type: integer
        - name: status
          in: query
          schema:
            type: string
            enum: [active, completed, on_hold]
      responses:
        '200':
          description: Liste des projets

  /projects/{id}:
    get:
      summary: Détails d'un projet
      operationId: getProject
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Détails du projet

  /tasks:
    get:
      summary: Liste des tâches
      operationId: listTasks
      parameters:
        - name: status
          in: query
          schema:
            type: string
            enum: [pending, in_progress, completed]
      responses:
        '200':
          description: Liste des tâches

  /invoices:
    get:
      summary: Liste des factures
      operationId: listInvoices
      parameters:
        - name: status
          in: query
          schema:
            type: string
            enum: [paid, unpaid, overdue]
      responses:
        '200':
          description: Liste des factures

  /leads:
    get:
      summary: Liste des prospects
      operationId: listLeads
      responses:
        '200':
          description: Liste des prospects

  /tickets:
    get:
      summary: Liste des tickets
      operationId: listTickets
      parameters:
        - name: status
          in: query
          schema:
            type: string
            enum: [open, closed, pending]
      responses:
        '200':
          description: Liste des tickets

  /dashboard:
    get:
      summary: Statistiques du dashboard
      operationId: getDashboard
      responses:
        '200':
          description: Statistiques CRM

  /search:
    get:
      summary: Recherche globale
      operationId: globalSearch
      parameters:
        - name: query
          in: query
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Résultats de recherche
```

### Étape 4 : Configuration de l'Authentification

1. Dans "Authentication" → Sélectionnez **"Bearer Token"**
2. Token : `1|ewMkTeTioHy523VhvcN7T8VM7qrQqzCBqMHlSUR7a9ae25dd`
3. Sauvegardez

### Étape 5 : Instructions du GPT

Ajoutez ces instructions dans "Instructions" :

```
Tu es un assistant GROWCRM spécialisé dans la gestion du CRM.

Capacités :
- Liste et gère les clients
- Affiche les projets en cours
- Gère les tâches et leur statut
- Consulte les factures et devis
- Suit les prospects (leads)
- Gère les tickets de support
- Affiche les statistiques du dashboard
- Recherche dans tout le CRM

Comportement :
- Sois concis et professionnel
- Affiche les données sous forme de tableaux quand possible
- Propose des actions pertinentes basées sur les données
- Demande des clarifications si nécessaire

Exemples de requêtes :
- "Liste-moi les 5 derniers clients"
- "Affiche les projets en cours"
- "Quelles sont les factures impayées ?"
- "Statistiques du dashboard"
- "Recherche 'Smith' dans le CRM"
```

### Étape 6 : Tester

Testez votre GPT avec :
- "Liste-moi les clients"
- "Affiche les projets"
- "Donne-moi les statistiques"

---

## 🔧 Méthode 2 : Actions ChatGPT (Sans Custom GPT)

Si vous n'avez pas accès aux Custom GPTs, utilisez directement les actions :

### Configuration dans ChatGPT Plus

1. Ouvrez un chat ChatGPT
2. Tapez `/actions` (si disponible)
3. Ou utilisez Make.com/Zapier comme proxy

---

## 🌐 Méthode 3 : Via Make.com ou Zapier

### Avec Make.com

1. **Créer un Scenario**
   - Trigger : **Webhook** (pour recevoir depuis ChatGPT)
   - Module : **HTTP Request**
   - URL : `http://62.169.27.8:3200/api/{endpoint}`
   - Headers : `Authorization: Bearer 1|ewMkTeTioHy523VhvcN7T8VM7qrQqzCBqMHlSUR7a9ae25dd`

2. **Configurer les Endpoints**
   ```
   GET /api/clients       → Liste clients
   GET /api/projects      → Liste projets
   GET /api/tasks         → Liste tâches
   GET /api/invoices      → Liste factures
   GET /api/dashboard     → Statistiques
   ```

3. **Utiliser dans ChatGPT**
   - Créez un Custom GPT
   - Ajoutez l'URL webhook Make.com comme action

### Avec Zapier

1. **Créer un Zap**
   - Trigger : **Webhooks by Zapier**
   - Action : **Webhooks by Zapier** → Custom Request
   - URL : `http://62.169.27.8:3200/api/clients`
   - Method : GET
   - Headers : `Authorization: Bearer 1|ewMkTeTioHy523VhvcN7T8VM7qrQqzCBqMHlSUR7a9ae25dd`

---

## 📝 Endpoints Disponibles

| Endpoint | Méthode | Body | Description |
|----------|---------|------|-------------|
| `/health` | GET | - | Status du serveur |
| `/tools` | GET | - | Liste tous les outils MCP |
| `/tools/list_clients` | POST | `{"page":1,"perPage":10}` | Liste des clients |
| `/tools/get_client_details` | POST | `{"clientId":"5"}` | Détails d'un client |
| `/tools/list_projects` | POST | `{"page":1,"status":"active"}` | Liste des projets |
| `/tools/get_project_details` | POST | `{"projectId":"8"}` | Détails d'un projet |
| `/tools/list_tasks` | POST | `{"status":"pending"}` | Liste des tâches |
| `/tools/list_invoices` | POST | `{"status":"unpaid"}` | Liste des factures |
| `/tools/list_leads` | POST | `{"page":1}` | Liste des prospects |
| `/tools/list_tickets` | POST | `{"status":"open"}` | Liste des tickets |
| `/tools/get_dashboard_stats` | POST | `{}` | Statistiques globales |
| `/tools/global_search` | POST | `{"query":"smith"}` | Recherche globale |

---

## 🧪 Tester l'API

### Via curl

```bash
# Test de santé
curl http://62.169.27.8:3200/health

# Liste des outils disponibles
curl http://62.169.27.8:3200/tools

# Liste des clients
curl -X POST http://62.169.27.8:3200/tools/list_clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 1|ewMkTeTioHy523VhvcN7T8VM7qrQqzCBqMHlSUR7a9ae25dd" \
  -d '{"page":1,"perPage":10}'

# Détails d'un client
curl -X POST http://62.169.27.8:3200/tools/get_client_details \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 1|ewMkTeTioHy523VhvcN7T8VM7qrQqzCBqMHlSUR7a9ae25dd" \
  -d '{"clientId":"5"}'

# Projets en cours
curl -X POST http://62.169.27.8:3200/tools/list_projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 1|ewMkTeTioHy523VhvcN7T8VM7qrQqzCBqMHlSUR7a9ae25dd" \
  -d '{"page":1,"status":"active"}'

# Dashboard
curl -X POST http://62.169.27.8:3200/tools/get_dashboard_stats \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 1|ewMkTeTioHy523VhvcN7T8VM7qrQqzCBqMHlSUR7a9ae25dd" \
  -d '{}'

# Recherche
curl -X POST http://62.169.27.8:3200/tools/global_search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 1|ewMkTeTioHy523VhvcN7T8VM7qrQqzCBqMHlSUR7a9ae25dd" \
  -d '{"query":"smith"}'
```

### Via Browser

Ouvrez : `http://62.169.27.8:3200/health`

Vous devriez voir :
```json
{
  "status": "healthy",
  "version": "2.0.0",
  "mode": "http",
  "auth": "token"
}
```

---

## 🔒 Sécurité

### ⚠️ Important

Le serveur est actuellement **HTTP non sécurisé**. Pour la production :

1. **Configurer HTTPS avec Nginx**

```nginx
server {
    listen 443 ssl;
    server_name api.growcrm.yourdomain.com;

    ssl_certificate /etc/ssl/certs/your-cert.crt;
    ssl_certificate_key /etc/ssl/private/your-key.key;

    location / {
        proxy_pass http://localhost:3200;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Authorization $http_authorization;
    }
}
```

2. **Limiter les IPs autorisées** (Firewall)

```bash
# UFW
sudo ufw allow from VOTRE_IP to any port 3200

# iptables
iptables -A INPUT -p tcp --dport 3200 -s VOTRE_IP -j ACCEPT
iptables -A INPUT -p tcp --dport 3200 -j DROP
```

3. **Utiliser un Reverse Proxy** (Cloudflare, Nginx)

---

## 🛠️ Gestion du Serveur HTTP

### Démarrage

```bash
cd /www/wwwroot/app-tydev/GROWCRM/growcrm-mcp-server
nohup node index-http.js > http-server.log 2>&1 &
```

### Arrêt

```bash
# Trouver le PID
ps aux | grep index-http.js

# Arrêter
kill PID_NUMBER
```

### Logs

```bash
# Voir les logs en temps réel
tail -f /www/wwwroot/app-tydev/GROWCRM/growcrm-mcp-server/http-server.log

# Dernières 50 lignes
tail -50 /www/wwwroot/app-tydev/GROWCRM/growcrm-mcp-server/http-server.log
```

### Redémarrage Auto (avec PM2 si disponible)

```bash
npm install -g pm2
pm2 start index-http.js --name growcrm-http
pm2 save
pm2 startup
```

---

## 📖 Exemples de Requêtes ChatGPT

Une fois le Custom GPT configuré, vous pouvez demander :

### Clients
- "Liste-moi les 10 derniers clients"
- "Affiche les détails du client numéro 5"
- "Combien de clients avons-nous ?"

### Projets
- "Quels sont les projets en cours ?"
- "Affiche tous les projets du client ID 3"
- "Combien de projets sont terminés ?"

### Tâches
- "Liste les tâches non terminées"
- "Affiche les tâches du projet 8"
- "Quelles tâches sont en retard ?"

### Factures
- "Montre-moi les factures impayées"
- "Quel est le montant total des factures en attente ?"
- "Factures du client numéro 12"

### Dashboard
- "Affiche-moi les statistiques"
- "Donne-moi un résumé de l'activité CRM"
- "Combien de nouveaux clients ce mois-ci ?"

### Recherche
- "Recherche 'John Smith' dans tout le CRM"
- "Trouve tous les éléments liés à 'projet web'"

---

## 🎉 Félicitations !

Votre serveur MCP GROWCRM est maintenant accessible via HTTP sur le **port 3200** et prêt à être utilisé avec ChatGPT !

**Statut actuel :**
- ✅ Serveur HTTP actif sur `http://62.169.27.8:3200`
- ✅ Authentication Bearer Token configurée
- ✅ 10 endpoints API disponibles
- ✅ Compatible avec Custom GPTs ChatGPT

---

## 📚 Ressources

- **Guide complet** : `GUIDE_UTILISATION_AI.md`
- **Accès sans SSH** : `ACCES_SANS_SSH.md`
- **API REST Laravel** : `API_REST_GUIDE.md`
- **Docker** : `DOCKER_GUIDE.md`

**Serveur** : 62.169.27.8:3200  
**Token** : `1|ewMkTeTioHy523VhvcN7T8VM7qrQqzCBqMHlSUR7a9ae25dd`  
**Version** : 1.0.0  
**Date** : 5 novembre 2025
