#!/usr/bin/env node

/**
 * Test simple du serveur MCP
 * Simule un appel d'outil MCP
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Test du serveur MCP GROWCRM...\n');

// Démarrer le serveur MCP
const server = spawn('node', ['index.js'], {
  cwd: __dirname,
  stdio: ['pipe', 'pipe', 'pipe']
});

let output = '';
let timeout;

// Collecter la sortie
server.stdout.on('data', (data) => {
  output += data.toString();
  console.log('📤 Serveur:', data.toString());
});

server.stderr.on('data', (data) => {
  console.error('⚠️  Serveur (stderr):', data.toString());
});

// Attendre que le serveur soit prêt
setTimeout(() => {
  console.log('\n📨 Envoi de la requête test: list_tools\n');
  
  // Envoyer une requête MCP standard
  const request = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list',
    params: {}
  };
  
  server.stdin.write(JSON.stringify(request) + '\n');
  
  // Attendre la réponse
  timeout = setTimeout(() => {
    console.log('\n✅ Test terminé!');
    console.log('\n📊 Résultat:');
    
    if (output.includes('tools')) {
      console.log('✅ Le serveur répond correctement aux requêtes MCP');
      console.log('✅ Les outils sont disponibles');
    } else {
      console.log('⚠️  Réponse inattendue du serveur');
      console.log('Output:', output);
    }
    
    server.kill();
    process.exit(0);
  }, 5000);
}, 2000);

// Gestion des erreurs
server.on('error', (error) => {
  console.error('❌ Erreur:', error.message);
  clearTimeout(timeout);
  process.exit(1);
});

server.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`❌ Le serveur s'est arrêté avec le code ${code}`);
    clearTimeout(timeout);
    process.exit(code);
  }
});
