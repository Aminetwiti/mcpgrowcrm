# 🚀 Accès MCP GROWCRM via NPX (Sans SSH)

## ✅ Configuration Finale

Le serveur MCP GROWCRM est maintenant accessible **directement via npx** sans aucune connexion SSH !

### 📍 Fichier hébergé
```
https://app.ty-dev.fr/mcp-wrapper.js
```

### ⚙️ Configuration MCP (mcp.json)

```json
{
  "servers": {
    "growcrm": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "--package=axios",
        "--package=node",
        "node",
        "https://app.ty-dev.fr/mcp-wrapper.js"
      ],
      "env": {}
    }
  }
}
```

### 🎯 Comment ça marche ?

1. **npx** télécharge automatiquement les dépendances nécessaires (axios)
2. **node** exécute le script directement depuis l'URL
3. Le wrapper communique avec l'API GROWCRM via HTTPS
4. **Aucune connexion SSH requise** ✨

### 🔧 Étapes d'utilisation

#### 1. Vérifier Node.js
```bash
node --version
# Doit afficher v14+ (vous avez v20.19.4 ✅)
```

#### 2. Redémarrer VS Code
- Fermez complètement VS Code
- Rouvrez-le
- Le serveur MCP "growcrm" devrait démarrer automatiquement

#### 3. Tester l'intégration
Dans Cline ou Copilot, essayez :
```
Liste-moi les clients de GROWCRM
```

Ou :
```
Montre-moi les projets en cours
```

### 📊 Outils disponibles (9)

Le wrapper expose 9 outils principaux :

1. **list_clients** - Liste tous les clients
2. **get_client** - Détails d'un client spécifique
3. **list_projects** - Liste tous les projets
4. **get_project** - Détails d'un projet spécifique
5. **list_tasks** - Liste toutes les tâches
6. **list_invoices** - Liste toutes les factures
7. **list_leads** - Liste tous les leads
8. **list_tickets** - Liste tous les tickets
9. **get_dashboard_stats** - Statistiques du tableau de bord

### 🔒 Sécurité

- Token Sanctum intégré dans le wrapper
- Connexion HTTPS uniquement
- Aucune donnée stockée localement
- Pas d'accès SSH nécessaire

### 🐛 Dépannage

#### Le serveur ne démarre pas
```bash
# Tester manuellement
npx -y --package=axios --package=node node https://app.ty-dev.fr/mcp-wrapper.js
```

Ensuite, envoyez :
```json
{"jsonrpc":"2.0","id":1,"method":"tools/list"}
```

Puis `Ctrl+C` pour quitter.

#### Erreur "Cannot find module 'axios'"
Le flag `--package=axios` devrait installer axios automatiquement. Si problème :
```bash
npm install -g axios
```

#### Pas de réponse du serveur
1. Vérifiez que https://app.ty-dev.fr/mcp-wrapper.js est accessible
2. Testez l'API directement :
```bash
curl -H "Authorization: Bearer 1|ewMkTeTioHy523VhvcN7T8VM7qrQqzCBqMHlSUR7a9ae25dd" \
  https://app.ty-dev.fr/api/v1/clients
```

### 📖 Références

- **Documentation complète** : `GUIDE_UTILISATION_AI.md`
- **Intégration ChatGPT** : `CHATGPT_GUIDE.md`
- **Gestion Docker** : `GESTION_CONTENEURS.md`

### 🎉 Avantages de cette méthode

✅ **Aucun SSH requis**
✅ **Pas de téléchargement manuel**
✅ **Mise à jour automatique** (changez le wrapper sur le serveur, c'est tout)
✅ **Fonctionne sur Windows/Mac/Linux**
✅ **Installation automatique des dépendances**
✅ **Compatible avec tous les clients MCP** (VS Code, Claude Desktop, etc.)

### 🚀 C'est tout !

Votre serveur MCP GROWCRM est maintenant **100% opérationnel sans SSH** !

Redémarrez VS Code et commencez à utiliser les 9 outils GROWCRM directement dans vos agents IA. 🎯
