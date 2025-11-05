# 🚀 GROWCRM MCP Server

Serveur MCP (Model Context Protocol) pour **GROWCRM** - Permet aux IA comme ChatGPT, Claude, et autres d'interagir directement avec votre CRM.

## 📋 Table des matières

- [Qu'est-ce qu'un MCP ?](#quest-ce-quun-mcp)
- [Fonctionnalités](#fonctionnalités)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [Outils disponibles](#outils-disponibles)
- [Intégration avec les IA](#intégration-avec-les-ia)
- [Développement](#développement)
- [Dépannage](#dépannage)

## 🤔 Qu'est-ce qu'un MCP ?

**MCP (Model Context Protocol)** est un protocole standardisé qui permet aux modèles d'IA (comme GPT-4, Claude, etc.) d'interagir avec des outils et services externes de manière sécurisée et structurée.

Ce serveur MCP expose les fonctionnalités de GROWCRM sous forme d'outils que les IA peuvent appeler pour :
- Consulter et créer des clients
- Gérer des projets et tâches
- Accéder aux factures et devis
- Gérer les leads et tickets
- Obtenir des statistiques

## ✨ Fonctionnalités

### 🎯 Modules supportés

- **Clients** : Liste, création, détails
- **Projets** : Liste, création, détails, filtrage
- **Tâches** : Liste, création, assignation
- **Factures** : Consultation, statistiques
- **Leads** : Gestion des prospects
- **Tickets** : Support client
- **Dashboard** : Statistiques et KPIs
- **Recherche globale** : Recherche dans tout le CRM

### 🔐 Sécurité

- Authentification Laravel native
- Support des tokens Sanctum
- Sessions sécurisées
- Protection CSRF

## 📦 Installation

### Prérequis

- Node.js >= 18.0.0
- npm ou yarn
- Accès à votre installation GROWCRM

### Installation des dépendances

```bash
cd growcrm-mcp-server
npm install
```

## ⚙️ Configuration

### 1. Créer le fichier de configuration

```bash
cp .env.example .env
```

### 2. Configurer les paramètres

Éditez le fichier `.env` :

```env
# URL de votre GROWCRM
GROWCRM_BASE_URL=https://app.ty-dev.fr

# Méthode 1: Authentification par identifiants (recommandé pour commencer)
AUTH_MODE=credentials
GROWCRM_EMAIL=admin@example.com
GROWCRM_PASSWORD=your-password-here

# Méthode 2: Authentification par token Sanctum (recommandé en production)
# AUTH_MODE=token
# GROWCRM_API_TOKEN=your-sanctum-token-here

# Debug (optionnel)
DEBUG=false
```

### 3. Générer un token API Sanctum (optionnel mais recommandé)

Pour utiliser l'authentification par token, vous devez créer un token dans GROWCRM :

```php
// Dans Laravel (via tinker ou un contrôleur)
$user = User::find(1); // Votre utilisateur admin
$token = $user->createToken('mcp-server')->plainTextToken;
echo $token;
```

Puis configurez dans `.env` :
```env
AUTH_MODE=token
GROWCRM_API_TOKEN=le-token-généré
```

## 🚀 Utilisation

### Démarrer le serveur

```bash
npm start
```

Ou en mode développement (avec rechargement automatique) :

```bash
npm run dev
```

### Tester le serveur

```bash
npm test
```

## 🛠️ Outils disponibles

### Clients

#### `list_clients`
Liste tous les clients avec pagination et filtres.

**Paramètres :**
- `page` (number, optionnel) : Numéro de page
- `limit` (number, optionnel) : Résultats par page (défaut: 25)
- `search` (string, optionnel) : Recherche par nom
- `category` (string, optionnel) : Filtrer par catégorie

**Exemple :**
```json
{
  "page": 1,
  "limit": 10,
  "search": "Acme Corp"
}
```

#### `get_client`
Obtenir les détails d'un client.

**Paramètres :**
- `client_id` (number, requis) : ID du client

#### `create_client`
Créer un nouveau client.

**Paramètres :**
- `client_company_name` (string, requis)
- `client_first_name` (string, requis)
- `client_last_name` (string, requis)
- `client_email` (string, requis)
- `client_phone` (string, optionnel)
- `client_website` (string, optionnel)
- `client_address` (string, optionnel)
- `client_city` (string, optionnel)
- `client_country` (string, optionnel)

---

### Projets

#### `list_projects`
Liste tous les projets.

**Paramètres :**
- `page` (number, optionnel)
- `client_id` (number, optionnel) : Filtrer par client
- `status` (string, optionnel) : not_started, in_progress, on_hold, completed, cancelled

#### `get_project`
Détails d'un projet.

**Paramètres :**
- `project_id` (number, requis)

#### `create_project`
Créer un nouveau projet.

**Paramètres :**
- `project_title` (string, requis)
- `project_clientid` (number, requis)
- `project_description` (string, optionnel)
- `project_start_date` (string, optionnel) : Format YYYY-MM-DD
- `project_deadline` (string, optionnel) : Format YYYY-MM-DD
- `project_status` (string, optionnel)

---

### Tâches

#### `list_tasks`
Liste les tâches.

**Paramètres :**
- `page` (number, optionnel)
- `project_id` (number, optionnel)
- `status` (string, optionnel)
- `assigned_to` (number, optionnel)

#### `create_task`
Créer une tâche.

**Paramètres :**
- `task_title` (string, requis)
- `task_projectid` (number, requis)
- `task_description` (string, optionnel)
- `task_priority` (string, optionnel) : low, normal, high, urgent
- `task_date_due` (string, optionnel) : Format YYYY-MM-DD

---

### Factures

#### `list_invoices`
Liste les factures.

**Paramètres :**
- `page` (number, optionnel)
- `client_id` (number, optionnel)
- `status` (string, optionnel) : draft, unpaid, paid, overdue, cancelled

#### `get_invoice`
Détails d'une facture.

**Paramètres :**
- `invoice_id` (number, requis)

---

### Leads

#### `list_leads`
Liste les leads/prospects.

**Paramètres :**
- `page` (number, optionnel)
- `status` (string, optionnel)
- `source` (string, optionnel)

#### `create_lead`
Créer un lead.

**Paramètres :**
- `lead_firstname` (string, requis)
- `lead_lastname` (string, requis)
- `lead_email` (string, requis)
- `lead_company_name` (string, optionnel)
- `lead_phone` (string, optionnel)
- `lead_value` (number, optionnel)

---

### Tickets

#### `list_tickets`
Liste les tickets de support.

**Paramètres :**
- `page` (number, optionnel)
- `status` (string, optionnel) : open, closed, pending
- `priority` (string, optionnel)

#### `create_ticket`
Créer un ticket.

**Paramètres :**
- `ticket_subject` (string, requis)
- `ticket_message` (string, requis)
- `ticket_clientid` (number, requis)
- `ticket_priority` (string, optionnel)

---

### Statistiques & Recherche

#### `get_dashboard_stats`
Statistiques du dashboard.

**Paramètres :**
- `year` (number, optionnel) : Année (défaut: année courante)

#### `search_global`
Recherche globale.

**Paramètres :**
- `query` (string, requis) : Terme de recherche
- `type` (string, optionnel) : all, clients, projects, tasks, invoices, leads, tickets

---

## 🤖 Intégration avec les IA

### Claude Desktop (Anthropic)

Ajoutez dans votre fichier de configuration Claude (`~/Library/Application Support/Claude/claude_desktop_config.json` sur macOS) :

```json
{
  "mcpServers": {
    "growcrm": {
      "command": "node",
      "args": ["/chemin/vers/growcrm-mcp-server/index.js"],
      "env": {
        "GROWCRM_BASE_URL": "https://app.ty-dev.fr",
        "AUTH_MODE": "credentials",
        "GROWCRM_EMAIL": "votre-email@example.com",
        "GROWCRM_PASSWORD": "votre-mot-de-passe"
      }
    }
  }
}
```

### ChatGPT (via MCP Bridge)

Utilisez un pont MCP vers ChatGPT (en développement dans la communauté).

### Autres clients MCP

Le serveur est compatible avec tout client MCP standard utilisant le transport stdio.

## 🔧 Développement

### Structure du projet

```
growcrm-mcp-server/
├── index.js           # Serveur MCP principal
├── package.json       # Dépendances Node.js
├── .env.example       # Configuration exemple
├── .env              # Configuration (à créer)
└── README.md         # Cette documentation
```

### Ajouter un nouvel outil

1. Ajoutez la définition dans le tableau `TOOLS` :

```javascript
{
  name: 'mon_nouvel_outil',
  description: 'Description de l\'outil',
  inputSchema: {
    type: 'object',
    properties: {
      param1: {
        type: 'string',
        description: 'Description du paramètre',
        required: true
      }
    },
    required: ['param1']
  }
}
```

2. Ajoutez le gestionnaire dans `handleToolCall` :

```javascript
case 'mon_nouvel_outil':
  return await makeApiRequest('GET', '/mon-endpoint', args);
```

### Debug

Activez le mode debug dans `.env` :

```env
DEBUG=true
```

Les logs apparaîtront dans stderr.

## 🐛 Dépannage

### Erreur d'authentification

**Problème :** `Échec de l'authentification avec GROWCRM`

**Solutions :**
1. Vérifiez vos identifiants dans `.env`
2. Vérifiez que l'URL de base est correcte
3. Testez la connexion manuellement dans un navigateur
4. Vérifiez les logs Laravel (`storage/logs/laravel.log`)

### Session expirée

Le serveur réauthentifie automatiquement. Si le problème persiste :
- Utilisez l'authentification par token
- Vérifiez la configuration de session dans GROWCRM

### Erreur 404 sur les routes

**Problème :** Les routes API ne fonctionnent pas

**Solutions :**
1. Vérifiez que les routes existent dans `routes/web.php`
2. Les routes AJAX de GROWCRM sont sous `/route/search` et non `/api/route`
3. Vérifiez les middlewares dans le Kernel

### Erreur CSRF Token

Si vous utilisez l'authentification par identifiants, le serveur gère automatiquement le token CSRF. Si problème :
- Vérifiez que les cookies sont bien envoyés
- Vérifiez la configuration CORS de GROWCRM

## 📝 Notes importantes

### ⚠️ Sécurité

- **Ne commitez JAMAIS votre fichier `.env`**
- Utilisez des tokens avec des permissions limitées
- En production, privilégiez l'authentification par token
- Limitez l'accès réseau au serveur MCP

### 🔄 Routes API de GROWCRM

Ce serveur utilise les routes web de GROWCRM (pas `/api/*`) car GROWCRM n'expose pas encore d'API REST complète. Les routes utilisées sont :
- `/clients/search` - Liste clients
- `/projects/search` - Liste projets
- `/tasks/search` - Liste tâches
- etc.

Si vous souhaitez créer une vraie API REST, consultez la section suivante.

## 🚀 Créer une API REST complète (optionnel)

Pour une meilleure architecture, vous pouvez créer des routes API dans GROWCRM :

### 1. Créer un contrôleur API

```bash
cd application
php artisan make:controller API/ClientsController
```

### 2. Ajouter les routes dans `routes/api.php`

```php
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/clients', 'API\\ClientsController@index');
    Route::post('/clients', 'API\\ClientsController@store');
    Route::get('/clients/{id}', 'API\\ClientsController@show');
    // etc...
});
```

### 3. Mettre à jour le serveur MCP pour utiliser `/api/*`

## 📚 Ressources

- [Documentation MCP](https://modelcontextprotocol.io/)
- [GROWCRM Documentation](../growcrm_documentation.txt)
- [Laravel Sanctum](https://laravel.com/docs/sanctum)

## 📄 Licence

MIT

## 👤 Auteur

Votre nom

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

---

**Note :** Ce serveur MCP est un projet communautaire et n'est pas officiellement supporté par GrowCRM. Utilisez-le à vos propres risques.
