#!/bin/bash

# ============================================================================
# TEST RAPIDE DU DÉPLOIEMENT DOCKER
# ============================================================================

echo "🧪 TEST DU CONTENEUR DOCKER GROWCRM MCP"
echo "========================================"
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# ============================================================================
# Test 1 : Conteneur en cours d'exécution
# ============================================================================

echo "📦 Test 1 : État du conteneur"
if docker ps | grep -q growcrm-mcp-server; then
    STATUS=$(docker inspect growcrm-mcp-server --format='{{.State.Status}}')
    HEALTH=$(docker inspect growcrm-mcp-server --format='{{.State.Health.Status}}' 2>/dev/null || echo "none")
    
    echo -e "${GREEN}✅ Conteneur actif${NC}"
    echo "   Status: $STATUS"
    if [ "$HEALTH" != "none" ]; then
        echo "   Health: $HEALTH"
    fi
else
    echo -e "${RED}❌ Conteneur non trouvé${NC}"
    exit 1
fi

echo ""

# ============================================================================
# Test 2 : Processus Node.js
# ============================================================================

echo "🔍 Test 2 : Processus Node.js"
if docker exec growcrm-mcp-server ps aux 2>/dev/null | grep -q "node.*index.js"; then
    echo -e "${GREEN}✅ Processus Node.js actif${NC}"
else
    echo -e "${RED}❌ Processus Node.js non trouvé${NC}"
fi

echo ""

# ============================================================================
# Test 3 : Port 3200 (si mode HTTP)
# ============================================================================

echo "🌐 Test 3 : Port HTTP 3200"
if docker port growcrm-mcp-server 3200 >/dev/null 2>&1; then
    PORT_MAPPING=$(docker port growcrm-mcp-server 3200)
    echo -e "${GREEN}✅ Port 3200 exposé${NC}"
    echo "   Mapping: $PORT_MAPPING"
    
    # Tester l'endpoint health
    if curl -s http://localhost:3200/health >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Endpoint /health répond${NC}"
        curl -s http://localhost:3200/health | jq '.' 2>/dev/null || curl -s http://localhost:3200/health
    else
        echo -e "${YELLOW}⚠️  Endpoint /health ne répond pas${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Port 3200 non exposé (mode stdio)${NC}"
fi

echo ""

# ============================================================================
# Test 4 : Logs
# ============================================================================

echo "📝 Test 4 : Logs du conteneur"
ERRORS=$(docker logs growcrm-mcp-server 2>&1 | grep -i "error" | wc -l)
if [ "$ERRORS" -eq 0 ]; then
    echo -e "${GREEN}✅ Aucune erreur dans les logs${NC}"
else
    echo -e "${YELLOW}⚠️  $ERRORS erreurs détectées${NC}"
    echo "   Consultez: docker logs growcrm-mcp-server"
fi

echo ""

# ============================================================================
# Test 5 : Ressources
# ============================================================================

echo "💻 Test 5 : Utilisation des ressources"
STATS=$(docker stats growcrm-mcp-server --no-stream --format "CPU: {{.CPUPerc}} | MEM: {{.MemUsage}}")
echo "   $STATS"

echo ""

# ============================================================================
# Test 6 : Réseau
# ============================================================================

echo "🌐 Test 6 : Configuration réseau"
NETWORK=$(docker inspect growcrm-mcp-server --format='{{range $k, $v := .NetworkSettings.Networks}}{{$k}}{{end}}')
IP=$(docker inspect growcrm-mcp-server --format='{{range $k, $v := .NetworkSettings.Networks}}{{$v.IPAddress}}{{end}}')
echo "   Réseau: $NETWORK"
echo "   IP: $IP"

echo ""

# ============================================================================
# Test 7 : Connexion à l'API GROWCRM
# ============================================================================

echo "🔗 Test 7 : Connexion à l'API GROWCRM"
if docker exec growcrm-mcp-server wget --spider -q https://app.ty-dev.fr/api/v1/dashboard/stats 2>/dev/null; then
    echo -e "${GREEN}✅ API GROWCRM accessible${NC}"
else
    echo -e "${YELLOW}⚠️  Vérifiez la connexion réseau${NC}"
fi

echo ""

# ============================================================================
# RÉSUMÉ
# ============================================================================

echo "=========================================="
echo -e "${GREEN}✨ TESTS TERMINÉS${NC}"
echo "=========================================="
echo ""
echo "📊 COMMANDES UTILES :"
echo ""
echo "   Logs en direct :"
echo "     docker-compose logs -f growcrm-mcp"
echo ""
echo "   Redémarrer :"
echo "     docker-compose restart growcrm-mcp"
echo ""
echo "   Shell dans le conteneur :"
echo "     docker-compose exec growcrm-mcp sh"
echo ""
echo "   Stats en temps réel :"
echo "     docker stats growcrm-mcp-server"
echo ""

# Test de l'API si port 3200 exposé
if docker port growcrm-mcp-server 3200 >/dev/null 2>&1; then
    echo "🌐 TESTER L'API HTTP :"
    echo ""
    echo "   Health check :"
    echo "     curl http://localhost:3200/health"
    echo ""
    echo "   Liste des outils :"
    echo "     curl http://localhost:3200/tools"
    echo ""
    echo "   Documentation :"
    echo "     Ouvrez : http://localhost:3200"
    echo ""
fi
