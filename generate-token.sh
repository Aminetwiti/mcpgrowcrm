#!/bin/bash

# Script pour générer un token Sanctum pour le MCP
# Usage: ./generate-token.sh

echo "🔐 Génération d'un token Sanctum pour le MCP..."
echo ""

cd /www/wwwroot/app-tydev/GROWCRM/application

# Créer un token via Tinker
php artisan tinker --execute="
\$user = App\Models\User::where('email', 'amine.benammar17@gmail.com')->first();
if (\$user) {
    \$token = \$user->createToken('mcp-server', ['*'])->plainTextToken;
    echo '\n✅ Token généré avec succès!\n\n';
    echo '📋 Copiez ce token:\n';
    echo str_repeat('=', 60) . '\n';
    echo \$token . '\n';
    echo str_repeat('=', 60) . '\n\n';
    echo '🔧 Configuration:\n';
    echo 'Ajoutez dans /www/wwwroot/app-tydev/GROWCRM/growcrm-mcp-server/.env:\n\n';
    echo 'AUTH_MODE=token\n';
    echo 'GROWCRM_API_TOKEN=' . \$token . '\n\n';
} else {
    echo '❌ Utilisateur non trouvé\n';
}
"

echo ""
echo "✅ Terminé!"
