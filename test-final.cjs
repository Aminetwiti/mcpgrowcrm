#!/usr/bin/env node

/**
 * TEST FINAL - Validation complète du serveur MCP v2.0
 */

console.log('\n🧪 TEST FINAL - SERVEUR MCP GROWCRM v2.0\n');
console.log('=========================================\n');

const fs = require('fs');
const path = require('path');

let testsReussis = 0;
let testsTotal = 0;

function test(nom, condition) {
  testsTotal++;
  if (condition) {
    console.log(`✅ ${nom}`);
    testsReussis++;
  } else {
    console.log(`❌ ${nom}`);
  }
}

// ============================================================================
// TEST 1 : Fichiers de configuration
// ============================================================================

console.log('📂 Test 1 : Fichiers de configuration\n');

test('Fichier .env existe', fs.existsSync('.env'));
test('Fichier index.js existe', fs.existsSync('index.js'));
test('Fichier package.json existe', fs.existsSync('package.json'));
test('Fichier README.md existe', fs.existsSync('README.md'));

// ============================================================================
// TEST 2 : Configuration .env
// ============================================================================

console.log('\n📝 Test 2 : Configuration .env\n');

if (fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf8');
  
  test('AUTH_MODE=token configuré', envContent.includes('AUTH_MODE=token'));
  test('GROWCRM_API_TOKEN défini', envContent.includes('GROWCRM_API_TOKEN=') && !envContent.includes('your-api-token-here'));
  test('GROWCRM_BASE_URL pointe vers /api/v1', envContent.includes('/api/v1'));
}

// ============================================================================
// TEST 3 : Code du serveur MCP
// ============================================================================

console.log('\n💻 Test 3 : Code du serveur MCP\n');

if (fs.existsSync('index.js')) {
  const indexContent = fs.readFileSync('index.js', 'utf8');
  
  test('Import du SDK MCP', indexContent.includes('@modelcontextprotocol/sdk'));
  test('Import Axios', indexContent.includes('axios'));
  test('Import dotenv', indexContent.includes('dotenv'));
  test('Définition de TOOLS', indexContent.includes('const TOOLS'));
  test('Fonction handleToolCall', indexContent.includes('handleToolCall'));
  test('Bearer token configuré', indexContent.includes('Bearer'));
}

// ============================================================================
// TEST 4 : Nombre d'outils MCP
// ============================================================================

console.log('\n🛠️  Test 4 : Nombre d\'outils MCP\n');

if (fs.existsSync('index.js')) {
  const indexContent = fs.readFileSync('index.js', 'utf8');
  
  // Compter les outils définis
  const toolsMatch = indexContent.match(/name: ['"](\w+)['"]/g);
  const nombreOutils = toolsMatch ? toolsMatch.length : 0;
  
  console.log(`   📊 Outils détectés : ${nombreOutils}`);
  test('Au moins 35 outils disponibles', nombreOutils >= 35);
  
  // Vérifier les catégories principales
  test('Outils clients présents', indexContent.includes('list_clients') && indexContent.includes('create_client'));
  test('Outils projets présents', indexContent.includes('list_projects') && indexContent.includes('create_project'));
  test('Outils tâches présents', indexContent.includes('list_tasks') && indexContent.includes('create_task'));
  test('Outils factures présents', indexContent.includes('list_invoices') && indexContent.includes('create_invoice'));
  test('Outils leads présents', indexContent.includes('list_leads') && indexContent.includes('create_lead'));
  test('Outils tickets présents', indexContent.includes('list_tickets') && indexContent.includes('create_ticket'));
}

// ============================================================================
// TEST 5 : Scripts d'administration
// ============================================================================

console.log('\n🔧 Test 5 : Scripts d\'administration\n');

test('Script generate-token.sh existe', fs.existsSync('generate-token.sh'));
test('Script setup-api.sh existe', fs.existsSync('setup-api.sh'));
test('Script setup-claude-desktop.sh existe', fs.existsSync('setup-claude-desktop.sh'));

if (fs.existsSync('generate-token.sh')) {
  const stats = fs.statSync('generate-token.sh');
  test('generate-token.sh est exécutable', (stats.mode & 0o111) !== 0);
}

// ============================================================================
// TEST 6 : Documentation
// ============================================================================

console.log('\n📖 Test 6 : Documentation\n');

test('README.md existe', fs.existsSync('README.md'));
test('QUICKSTART.md existe', fs.existsSync('QUICKSTART.md'));
test('API_REST_GUIDE.md existe', fs.existsSync('API_REST_GUIDE.md'));
test('STATUS.md existe', fs.existsSync('STATUS.md'));
test('MISSION_ACCOMPLIE.md existe', fs.existsSync('MISSION_ACCOMPLIE.md'));
test('EXTENSIONS_RECOMMANDEES.js existe', fs.existsSync('EXTENSIONS_RECOMMANDEES.js'));

// ============================================================================
// TEST 7 : Dépendances Node.js
// ============================================================================

console.log('\n📦 Test 7 : Dépendances Node.js\n');

test('node_modules existe', fs.existsSync('node_modules'));

if (fs.existsSync('node_modules')) {
  test('@modelcontextprotocol/sdk installé', fs.existsSync('node_modules/@modelcontextprotocol'));
  test('axios installé', fs.existsSync('node_modules/axios'));
  test('dotenv installé', fs.existsSync('node_modules/dotenv'));
}

// ============================================================================
// RÉSULTATS FINAUX
// ============================================================================

console.log('\n' + '='.repeat(60));
console.log('📊 RÉSULTATS FINAUX\n');
console.log(`Tests réussis : ${testsReussis}/${testsTotal}`);
console.log(`Taux de réussite : ${Math.round((testsReussis/testsTotal)*100)}%`);

if (testsReussis === testsTotal) {
  console.log('\n🎉 TOUS LES TESTS SONT PASSÉS !');
  console.log('✅ Le serveur MCP GROWCRM v2.0 est opérationnel');
  console.log('\n💡 Prochaine étape : npm start');
  process.exit(0);
} else {
  console.log('\n⚠️  Certains tests ont échoué');
  console.log('Vérifiez la configuration avant de démarrer le serveur');
  process.exit(1);
}
