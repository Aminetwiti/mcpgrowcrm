#!/bin/bash

echo "🐳 GROWCRM MCP Server - Health Check"
echo "======================================"
echo ""

# Statut du conteneur
echo "📦 Conteneur:"
docker ps --filter "name=growcrm-mcp-server" --format "  Status: {{.Status}}"
echo ""

# Santé
echo "💚 Santé:"
HEALTH=$(docker inspect growcrm-mcp-server --format='{{.State.Health.Status}}' 2>/dev/null)
echo "  Health: $HEALTH"
echo ""

# Ressources
echo "📊 Ressources:"
docker stats growcrm-mcp-server --no-stream --format "  CPU: {{.CPUPerc}}\n  MEM: {{.MemUsage}}"
echo ""

# Réseau
echo "🌐 Réseau:"
docker inspect growcrm-mcp-server --format='  IP: {{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}'
echo ""

# Uptime
echo "⏱️  Uptime:"
docker ps --filter "name=growcrm-mcp-server" --format "  {{.Status}}"
echo ""

# Test MCP
echo "🔧 Test MCP:"
TEST_OUTPUT=$(echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | docker exec -i growcrm-mcp-server node index.js 2>&1)
if echo "$TEST_OUTPUT" | grep -q "list_clients"; then
  echo "  ✅ MCP répond correctement"
else
  echo "  ❌ MCP ne répond pas"
fi
echo ""

echo "======================================"
