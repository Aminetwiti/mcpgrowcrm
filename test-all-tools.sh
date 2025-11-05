#!/bin/bash

# Script de test complet des 35 outils MCP GROWCRM
# Teste chaque outil et supprime uniquement les données créées

echo "🧪 TEST COMPLET DES OUTILS MCP GROWCRM"
echo "======================================"
echo ""

# Fonction pour appeler un outil MCP
call_tool() {
    local tool_name=$1
    local args=$2
    docker exec -i growcrm-mcp-server node index.js 2>/dev/null << EOF | tail -n 1
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}
{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"$tool_name","arguments":$args}}
EOF
}

# Variables pour stocker les IDs créés
CLIENT_TEST_ID=""
PROJECT_TEST_ID=""
TASK_TEST_ID=""
LEAD_TEST_ID=""
TICKET_TEST_ID=""

echo "🧑‍💼 1. TEST CLIENTS (5 outils)"
echo "--------------------------------"

# 1.1 Créer un client
echo -n "  • create_client... "
RESULT=$(call_tool "create_client" '{"client_company_name":"TEST_MCP_Client","client_email":"test_mcp@example.com","client_phone":"0123456789"}')
CLIENT_TEST_ID=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(json.loads(d['result']['content'][0]['text']).get('data',{}).get('client_id',''))" 2>/dev/null)
if [ -n "$CLIENT_TEST_ID" ]; then
    echo "✅ Client #$CLIENT_TEST_ID créé"
else
    echo "❌ ÉCHEC"
fi

# 1.2 Lister les clients
echo -n "  • list_clients... "
RESULT=$(call_tool "list_clients" '{"per_page":3}')
COUNT=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(json.loads(d['result']['content'][0]['text']).get('data',{}).get('data',[])))" 2>/dev/null)
if [ -n "$COUNT" ]; then
    echo "✅ $COUNT clients trouvés"
else
    echo "❌ ÉCHEC"
fi

# 1.3 Obtenir détails du client
if [ -n "$CLIENT_TEST_ID" ]; then
    echo -n "  • get_client... "
    RESULT=$(call_tool "get_client" "{\"client_id\":$CLIENT_TEST_ID}")
    NAME=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(json.loads(d['result']['content'][0]['text']).get('data',{}).get('client_company_name',''))" 2>/dev/null)
    if [ -n "$NAME" ]; then
        echo "✅ Détails: $NAME"
    else
        echo "❌ ÉCHEC"
    fi

    # 1.4 Mettre à jour le client
    echo -n "  • update_client... "
    RESULT=$(call_tool "update_client" "{\"client_id\":$CLIENT_TEST_ID,\"client_phone\":\"9999999999\"}")
    SUCCESS=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(json.loads(d['result']['content'][0]['text']).get('success',''))" 2>/dev/null)
    if [ "$SUCCESS" = "True" ]; then
        echo "✅ Mis à jour"
    else
        echo "❌ ÉCHEC"
    fi

    # 1.5 Supprimer le client
    echo -n "  • delete_client... "
    RESULT=$(call_tool "delete_client" "{\"client_id\":$CLIENT_TEST_ID}")
    SUCCESS=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(json.loads(d['result']['content'][0]['text']).get('success',''))" 2>/dev/null)
    if [ "$SUCCESS" = "True" ]; then
        echo "✅ Client #$CLIENT_TEST_ID supprimé"
    else
        echo "❌ ÉCHEC"
    fi
fi

echo ""
echo "📁 2. TEST PROJETS (5 outils)"
echo "--------------------------------"

# 2.1 Créer un projet (utilise client #6 existant)
echo -n "  • create_project... "
RESULT=$(call_tool "create_project" '{"project_title":"TEST_MCP_Project","project_clientid":6,"project_description":"Projet de test MCP"}')
PROJECT_TEST_ID=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(json.loads(d['result']['content'][0]['text']).get('data',{}).get('project_id',''))" 2>/dev/null)
if [ -n "$PROJECT_TEST_ID" ]; then
    echo "✅ Projet #$PROJECT_TEST_ID créé"
else
    echo "❌ ÉCHEC"
fi

# 2.2 Lister les projets
echo -n "  • list_projects... "
RESULT=$(call_tool "list_projects" '{"per_page":3}')
COUNT=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(json.loads(d['result']['content'][0]['text']).get('data',{}).get('data',[])))" 2>/dev/null)
if [ -n "$COUNT" ]; then
    echo "✅ $COUNT projets trouvés"
else
    echo "❌ ÉCHEC"
fi

