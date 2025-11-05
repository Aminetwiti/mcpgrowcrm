#!/usr/bin/env node

/**
 * GROWCRM MCP Server - NPX Wrapper
 * Télécharge et exécute le wrapper MCP depuis le serveur
 */

const https = require('https');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const WRAPPER_URL = 'https://app.ty-dev.fr/mcp-wrapper.js';
const CACHE_DIR = path.join(os.tmpdir(), 'growcrm-mcp-cache');
const CACHE_FILE = path.join(CACHE_DIR, 'mcp-wrapper.js');

// Créer le dossier cache
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// Télécharger le wrapper
function downloadWrapper() {
  return new Promise((resolve, reject) => {
    https.get(WRAPPER_URL, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download: ${res.statusCode}`));
        return;
      }

      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        fs.writeFileSync(CACHE_FILE, data);
        fs.chmodSync(CACHE_FILE, 0o755);
        resolve();
      });
    }).on('error', reject);
  });
}

// Exécuter le wrapper
async function run() {
  try {
    // Vérifier si le cache existe, sinon télécharger
    if (!fs.existsSync(CACHE_FILE)) {
      await downloadWrapper();
    }

    // Exécuter le wrapper avec Node.js
    const child = spawn('node', [CACHE_FILE], {
      stdio: 'inherit',
      shell: false
    });

    child.on('error', (error) => {
      console.error('Erreur d\'exécution:', error);
      process.exit(1);
    });

    child.on('exit', (code) => {
      process.exit(code || 0);
    });

  } catch (error) {
    console.error('Erreur:', error.message);
    process.exit(1);
  }
}

run();
