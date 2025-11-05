#!/usr/bin/env node

/**
 * Wrapper MCP simple pour utiliser avec npx (sans SSH)
 * Usage: npx node mcp-wrapper.js
 */

import axios from 'axios';
import readline from 'readline';

const API_URL = 'https://app.ty-dev.fr/api/v1';
const TOKEN = '1|ewMkTeTioHy523VhvcN7T8VM7qrQqzCBqMHlSUR7a9ae25dd';

// Mapping des tools MCP vers les endpoints API
const TOOL_MAPPING = {
  'list_clients': { method: 'GET', path: '/clients' },
  'get_client': { method: 'GET', path: '/clients/{id}' },
  'list_projects': { method: 'GET', path: '/projects' },
  'get_project': { method: 'GET', path: '/projects/{id}' },
  'list_tasks': { method: 'GET', path: '/tasks' },
  'list_invoices': { method: 'GET', path: '/invoices' },
  'list_leads': { method: 'GET', path: '/leads' },
  'list_tickets': { method: 'GET', path: '/tickets' },
  'get_dashboard_stats': { method: 'GET', path: '/dashboard' }
};

// Liste des outils disponibles
const TOOLS = Object.keys(TOOL_MAPPING).map(name => ({
  name,
  description: `Execute ${name} via GROWCRM API`,
  inputSchema: {
    type: 'object',
    properties: {}
  }
}));

// Fonction pour appeler l'API
async function callApi(tool, args) {
  const mapping = TOOL_MAPPING[tool];
  if (!mapping) {
    throw new Error(`Tool ${tool} not found`);
  }

  let url = API_URL + mapping.path;
  
  // Remplacer {id} si présent
  if (args.id || args.client_id || args.project_id) {
    const id = args.id || args.client_id || args.project_id;
    url = url.replace('{id}', id);
  }

  try {
    const response = await axios({
      method: mapping.method,
      url,
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Accept': 'application/json'
      },
      params: args
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Interface stdio MCP
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', async (line) => {
  try {
    const request = JSON.parse(line);

    if (request.method === 'initialize') {
      const response = {
        jsonrpc: '2.0',
        id: request.id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {}
          },
          serverInfo: {
            name: 'growcrm-mcp-wrapper',
            version: '1.0.0'
          }
        }
      };
      console.log(JSON.stringify(response));

    } else if (request.method === 'tools/list') {
      const response = {
        jsonrpc: '2.0',
        id: request.id,
        result: {
          tools: TOOLS
        }
      };
      console.log(JSON.stringify(response));

    } else if (request.method === 'tools/call') {
      const { name, arguments: args } = request.params;
      const result = await callApi(name, args || {});
      
      const response = {
        jsonrpc: '2.0',
        id: request.id,
        result: {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        }
      };
      console.log(JSON.stringify(response));

    } else {
      console.error(JSON.stringify({
        jsonrpc: '2.0',
        id: request.id,
        error: {
          code: -32601,
          message: 'Method not found'
        }
      }));
    }
  } catch (error) {
    console.error(JSON.stringify({
      jsonrpc: '2.0',
      error: {
        code: -32700,
        message: 'Parse error: ' + error.message
      }
    }));
  }
});

process.on('SIGINT', () => {
  rl.close();
  process.exit(0);
});
