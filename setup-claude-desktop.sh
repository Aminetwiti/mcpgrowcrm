#!/bin/bash

# ============================================================================
# GUIDE D'INSTALLATION : CONNECTER GROWCRM MCP À CLAUDE DESKTOP
# ============================================================================

echo "📦 ÉTAPE 1 : Vérifier que le serveur MCP fonctionne"
echo "   cd /www/wwwroot/app-tydev/GROWCRM/growcrm-mcp-server"
echo "   npm test"
echo ""

echo "🖥️  ÉTAPE 2 : Installer Claude Desktop"
echo "   Téléchargez depuis : https://claude.ai/download"
echo "   Versions disponibles : Windows, macOS, Linux"
echo ""

echo "⚙️  ÉTAPE 3 : Configurer Claude Desktop"
echo "   Chemin du fichier de configuration selon votre OS :"
echo ""
echo "   • Linux : ~/.config/Claude/claude_desktop_config.json"
echo "   • macOS : ~/Library/Application Support/Claude/claude_desktop_config.json"
echo "   • Windows : %APPDATA%\\Claude\\claude_desktop_config.json"
echo ""

echo "📝 ÉTAPE 4 : Contenu du fichier claude_desktop_config.json"
cat << 'EOF'

{
  "mcpServers": {
    "growcrm": {
      "command": "node",
      "args": [
        "/www/wwwroot/app-tydev/GROWCRM/growcrm-mcp-server/index.js"
      ],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}

EOF

echo ""
echo "🔧 ÉTAPE 5 : Automatiser la configuration (Linux/macOS)"
echo "   Voulez-vous créer automatiquement la configuration ? (y/n)"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    CONFIG_DIR=""
    CONFIG_FILE=""
    
    # Déterminer l'OS
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        CONFIG_DIR="$HOME/.config/Claude"
        CONFIG_FILE="$CONFIG_DIR/claude_desktop_config.json"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        CONFIG_DIR="$HOME/Library/Application Support/Claude"
        CONFIG_FILE="$CONFIG_DIR/claude_desktop_config.json"
    else
        echo "❌ OS non supporté pour l'installation automatique"
        echo "   Créez le fichier manuellement sous Windows"
        exit 1
    fi
    
    # Créer le répertoire si nécessaire
    mkdir -p "$CONFIG_DIR"
    
    # Créer le fichier de configuration
    cat > "$CONFIG_FILE" << 'EOFCONFIG'
{
  "mcpServers": {
    "growcrm": {
      "command": "node",
      "args": [
        "/www/wwwroot/app-tydev/GROWCRM/growcrm-mcp-server/index.js"
      ],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
EOFCONFIG
    
    echo "✅ Configuration créée : $CONFIG_FILE"
    echo ""
fi

echo "🚀 ÉTAPE 6 : Redémarrer Claude Desktop"
echo "   1. Quittez complètement Claude Desktop"
echo "   2. Relancez l'application"
echo "   3. Vérifiez que GROWCRM apparaît dans l'icône 🔌 (MCP)"
echo ""

echo "🧪 ÉTAPE 7 : Tester l'intégration dans Claude"
echo "   Essayez ces commandes dans Claude Desktop :"
echo ""
echo "   • \"Liste-moi les 5 derniers projets GROWCRM\""
echo "   • \"Crée un nouveau client nommé Test Corp\""
echo "   • \"Montre-moi les statistiques du dashboard\""
echo "   • \"Récupère les informations du projet #42\""
echo ""

echo "📊 ÉTAPE 8 : Vérifier les logs MCP (si problème)"
echo "   • Activer le debug : DEBUG=true dans .env"
echo "   • Lancer manuellement : npm run dev"
echo "   • Consulter les logs Claude Desktop (selon OS)"
echo ""

echo "🎯 ÉTAPE 9 : Utilisation avancée"
echo "   Une fois connecté, Claude Desktop pourra :"
echo "   ✓ Créer des clients, projets, tâches automatiquement"
echo "   ✓ Générer des rapports complexes"
echo "   ✓ Automatiser des workflows CRM"
echo "   ✓ Répondre à des questions sur vos données"
echo ""

echo "⚠️  NOTES IMPORTANTES :"
echo "   • Le serveur MCP doit être accessible depuis Claude Desktop"
echo "   • Si Claude Desktop est sur une autre machine, utilisez AUTH_MODE=token"
echo "   • Les chemins doivent être absolus dans la configuration"
echo "   • Redémarrage de Claude Desktop nécessaire après modification config"
echo ""

echo "✨ INSTALLATION TERMINÉE !"
echo "   Documentation complète : README.md"
