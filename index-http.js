#!/usr/bin/env node

/**
 * ============================================================================
 * SERVEUR MCP GROWCRM - VERSION HTTP
 * ============================================================================
 * 
 * Cette version expose le serveur MCP via HTTP en plus du mode stdio
 * Utile pour : API REST, webhooks, monitoring, tests
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

dotenv.config();

const GROWCRM_BASE_URL = process.env.GROWCRM_BASE_URL || 'https://app.ty-dev.fr/api/v1';
const AUTH_MODE = process.env.AUTH_MODE || 'token';
const API_TOKEN = process.env.GROWCRM_API_TOKEN;
const DEBUG = process.env.DEBUG === 'true';
const PORT = process.env.SERVER_PORT || 3200;

// Client API configuré
const apiClient = axios.create({
  baseURL: GROWCRM_BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Ajouter le token d'authentification
if (AUTH_MODE === 'token' && API_TOKEN) {
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${API_TOKEN}`;
}

function log(...args) {
  if (DEBUG) {
    console.error('[GROWCRM MCP HTTP]', ...args);
  }
}

/**
 * Effectuer une requête API
 */
async function makeApiRequest(method, path, data = null) {
  try {
    const config = {
      method,
      url: path,
      headers: apiClient.defaults.headers.common
    };
    
    if (data) {
      if (method === 'GET') {
        config.params = data;
      } else {
        config.data = data;
      }
    }
    
    log(`Requête ${method} vers ${path}`);
    const response = await apiClient.request(config);
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    log('Erreur API:', error.message);
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
}

// Charger les outils depuis le fichier principal
import('./index.js').then((module) => {
  const TOOLS = module.TOOLS || [];
  
  // ============================================================================
  // SERVEUR EXPRESS
  // ============================================================================
  
  const app = express();
  
  // Middleware
  app.use(cors());
  app.use(express.json());
  
  // Health check
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      version: '2.0.0',
      mode: 'http',
      auth: AUTH_MODE,
      tools: TOOLS.length,
      timestamp: new Date().toISOString()
    });
  });
  
  // Liste des outils
  app.get('/tools', (req, res) => {
    res.json({
      success: true,
      tools: TOOLS.map(t => ({
        name: t.name,
        description: t.description
      }))
    });
  });
  
  // Exécuter un outil
  app.post('/tools/:toolName', async (req, res) => {
    const { toolName } = req.params;
    const args = req.body;
    
    const tool = TOOLS.find(t => t.name === toolName);
    if (!tool) {
      return res.status(404).json({
        success: false,
        error: `Outil '${toolName}' non trouvé`
      });
    }
    
    try {
      const result = await handleToolCall(toolName, args);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
  
  // Statistiques
  app.get('/stats', async (req, res) => {
    try {
      const stats = await makeApiRequest('GET', '/dashboard/stats');
      res.json(stats);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
  
  // Documentation interactive
  app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>GROWCRM MCP Server</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
          h1 { color: #2c3e50; }
          .tool { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; }
          .tool-name { font-weight: bold; color: #3498db; }
          .endpoint { background: #2ecc71; color: white; padding: 5px 10px; border-radius: 3px; display: inline-block; }
          .status { background: #27ae60; color: white; padding: 5px 10px; border-radius: 3px; }
        </style>
      </head>
      <body>
        <h1>🚀 GROWCRM MCP Server v2.0</h1>
        <p><span class="status">✅ ONLINE</span></p>
        
        <h2>📡 Endpoints disponibles</h2>
        
        <div class="tool">
          <span class="endpoint">GET</span> <strong>/health</strong>
          <p>Vérifier l'état du serveur</p>
        </div>
        
        <div class="tool">
          <span class="endpoint">GET</span> <strong>/tools</strong>
          <p>Liste de tous les outils MCP disponibles (${TOOLS.length} outils)</p>
        </div>
        
        <div class="tool">
          <span class="endpoint">POST</span> <strong>/tools/:toolName</strong>
          <p>Exécuter un outil spécifique avec ses paramètres</p>
        </div>
        
        <div class="tool">
          <span class="endpoint">GET</span> <strong>/stats</strong>
          <p>Statistiques du dashboard GROWCRM</p>
        </div>
        
        <h2>🛠️ Outils disponibles (${TOOLS.length})</h2>
        ${TOOLS.map(t => `
          <div class="tool">
            <div class="tool-name">${t.name}</div>
            <p>${t.description}</p>
          </div>
        `).join('')}
        
        <h2>📚 Exemples d'utilisation</h2>
        <pre>
# Vérifier la santé
curl http://localhost:${PORT}/health

# Lister les outils
curl http://localhost:${PORT}/tools

# Créer un client
curl -X POST http://localhost:${PORT}/tools/create_client \\
  -H "Content-Type: application/json" \\
  -d '{"client_company_name": "Test Corp", "client_email": "test@example.com"}'

# Lister les projets
curl -X POST http://localhost:${PORT}/tools/list_projects \\
  -H "Content-Type: application/json" \\
  -d '{}'
        </pre>
        
        <footer style="margin-top: 50px; text-align: center; color: #7f8c8d;">
          <p>GROWCRM MCP Server v2.0 - Mode HTTP - Port ${PORT}</p>
        </footer>
      </body>
      </html>
    `);
  });
  
  // Gestionnaire d'erreurs
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  });
  
  // Démarrer le serveur
  app.listen(PORT, () => {
    console.log(`🚀 Serveur MCP GROWCRM démarré en mode HTTP`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`🛠️  ${TOOLS.length} outils disponibles`);
    console.log(`🔐 Auth: ${AUTH_MODE}`);
    console.log(`📖 Documentation: http://localhost:${PORT}`);
  });
  
}).catch(error => {
  console.error('Erreur lors du chargement des outils:', error);
  process.exit(1);
});

/**
 * Gestionnaire d'outils (à adapter selon votre index.js)
 */
async function handleToolCall(name, args) {
  log(`Appel de l'outil: ${name}`, args);

  try {
    switch (name) {
      // === CLIENTS ===
      case 'list_clients':
        return await makeApiRequest('GET', '/clients', args);
      case 'get_client':
        return await makeApiRequest('GET', `/clients/${args.client_id}`);
      case 'create_client':
        return await makeApiRequest('POST', '/clients', args);
      case 'update_client':
        return await makeApiRequest('PUT', `/clients/${args.client_id}`, args);
      case 'delete_client':
        return await makeApiRequest('DELETE', `/clients/${args.client_id}`);

      // === PROJECTS ===
      case 'list_projects':
        return await makeApiRequest('GET', '/projects', args);
      case 'get_project':
        return await makeApiRequest('GET', `/projects/${args.project_id}`);
      case 'create_project':
        return await makeApiRequest('POST', '/projects', args);
      case 'update_project':
        return await makeApiRequest('PUT', `/projects/${args.project_id}`, args);
      case 'delete_project':
        return await makeApiRequest('DELETE', `/projects/${args.project_id}`);

      // === TASKS ===
      case 'list_tasks':
        return await makeApiRequest('GET', '/tasks', args);
      case 'get_task':
        return await makeApiRequest('GET', `/tasks/${args.task_id}`);
      case 'create_task':
        return await makeApiRequest('POST', '/tasks', args);
      case 'update_task':
        return await makeApiRequest('PUT', `/tasks/${args.task_id}`, args);
      case 'delete_task':
        return await makeApiRequest('DELETE', `/tasks/${args.task_id}`);

      // Ajouter tous les autres outils...
      
      default:
        return {
          success: false,
          error: `Outil inconnu: ${name}`
        };
    }
  } catch (error) {
    log('Erreur lors de l\'exécution de l\'outil:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
