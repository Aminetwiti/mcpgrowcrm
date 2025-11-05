#!/usr/bin/env node

/**
 * Démonstration interactive du serveur MCP GROWCRM
 * Teste les différents outils disponibles
 */

import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const BASE_URL = process.env.GROWCRM_BASE_URL;
const EMAIL = process.env.GROWCRM_EMAIL;
const PASSWORD = process.env.GROWCRM_PASSWORD;

console.log('🚀 Démonstration du serveur MCP GROWCRM\n');
console.log('═══════════════════════════════════════\n');

let sessionCookies = '';
let csrfToken = '';

// Client HTTP
const client = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
});

async function authenticate() {
  console.log('🔐 Authentification en cours...');
  
  // Récupérer le token CSRF
  const loginPage = await client.get('/login');
  const setCookies = loginPage.headers['set-cookie'];
  
  if (setCookies) {
    sessionCookies = setCookies.map(c => c.split(';')[0]).join('; ');
  }
  
  // Extraire le token
  const patterns = [
    /name="_token"\s+value="([^"]+)"/,
    /<input[^>]*name="_token"[^>]*value="([^"]+)"/
  ];
  
  for (const pattern of patterns) {
    const match = loginPage.data.match(pattern);
    if (match) {
      csrfToken = match[1];
      break;
    }
  }
  
  // Se connecter
  const loginData = `email=${encodeURIComponent(EMAIL)}&password=${encodeURIComponent(PASSWORD)}&_token=${csrfToken}`;
  const loginResponse = await client.post('/login', loginData, {
    headers: {
      'Cookie': sessionCookies,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Referer': `${BASE_URL}/login`
    },
    maxRedirects: 5,
    validateStatus: (status) => status < 500
  });
  
  const newCookies = loginResponse.headers['set-cookie'];
  if (newCookies) {
    sessionCookies = newCookies.map(c => c.split(';')[0]).join('; ');
  }
  
  client.defaults.headers.common['Cookie'] = sessionCookies;
  client.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;
  
  console.log('✅ Authentifié avec succès!\n');
}

async function testEndpoint(name, method, url, params = null) {
  console.log(`\n📍 Test: ${name}`);
  console.log(`   URL: ${method} ${url}`);
  
  try {
    const config = { method, url };
    if (params) {
      if (method === 'GET') {
        config.params = params;
      } else {
        config.data = params;
      }
    }
    
    const response = await client.request(config);
    console.log(`   ✅ Status: ${response.status}`);
    
    // Afficher un aperçu des données
    if (typeof response.data === 'object') {
      if (Array.isArray(response.data)) {
        console.log(`   📊 Résultats: ${response.data.length} éléments`);
      } else {
        const keys = Object.keys(response.data).slice(0, 5);
        console.log(`   📊 Clés: ${keys.join(', ')}${Object.keys(response.data).length > 5 ? '...' : ''}`);
      }
    } else {
      const preview = String(response.data).substring(0, 100);
      console.log(`   📊 Type: ${typeof response.data}, Aperçu: ${preview}...`);
    }
    
    return true;
  } catch (error) {
    console.log(`   ❌ Erreur: ${error.message}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
    }
    return false;
  }
}

async function main() {
  try {
    await authenticate();
    
    console.log('🧪 Tests des endpoints disponibles pour le MCP\n');
    console.log('═══════════════════════════════════════════════\n');
    
    // Dashboard
    await testEndpoint('Dashboard / Home', 'GET', '/home');
    
    // Clients
    await testEndpoint('Liste des clients', 'GET', '/clients/search', { page: 1, limit: 5 });
    
    // Projets
    await testEndpoint('Liste des projets', 'GET', '/projects/search', { page: 1, limit: 5 });
    
    // Tâches
    await testEndpoint('Liste des tâches', 'GET', '/tasks/search', { page: 1, limit: 5 });
    
    // Factures
    await testEndpoint('Liste des factures', 'GET', '/invoices/search', { page: 1, limit: 5 });
    
    // Leads
    await testEndpoint('Liste des leads', 'GET', '/leads/search', { page: 1, limit: 5 });
    
    // Tickets
    await testEndpoint('Liste des tickets', 'GET', '/tickets/search', { page: 1, limit: 5 });
    
    console.log('\n\n═══════════════════════════════════════════════');
    console.log('✅ Démonstration terminée!');
    console.log('═══════════════════════════════════════════════\n');
    
    console.log('💡 Le serveur MCP peut maintenant utiliser ces endpoints pour:');
    console.log('   • Consulter et gérer les clients');
    console.log('   • Gérer les projets et tâches');
    console.log('   • Consulter les factures');
    console.log('   • Gérer les leads et tickets');
    console.log('   • Et bien plus!\n');
    
    console.log('🚀 Pour utiliser le serveur MCP:');
    console.log('   npm start\n');
    
  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
    }
    process.exit(1);
  }
}

main();
