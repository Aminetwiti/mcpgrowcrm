#!/bin/bash
# test-access.sh - Tester les 3 méthodes

echo "🧪 Test des méthodes d'accès MCP"
echo "================================="
echo ""

# Test 1: Docker Local
echo "1️⃣ Test Docker Local..."
if docker ps | grep -q growcrm-mcp-server; then
  RESULT=$(echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | docker exec -i growcrm-mcp-server node index.js 2>&1)
  if echo "$RESULT" | grep -q "list_clients"; then
    echo "   ✅ Docker Local fonctionne"
  else
    echo "   ❌ Docker Local échoue"
  fi
else
  echo "   ⚠️  Container non trouvé"
fi
echo ""

# Test 2: Node Direct
echo "2️⃣ Test Node Direct..."
if command -v node &> /dev/null; then
  cd /www/wwwroot/app-tydev/GROWCRM/growcrm-mcp-server
  RESULT=$(echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | timeout 5 node index.js 2>&1)
  if echo "$RESULT" | grep -q "list_clients"; then
    echo "   ✅ Node Direct fonctionne"
  else
    echo "   ❌ Node Direct échoue"
  fi
else
  echo "   ⚠️  Node.js non installé"
fi
echo ""

# Test 3: HTTP
echo "3️⃣ Test HTTP..."
if command -v pm2 &> /dev/null && pm2 list 2>&1 | grep -q growcrm-mcp-http; then
  RESULT=$(curl -s -X POST http://localhost:3000 -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' 2>&1)
  if echo "$RESULT" | grep -q "list_clients"; then
    echo "   ✅ HTTP fonctionne"
  else
    echo "   ❌ HTTP échoue"
  fi
else
  echo "   ⚠️  Serveur HTTP non démarré"
fi
echo ""

echo "================================="
echo "Tests terminés !"
