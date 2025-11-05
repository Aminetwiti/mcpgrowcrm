#!/bin/bash

# ============================================================================
# SCRIPT DE DÉPLOIEMENT DOCKER - SERVEUR MCP GROWCRM v2.0
# ============================================================================
# Ce script automatise le déploiement complet du serveur MCP dans Docker
# ============================================================================

set -e  # Arrêter en cas d'erreur

echo "🐳 DÉPLOIEMENT DOCKER - SERVEUR MCP GROWCRM v2.0"
echo "================================================"
echo ""

# Couleurs pour l'affichage
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ============================================================================
# ÉTAPE 1 : Vérifications préalables
# ============================================================================

echo "📋 Étape 1/6 : Vérifications préalables..."

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker n'est pas installé${NC}"
    echo "   Installation : curl -fsSL https://get.docker.com | sh"
    exit 1
fi
echo -e "${GREEN}✅ Docker installé : $(docker --version)${NC}"

# Vérifier que Docker Compose est installé
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose n'est pas installé${NC}"
    echo "   Installation : sudo apt-get install docker-compose"
    exit 1
fi
echo -e "${GREEN}✅ Docker Compose installé : $(docker-compose --version)${NC}"

# Vérifier que le fichier .env existe
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Fichier .env manquant${NC}"
    echo "   Copiez .env.example vers .env et configurez-le"
    exit 1
fi
echo -e "${GREEN}✅ Fichier .env présent${NC}"

# Vérifier que le token est configuré
if ! grep -q "GROWCRM_API_TOKEN=1|" .env; then
    echo -e "${YELLOW}⚠️  Token Sanctum non configuré dans .env${NC}"
    echo "   Générez un token avec : ./generate-token.sh"
    read -p "   Continuer quand même ? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""

# ============================================================================
# ÉTAPE 2 : Arrêter les conteneurs existants
# ============================================================================

echo "🛑 Étape 2/6 : Arrêt des conteneurs existants..."

if docker ps -a | grep -q growcrm-mcp-server; then
    echo "   Arrêt du conteneur existant..."
    docker-compose down 2>/dev/null || true
    echo -e "${GREEN}✅ Conteneur arrêté${NC}"
else
    echo "   Aucun conteneur existant"
fi

echo ""

# ============================================================================
# ÉTAPE 3 : Construction de l'image Docker
# ============================================================================

echo "🔨 Étape 3/6 : Construction de l'image Docker..."

docker-compose build --no-cache

echo -e "${GREEN}✅ Image construite avec succès${NC}"
echo ""

# ============================================================================
# ÉTAPE 4 : Démarrage du conteneur
# ============================================================================

echo "🚀 Étape 4/6 : Démarrage du conteneur..."

docker-compose up -d

echo -e "${GREEN}✅ Conteneur démarré${NC}"
echo ""

# ============================================================================
# ÉTAPE 5 : Vérification du statut
# ============================================================================

echo "🔍 Étape 5/6 : Vérification du statut..."

# Attendre que le conteneur soit prêt
sleep 3

# Vérifier que le conteneur tourne
if docker ps | grep -q growcrm-mcp-server; then
    echo -e "${GREEN}✅ Conteneur en cours d'exécution${NC}"
    
    # Afficher les informations du conteneur
    echo ""
    echo "📊 Informations du conteneur :"
    docker ps --filter name=growcrm-mcp-server --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
else
    echo -e "${RED}❌ Le conteneur ne démarre pas${NC}"
    echo "   Consultez les logs : docker-compose logs growcrm-mcp"
    exit 1
fi

echo ""

# ============================================================================
# ÉTAPE 6 : Tests de validation
# ============================================================================

echo "🧪 Étape 6/6 : Tests de validation..."

# Test 1 : Vérifier que le processus Node.js tourne
if docker exec growcrm-mcp-server ps aux | grep -q "node index.js"; then
    echo -e "${GREEN}✅ Processus Node.js actif${NC}"
else
    echo -e "${RED}❌ Processus Node.js non trouvé${NC}"
fi

# Test 2 : Vérifier les logs (pas d'erreur critique)
if docker logs growcrm-mcp-server 2>&1 | grep -qi "error"; then
    echo -e "${YELLOW}⚠️  Des erreurs détectées dans les logs${NC}"
    echo "   Vérifiez avec : docker-compose logs growcrm-mcp"
else
    echo -e "${GREEN}✅ Aucune erreur dans les logs${NC}"
fi

echo ""

# ============================================================================
# FINALISATION
# ============================================================================

echo "=========================================="
echo -e "${GREEN}✨ DÉPLOIEMENT TERMINÉ AVEC SUCCÈS !${NC}"
echo "=========================================="
echo ""
echo "📍 Conteneur : growcrm-mcp-server"
echo "📊 Réseau : growcrm-mcp-network"
echo "🔗 Configuration : $(pwd)/.env"
echo ""
echo "🛠️  COMMANDES UTILES :"
echo ""
echo "   Voir les logs en temps réel :"
echo "     docker-compose logs -f growcrm-mcp"
echo ""
echo "   Redémarrer le conteneur :"
echo "     docker-compose restart growcrm-mcp"
echo ""
echo "   Arrêter le conteneur :"
echo "     docker-compose down"
echo ""
echo "   Accéder au shell du conteneur :"
echo "     docker-compose exec growcrm-mcp sh"
echo ""
echo "   Reconstruire et redémarrer :"
echo "     docker-compose up -d --build --force-recreate"
echo ""
echo "   Voir le statut :"
echo "     docker-compose ps"
echo ""
echo "📖 Documentation complète : README.md"
echo ""
echo "🎯 Le serveur MCP est maintenant prêt à recevoir des commandes !"
echo "   Configurez Claude Desktop avec :"
echo "     command: docker"
echo "     args: [\"exec\", \"-i\", \"growcrm-mcp-server\", \"node\", \"index.js\"]"
echo ""