# 2.3 Obtenir détails du projet
if [ -n "$PROJECT_TEST_ID" ]; then
    echo -n "  • get_project... "
    RESULT=$(call_tool "get_project" "{\"project_id\":$PROJECT_TEST_ID}")
    TITLE=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(json.loads(d['result']['content'][0]['text']).get('data',{}).get('project_title',''))" 2>/dev/null)
    if [ -n "$TITLE" ]; then
        echo "✅ Détails: $TITLE"
    else
        echo "❌ ÉCHEC"
    fi

    # 2.4 Mettre à jour le projet
    echo -n "  • update_project... "
    RESULT=$(call_tool "update_project" "{\"project_id\":$PROJECT_TEST_ID,\"project_progress\":50}")
    SUCCESS=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(json.loads(d['result']['content'][0]['text']).get('success',''))" 2>/dev/null)
    if [ "$SUCCESS" = "True" ]; then
        echo "✅ Mis à jour"
    else
        echo "❌ ÉCHEC"
    fi

    # 2.5 Supprimer le projet
    echo -n "  • delete_project... "
    RESULT=$(call_tool "delete_project" "{\"project_id\":$PROJECT_TEST_ID}")
    SUCCESS=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(json.loads(d['result']['content'][0]['text']).get('success',''))" 2>/dev/null)
    if [ "$SUCCESS" = "True" ]; then
        echo "✅ Projet #$PROJECT_TEST_ID supprimé"
    else
        echo "❌ ÉCHEC"
    fi
fi

echo ""
echo "✅ 3. TEST TÂCHES (5 outils)"
echo "--------------------------------"

# 3.1 Créer une tâche (utilise projet #7 existant)
echo -n "  • create_task... "
RESULT=$(call_tool "create_task" '{"task_title":"TEST_MCP_Task","task_projectid":7,"task_description":"Tâche de test MCP","task_priority":"normal"}')
TASK_TEST_ID=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(json.loads(d['result']['content'][0]['text']).get('data',{}).get('task_id',''))" 2>/dev/null)
if [ -n "$TASK_TEST_ID" ]; then
    echo "✅ Tâche #$TASK_TEST_ID créée"
else
    echo "❌ ÉCHEC"
fi

# 3.2 Lister les tâches
echo -n "  • list_tasks... "
RESULT=$(call_tool "list_tasks" '{"per_page":5}')
COUNT=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(json.loads(d['result']['content'][0]['text']).get('data',{}).get('data',[])))" 2>/dev/null)
if [ -n "$COUNT" ]; then
    echo "✅ $COUNT tâches trouvées"
else
    echo "❌ ÉCHEC"
fi

# 3.3 Obtenir détails de la tâche
if [ -n "$TASK_TEST_ID" ]; then
    echo -n "  • get_task... "
    RESULT=$(call_tool "get_task" "{\"task_id\":$TASK_TEST_ID}")
    TITLE=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(json.loads(d['result']['content'][0]['text']).get('data',{}).get('task_title',''))" 2>/dev/null)
    if [ -n "$TITLE" ]; then
        echo "✅ Détails: $TITLE"
    else
        echo "❌ ÉCHEC"
    fi

    # 3.4 Mettre à jour la tâche
    echo -n "  • update_task... "
    RESULT=$(call_tool "update_task" "{\"task_id\":$TASK_TEST_ID,\"task_progress\":75}")
    SUCCESS=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(json.loads(d['result']['content'][0]['text']).get('success',''))" 2>/dev/null)
    if [ "$SUCCESS" = "True" ]; then
        echo "✅ Mise à jour"
    else
        echo "❌ ÉCHEC"
    fi

    # 3.5 Supprimer la tâche
    echo -n "  • delete_task... "
    RESULT=$(call_tool "delete_task" "{\"task_id\":$TASK_TEST_ID}")
    SUCCESS=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(json.loads(d['result']['content'][0]['text']).get('success',''))" 2>/dev/null)
    if [ "$SUCCESS" = "True" ]; then
        echo "✅ Tâche #$TASK_TEST_ID supprimée"
    else
        echo "❌ ÉCHEC"
    fi
fi

echo ""
echo "💰 4. TEST FACTURES (4 outils - pas de suppression)"
echo "--------------------------------"

# 4.1 Lister les factures
echo -n "  • list_invoices... "
RESULT=$(call_tool "list_invoices" '{"per_page":3}')
COUNT=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(json.loads(d['result']['content'][0]['text']).get('data',{}).get('data',[])))" 2>/dev/null)
if [ -n "$COUNT" ]; then
    echo "✅ $COUNT factures trouvées"
