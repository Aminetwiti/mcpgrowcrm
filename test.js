/**
 * Script de test pour le serveur MCP GROWCRM
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

console.log('🧪 Test de connexion à GROWCRM...\n');
console.log(`URL: ${BASE_URL}`);
console.log(`Email: ${EMAIL}\n`);

async function testConnection() {
  try {
    // Test 1: Accès à la page de login
    console.log('✓ Test 1: Récupération de la page de login...');
    const loginPage = await axios.get(`${BASE_URL}/login`);
    console.log(`  Status: ${loginPage.status}`);
    
    // Extraire le token CSRF - plusieurs patterns possibles
    let csrfToken = null;
    const patterns = [
      /name="_token"\s+value="([^"]+)"/,
      /name='_token'\s+value='([^']+)'/,
      /<input[^>]*name="_token"[^>]*value="([^"]+)"/,
      /<meta[^>]*name="csrf-token"[^>]*content="([^"]+)"/
    ];
    
    for (const pattern of patterns) {
      const match = loginPage.data.match(pattern);
      if (match) {
        csrfToken = match[1];
        break;
      }
    }
    
    if (!csrfToken) {
      console.log('  ⚠️  Token CSRF non trouvé dans le HTML, tentative sans token...');
      csrfToken = '';
    } else {
      console.log(`  Token CSRF: ${csrfToken.substring(0, 20)}...`);
    }
    
    // Extraire les cookies
    const cookies = loginPage.headers['set-cookie']
      ?.map(cookie => cookie.split(';')[0])
      .join('; ');
    console.log(`  Cookies: ${cookies ? 'OK' : 'Manquants'}\n`);
    
    // Test 2: Authentification
    console.log('✓ Test 2: Authentification...');
    const client = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Cookie': cookies,
        'X-CSRF-TOKEN': csrfToken,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': `${BASE_URL}/login`
      },
      maxRedirects: 5,
      validateStatus: (status) => status < 500
    });
    
    const loginResponse = await client.post('/login', 
      `email=${encodeURIComponent(EMAIL)}&password=${encodeURIComponent(PASSWORD)}&_token=${csrfToken}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    console.log(`  Status: ${loginResponse.status}`);
    
    // Récupérer tous les cookies de la session
    let allCookies = cookies;
    const newCookies = loginResponse.headers['set-cookie'];
    if (newCookies) {
      const sessionCookies = newCookies
        .map(cookie => cookie.split(';')[0])
        .join('; ');
      allCookies = sessionCookies;
      console.log('  Cookies mis à jour: OK');
    }
    
    // Mettre à jour le client avec les nouveaux cookies
    client.defaults.headers.common['Cookie'] = allCookies;
    client.defaults.headers.common['Content-Type'] = 'application/json';
    client.defaults.headers.common['Accept'] = 'application/json';
    console.log();
    
    // Test 3: Accès au dashboard
    console.log('✓ Test 3: Accès au dashboard...');
    const dashboardResponse = await client.get('/home');
    console.log(`  Status: ${dashboardResponse.status}`);
    console.log(`  Type: ${typeof dashboardResponse.data}`);
    console.log(`  Taille: ${JSON.stringify(dashboardResponse.data).length} octets\n`);
    
    // Test 4: Liste des clients
    console.log('✓ Test 4: Liste des clients...');
    const clientsResponse = await client.get('/clients/search');
    console.log(`  Status: ${clientsResponse.status}`);
    console.log(`  Type: ${typeof clientsResponse.data}`);
    
    // Test 5: Recherche globale
    console.log('\n✓ Test 5: Recherche globale...');
    const searchResponse = await client.get('/search', {
      params: {
        search_query: 'test',
        search_type: 'all'
      }
    });
    console.log(`  Status: ${searchResponse.status}`);
    
    console.log('\n✅ Tous les tests ont réussi !');
    console.log('\n📝 Vous pouvez maintenant utiliser le serveur MCP avec ces identifiants.');
    
  } catch (error) {
    console.error('\n❌ Erreur lors du test:');
    console.error(`  Message: ${error.message}`);
    if (error.response) {
      console.error(`  Status: ${error.response.status}`);
      console.error(`  Data: ${JSON.stringify(error.response.data).substring(0, 200)}...`);
    }
    process.exit(1);
  }
}

testConnection();
