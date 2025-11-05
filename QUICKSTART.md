# 🚀 Installation Rapide - 5 Minutes

## Étape 1: Installer Node.js

Si Node.js n'est pas installé :

```bash
# Sur Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Vérifier l'installation
node --version
npm --version
```

## Étape 2: Installer les dépendances

```bash
cd /www/wwwroot/app-tydev/GROWCRM/growcrm-mcp-server
npm install
```

## Étape 3: Configurer

```bash
# Copier le fichier de configuration
cp .env.example .env

# Éditer la configuration
nano .env
```

Modifiez ces lignes :
```env
GROWCRM_BASE_URL=https://app.ty-dev.fr
GROWCRM_EMAIL=votre-email@example.com
GROWCRM_PASSWORD=votre-mot-de-passe
AUTH_MODE=credentials
DEBUG=true
```

## Étape 4: Tester

```bash
npm test
```

Si le test réussit, vous verrez :
```
✅ Tous les tests ont réussi !
📝 Vous pouvez maintenant utiliser le serveur MCP avec ces identifiants.
```

## Étape 5: Démarrer le serveur

```bash
npm start
```

## Étape 6: Intégrer avec Claude Desktop

Sur votre machine locale (macOS/Linux/Windows), éditez le fichier de configuration Claude :

**macOS:**
```bash
nano ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**Linux:**
```bash
nano ~/.config/Claude/claude_desktop_config.json
```

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

Ajoutez cette configuration :

```json
{
  "mcpServers": {
    "growcrm": {
      "command": "ssh",
      "args": [
        "user@your-server.com",
        "cd /www/wwwroot/app-tydev/GROWCRM/growcrm-mcp-server && node index.js"
      ],
      "env": {
        "DEBUG": "false"
      }
    }
  }
}
```

Ou si vous exécutez en local :

```json
{
  "mcpServers": {
    "growcrm": {
      "command": "node",
      "args": ["/chemin/complet/vers/growcrm-mcp-server/index.js"]
    }
  }
}
```

## ✅ C'est tout !

Redémarrez Claude Desktop et vous verrez les outils GROWCRM disponibles !

## 🔧 Commandes utiles

```bash
# Démarrer en mode développement (avec rechargement auto)
npm run dev

# Voir les logs en temps réel
DEBUG=true npm start

# Tester la connexion
npm test
```

## ❓ Problèmes courants

### "Cannot find module '@modelcontextprotocol/sdk'"

```bash
npm install
```

### "Échec de l'authentification"

Vérifiez vos identifiants dans `.env` et testez la connexion manuellement sur https://app.ty-dev.fr/login

### "ECONNREFUSED"

Vérifiez que l'URL dans `.env` est correcte et accessible.

## 📚 Documentation complète

Voir [README.md](README.md) pour la documentation complète.