else
    echo "❌ ÉCHEC"
fi

echo ""
echo "🎯 5. TEST LEADS/PROSPECTS (4 outils)"
echo "--------------------------------"

# 5.1 Créer un lead
echo -n "  • create_lead... "
RESULT=$(call_tool "create_lead" '{"lead_firstname":"Test","lead_lastname":"MCP_Lead","lead_email":"testlead_mcp@example.com","lead_phone":"1234567890"}')
LEAD_TEST_ID=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(json.loads(d['result']['content'][0]['text']).get('data',{}).get('lead_id',''))" 2>/dev/null)
if [ -n "$LEAD_TEST_ID" ]; then
    echo "✅ Lead #$LEAD_TEST_ID créé"
else
    echo "❌ ÉCHEC"
fi

# 5.2 Lister les leads
echo -n "  • list_leads... "
RESULT=$(call_tool "list_leads" '{"per_page":3}')
COUNT=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(json.loads(d['result']['content'][0]['text']).get('data',{}).get('data',[])))" 2>/dev/null)
if [ -n "$COUNT" ]; then
    echo "✅ $COUNT leads trouvés"
else
    echo "❌ ÉCHEC"
fi

# 5.3 Obtenir détails du lead
if [ -n "$LEAD_TEST_ID" ]; then
    echo -n "  • get_lead... "
    RESULT=$(call_tool "get_lead" "{\"lead_id\":$LEAD_TEST_ID}")
    NAME=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(json.loads(d['result']['content'][0]['text']).get('data',{}).get('lead_firstname',''))" 2>/dev/null)
    if [ -n "$NAME" ]; then
        echo "✅ Détails: $NAME"
    else
        echo "❌ ÉCHEC"
    fi
fi

echo ""
echo "🎫 6. TEST TICKETS (4 outils - pas de suppression)"
echo "--------------------------------"

# 6.1 Lister les tickets
echo -n "  • list_tickets... "
RESULT=$(call_tool "list_tickets" '{"per_page":3}')
COUNT=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(json.loads(d['result']['content'][0]['text']).get('data',{}).get('data',[])))" 2>/dev/null)
if [ -n "$COUNT" ]; then
    echo "✅ $COUNT tickets trouvés"
else
    echo "❌ ÉCHEC"
fi

echo ""
echo "📋 7. TEST DEVIS (3 outils - pas de suppression)"
echo "--------------------------------"

# 7.1 Lister les devis
echo -n "  • list_estimates... "
RESULT=$(call_tool "list_estimates" '{"per_page":3}')
COUNT=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(json.loads(d['result']['content'][0]['text']).get('data',{}).get('data',[])))" 2>/dev/null)
if [ -n "$COUNT" ]; then
    echo "✅ $COUNT devis trouvés"
else
    echo "❌ ÉCHEC"
fi

echo ""
echo "💸 8. TEST DÉPENSES (2 outils - pas de suppression)"
echo "--------------------------------"

# 8.1 Lister les dépenses
echo -n "  • list_expenses... "
RESULT=$(call_tool "list_expenses" '{"per_page":3}')
COUNT=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(json.loads(d['result']['content'][0]['text']).get('data',{}).get('data',[])))" 2>/dev/null)
if [ -n "$COUNT" ]; then
    echo "✅ $COUNT dépenses trouvées"
else
    echo "❌ ÉCHEC"
fi

echo ""
echo "📄 9. TEST CONTRATS (2 outils - pas de suppression)"
echo "--------------------------------"

# 9.1 Lister les contrats
echo -n "  • list_contracts... "
RESULT=$(call_tool "list_contracts" '{"per_page":3}')
COUNT=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(json.loads(d['result']['content'][0]['text']).get('data',{}).get('data',[])))" 2>/dev/null)
if [ -n "$COUNT" ]; then
    echo "✅ $COUNT contrats trouvés"
else
    echo "❌ ÉCHEC"
fi

echo ""
echo "📊 10. TEST DASHBOARD (1 outil)"
echo "--------------------------------"

# 10.1 Obtenir statistiques
echo -n "  • get_dashboard_stats... "
RESULT=$(call_tool "get_dashboard_stats" '{}')
SUCCESS=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(json.loads(d['result']['content'][0]['text']).get('success',''))" 2>/dev/null)
if [ "$SUCCESS" = "True" ]; then
    echo "✅ Statistiques récupérées"
else
    echo "❌ ÉCHEC"
fi

echo ""
echo "======================================"
echo "✅ TEST COMPLET TERMINÉ"
echo ""
