#!/usr/bin/env node

/**
 * GROWCRM MCP Server - Wrapper CommonJS standalone
 * Compatible avec npx sur Windows/Mac/Linux sans dépendances externes
 */

const https = require('https');
const readline = require('readline');

const API_BASE_URL = process.env.GROWCRM_API_URL || 'https://app.ty-dev.fr/api/v1';
const SANCTUM_TOKEN = process.env.SANCTUM_TOKEN || '1|ewMkTeTioHy523VhvcN7T8VM7qrQqzCBqMHlSUR7a9ae25dd';

// Liste complète des 38 outils MCP GROWCRM
const TOOLS = [
  {
    name: 'list_clients',
    description: 'Récupérer la liste des clients avec pagination et filtres',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number', description: 'Numéro de page' },
        per_page: { type: 'number', description: 'Nombre de résultats par page (défaut: 15)' },
        search: { type: 'string', description: 'Rechercher par nom ou email' },
        status: { type: 'string', description: 'Filtrer par statut (active, inactive)' }
      }
    }
  },
  {
    name: 'get_client',
    description: "Obtenir les détails d'un client spécifique",
    inputSchema: {
      type: 'object',
      properties: {
        client_id: { type: 'number', description: 'ID du client' }
      },
      required: ['client_id']
    }
  },
  {
    name: 'create_client',
    description: 'Créer un nouveau client',
    inputSchema: {
      type: 'object',
      properties: {
        client_company_name: { type: 'string', description: "Nom de l'entreprise" },
        client_email: { type: 'string', description: 'Email du client' },
        client_phone: { type: 'string', description: 'Téléphone' },
        client_website: { type: 'string', description: 'Site web' },
        client_city: { type: 'string', description: 'Ville' },
        client_country: { type: 'string', description: 'Pays' }
      },
      required: ['client_company_name', 'client_email']
    }
  },
  {
    name: 'update_client',
    description: 'Mettre à jour un client existant',
    inputSchema: {
      type: 'object',
      properties: {
        client_id: { type: 'number', description: 'ID du client' },
        client_company_name: { type: 'string', description: "Nom de l'entreprise" },
        client_email: { type: 'string', description: 'Email' },
        client_phone: { type: 'string', description: 'Téléphone' },
        client_status: { type: 'string', description: 'Statut (active, inactive)' }
      },
      required: ['client_id']
    }
  },
  {
    name: 'delete_client',
    description: 'Supprimer un client',
    inputSchema: {
      type: 'object',
      properties: {
        client_id: { type: 'number', description: 'ID du client' }
      },
      required: ['client_id']
    }
  },
  {
    name: 'list_projects',
    description: 'Lister tous les projets',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number', description: 'Numéro de page' },
        per_page: { type: 'number', description: 'Résultats par page' },
        search: { type: 'string', description: 'Rechercher' },
        status: { type: 'string', description: 'Filtrer par statut' },
        client_id: { type: 'number', description: 'Filtrer par client' }
      }
    }
  },
  {
    name: 'get_project',
    description: "Obtenir les détails d'un projet",
    inputSchema: {
      type: 'object',
      properties: {
        project_id: { type: 'number', description: 'ID du projet' }
      },
      required: ['project_id']
    }
  },
  {
    name: 'create_project',
    description: 'Créer un nouveau projet',
    inputSchema: {
      type: 'object',
      properties: {
        project_title: { type: 'string', description: 'Titre du projet' },
        project_clientid: { type: 'number', description: 'ID du client' },
        project_description: { type: 'string', description: 'Description' },
        project_date_start: { type: 'string', description: 'Date de début (YYYY-MM-DD)' },
        project_date_due: { type: 'string', description: 'Date limite (YYYY-MM-DD)' },
        project_status: { type: 'string', description: 'Statut' }
      },
      required: ['project_title', 'project_clientid']
    }
  },
  {
    name: 'update_project',
    description: 'Mettre à jour un projet',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: { type: 'number', description: 'ID du projet' },
        project_title: { type: 'string', description: 'Titre' },
        project_progress: { type: 'number', description: 'Progrès (0-100)' },
        project_status: { type: 'string', description: 'Statut' }
      },
      required: ['project_id']
    }
  },
  {
    name: 'delete_project',
    description: 'Supprimer un projet',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: { type: 'number', description: 'ID du projet' }
      },
      required: ['project_id']
    }
  },
  {
    name: 'list_tasks',
    description: 'Lister toutes les tâches',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number', description: 'Numéro de page' },
        per_page: { type: 'number', description: 'Résultats par page' },
        search: { type: 'string', description: 'Rechercher' },
        status: { type: 'string', description: 'Filtrer par statut' },
        project_id: { type: 'number', description: 'Filtrer par projet' },
        priority: { type: 'string', description: 'Filtrer par priorité (low, normal, high, urgent)' }
      }
    }
  },
  {
    name: 'get_task',
    description: "Obtenir les détails d'une tâche",
    inputSchema: {
      type: 'object',
      properties: {
        task_id: { type: 'number', description: 'ID de la tâche' }
      },
      required: ['task_id']
    }
  },
  {
    name: 'create_task',
    description: 'Créer une nouvelle tâche',
    inputSchema: {
      type: 'object',
      properties: {
        task_title: { type: 'string', description: 'Titre de la tâche' },
        task_projectid: { type: 'number', description: 'ID du projet' },
        task_description: { type: 'string', description: 'Description' },
        task_priority: { type: 'string', description: 'Priorité (low, normal, high, urgent)' },
        task_date_due: { type: 'string', description: 'Date limite (YYYY-MM-DD)' },
        task_status: { type: 'string', description: 'Statut' }
      },
      required: ['task_title', 'task_projectid']
    }
  },
  {
    name: 'update_task',
    description: 'Mettre à jour une tâche',
    inputSchema: {
      type: 'object',
      properties: {
        task_id: { type: 'number', description: 'ID de la tâche' },
        task_title: { type: 'string', description: 'Titre' },
        task_status: { type: 'string', description: 'Statut' },
        task_progress: { type: 'number', description: 'Progrès (0-100)' },
        task_priority: { type: 'string', description: 'Priorité' }
      },
      required: ['task_id']
    }
  },
  {
    name: 'delete_task',
    description: 'Supprimer une tâche',
    inputSchema: {
      type: 'object',
      properties: {
        task_id: { type: 'number', description: 'ID de la tâche' }
      },
      required: ['task_id']
    }
  },
  {
    name: 'list_invoices',
    description: 'Lister toutes les factures',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number', description: 'Numéro de page' },
        per_page: { type: 'number', description: 'Résultats par page' },
        client_id: { type: 'number', description: 'Filtrer par client' },
        status: { type: 'string', description: 'Filtrer par statut (paid, unpaid, overdue)' }
      }
    }
  },
  {
    name: 'get_invoice',
    description: "Obtenir les détails d'une facture",
    inputSchema: {
      type: 'object',
      properties: {
        invoice_id: { type: 'number', description: 'ID de la facture' }
      },
      required: ['invoice_id']
    }
  },
  {
    name: 'create_invoice',
    description: 'Créer une nouvelle facture',
    inputSchema: {
      type: 'object',
      properties: {
        bill_clientid: { type: 'number', description: 'ID du client' },
        bill_projectid: { type: 'number', description: 'ID du projet (optionnel)' },
        bill_date: { type: 'string', description: 'Date de la facture (YYYY-MM-DD)' },
        bill_due_date: { type: 'string', description: "Date d'échéance (YYYY-MM-DD)" },
        items: { type: 'array', description: 'Liste des lignes de facture' }
      },
      required: ['bill_clientid']
    }
  },
  {
    name: 'update_invoice_status',
    description: "Mettre à jour le statut d'une facture",
    inputSchema: {
      type: 'object',
      properties: {
        invoice_id: { type: 'number', description: 'ID de la facture' },
        status: { type: 'string', description: 'Nouveau statut (paid, unpaid)' }
      },
      required: ['invoice_id', 'status']
    }
  },
  {
    name: 'list_leads',
    description: 'Lister tous les prospects',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number', description: 'Numéro de page' },
        per_page: { type: 'number', description: 'Résultats par page' },
        search: { type: 'string', description: 'Rechercher' },
        status: { type: 'string', description: 'Filtrer par statut' }
      }
    }
  },
  {
    name: 'get_lead',
    description: "Obtenir les détails d'un prospect",
    inputSchema: {
      type: 'object',
      properties: {
        lead_id: { type: 'number', description: 'ID du prospect' }
      },
      required: ['lead_id']
    }
  },
  {
    name: 'create_lead',
    description: 'Créer un nouveau prospect',
    inputSchema: {
      type: 'object',
      properties: {
        lead_firstname: { type: 'string', description: 'Prénom' },
        lead_lastname: { type: 'string', description: 'Nom' },
        lead_email: { type: 'string', description: 'Email' },
        lead_phone: { type: 'string', description: 'Téléphone' },
        lead_company_name: { type: 'string', description: "Nom de l'entreprise" },
        lead_source: { type: 'string', description: 'Source du lead' }
      },
      required: ['lead_firstname', 'lead_lastname', 'lead_email']
    }
  },
  {
    name: 'convert_lead_to_client',
    description: 'Convertir un prospect en client',
    inputSchema: {
      type: 'object',
      properties: {
        lead_id: { type: 'number', description: 'ID du prospect' }
      },
      required: ['lead_id']
    }
  },
  {
    name: 'list_tickets',
    description: 'Lister tous les tickets de support',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number', description: 'Numéro de page' },
        per_page: { type: 'number', description: 'Résultats par page' },
        status: { type: 'string', description: 'Filtrer par statut (open, closed, pending)' },
        priority: { type: 'string', description: 'Filtrer par priorité' }
      }
    }
  },
  {
    name: 'get_ticket',
    description: "Obtenir les détails d'un ticket",
    inputSchema: {
      type: 'object',
      properties: {
        ticket_id: { type: 'number', description: 'ID du ticket' }
      },
      required: ['ticket_id']
    }
  },
  {
    name: 'create_ticket',
    description: 'Créer un nouveau ticket de support',
    inputSchema: {
      type: 'object',
      properties: {
        ticket_subject: { type: 'string', description: 'Sujet du ticket' },
        ticket_message: { type: 'string', description: 'Message' },
        ticket_priority: { type: 'string', description: 'Priorité (low, medium, high)' },
        ticket_clientid: { type: 'number', description: 'ID du client' }
      },
      required: ['ticket_subject', 'ticket_message']
    }
  },
  {
    name: 'update_ticket_status',
    description: "Mettre à jour le statut d'un ticket",
    inputSchema: {
      type: 'object',
      properties: {
        ticket_id: { type: 'number', description: 'ID du ticket' },
        status: { type: 'string', description: 'Nouveau statut (open, closed, pending)' }
      },
      required: ['ticket_id', 'status']
    }
  },
  {
    name: 'list_estimates',
    description: 'Lister tous les devis',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number', description: 'Numéro de page' },
        client_id: { type: 'number', description: 'Filtrer par client' },
        status: { type: 'string', description: 'Filtrer par statut' }
      }
    }
  },
  {
    name: 'create_estimate',
    description: 'Créer un nouveau devis',
    inputSchema: {
      type: 'object',
      properties: {
        estimate_clientid: { type: 'number', description: 'ID du client' },
        estimate_date: { type: 'string', description: 'Date du devis (YYYY-MM-DD)' },
        estimate_expiry_date: { type: 'string', description: "Date d'expiration (YYYY-MM-DD)" },
        items: { type: 'array', description: 'Liste des lignes du devis' }
      },
      required: ['estimate_clientid']
    }
  },
  {
    name: 'convert_estimate_to_invoice',
    description: 'Convertir un devis en facture',
    inputSchema: {
      type: 'object',
      properties: {
        estimate_id: { type: 'number', description: 'ID du devis' }
      },
      required: ['estimate_id']
    }
  },
  {
    name: 'list_expenses',
    description: 'Lister toutes les dépenses',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number', description: 'Numéro de page' },
        project_id: { type: 'number', description: 'Filtrer par projet' },
        billable: { type: 'string', description: 'Filtrer par facturable (yes/no)' }
      }
    }
  },
  {
    name: 'create_expense',
    description: 'Créer une nouvelle dépense',
    inputSchema: {
      type: 'object',
      properties: {
        expense_description: { type: 'string', description: 'Description' },
        expense_amount: { type: 'number', description: 'Montant' },
        expense_date: { type: 'string', description: 'Date (YYYY-MM-DD)' },
        expense_projectid: { type: 'number', description: 'ID du projet' },
        expense_billable: { type: 'string', description: 'Facturable (yes/no)' }
      },
      required: ['expense_description', 'expense_amount']
    }
  },
  {
    name: 'list_contracts',
    description: 'Lister tous les contrats',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number', description: 'Numéro de page' },
        client_id: { type: 'number', description: 'Filtrer par client' }
      }
    }
  },
  {
    name: 'create_contract',
    description: 'Créer un nouveau contrat',
    inputSchema: {
      type: 'object',
      properties: {
        doc_title: { type: 'string', description: 'Titre du contrat' },
        doc_clientid: { type: 'number', description: 'ID du client' },
        doc_contract_date: { type: 'string', description: 'Date du contrat (YYYY-MM-DD)' },
        doc_start_date: { type: 'string', description: 'Date de début (YYYY-MM-DD)' },
        doc_end_date: { type: 'string', description: 'Date de fin (YYYY-MM-DD)' }
      },
      required: ['doc_title', 'doc_clientid']
    }
  },
  {
    name: 'get_dashboard_stats',
    description: 'Obtenir les statistiques du dashboard',
    inputSchema: {
      type: 'object',
      properties: {
        period: { type: 'string', description: 'Période (today, week, month, year)' }
      }
    }
  }
];

// Mapping des outils vers les endpoints API
const TOOL_ENDPOINT_MAP = {
  list_clients: { method: 'GET', path: '/clients' },
  get_client: { method: 'GET', path: '/clients/{client_id}' },
  create_client: { method: 'POST', path: '/clients' },
  update_client: { method: 'PUT', path: '/clients/{client_id}' },
  delete_client: { method: 'DELETE', path: '/clients/{client_id}' },
  
  list_projects: { method: 'GET', path: '/projects' },
  get_project: { method: 'GET', path: '/projects/{project_id}' },
  create_project: { method: 'POST', path: '/projects' },
  update_project: { method: 'PUT', path: '/projects/{project_id}' },
  delete_project: { method: 'DELETE', path: '/projects/{project_id}' },
  
  list_tasks: { method: 'GET', path: '/tasks' },
  get_task: { method: 'GET', path: '/tasks/{task_id}' },
  create_task: { method: 'POST', path: '/tasks' },
  update_task: { method: 'PUT', path: '/tasks/{task_id}' },
  delete_task: { method: 'DELETE', path: '/tasks/{task_id}' },
  
  list_invoices: { method: 'GET', path: '/invoices' },
  get_invoice: { method: 'GET', path: '/invoices/{invoice_id}' },
  create_invoice: { method: 'POST', path: '/invoices' },
  update_invoice_status: { method: 'PUT', path: '/invoices/{invoice_id}/status' },
  
  list_leads: { method: 'GET', path: '/leads' },
  get_lead: { method: 'GET', path: '/leads/{lead_id}' },
  create_lead: { method: 'POST', path: '/leads' },
  convert_lead_to_client: { method: 'POST', path: '/leads/{lead_id}/convert' },
  
  list_tickets: { method: 'GET', path: '/tickets' },
  get_ticket: { method: 'GET', path: '/tickets/{ticket_id}' },
  create_ticket: { method: 'POST', path: '/tickets' },
  update_ticket_status: { method: 'PUT', path: '/tickets/{ticket_id}/status' },
  
  list_estimates: { method: 'GET', path: '/estimates' },
  create_estimate: { method: 'POST', path: '/estimates' },
  convert_estimate_to_invoice: { method: 'POST', path: '/estimates/{estimate_id}/convert' },
  
  list_expenses: { method: 'GET', path: '/expenses' },
  create_expense: { method: 'POST', path: '/expenses' },
  
  list_contracts: { method: 'GET', path: '/contracts' },
  create_contract: { method: 'POST', path: '/contracts' },
  
  get_dashboard_stats: { method: 'GET', path: '/dashboard' }
};

/**
 * Appel API HTTPS natif
 */
function callAPI(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE_URL + path);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Authorization': `Bearer ${SANCTUM_TOKEN}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            resolve(body);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    
    if (data && method !== 'GET') {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

/**
 * Exécuter un outil MCP
 */
async function executeTool(toolName, args = {}) {
  const mapping = TOOL_ENDPOINT_MAP[toolName];
  if (!mapping) {
    throw new Error(`Unknown tool: ${toolName}`);
  }

  let path = mapping.path;
  
  // Remplacer les paramètres dans le path
  for (const [key, value] of Object.entries(args)) {
    path = path.replace(`{${key}}`, value);
  }
  
  // Pour GET, ajouter les query params
  if (mapping.method === 'GET' && Object.keys(args).length > 0) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(args)) {
      if (!path.includes(`{${key}}`)) {
        params.append(key, value);
      }
    }
    if (params.toString()) {
      path += '?' + params.toString();
    }
  }

  return await callAPI(mapping.method, path, mapping.method !== 'GET' ? args : null);
}

/**
 * Gestionnaire de protocole MCP stdio
 */
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', async (line) => {
  try {
    const request = JSON.parse(line);
    let response;

    switch (request.method) {
      case 'initialize':
        response = {
          jsonrpc: '2.0',
          id: request.id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: { tools: {} },
            serverInfo: {
              name: 'growcrm-mcp-server',
              version: '1.0.2'
            }
          }
        };
        break;

      case 'tools/list':
        response = {
          jsonrpc: '2.0',
          id: request.id,
          result: { tools: TOOLS }
        };
        break;

      case 'tools/call':
        try {
          const result = await executeTool(
            request.params.name,
            request.params.arguments || {}
          );
          response = {
            jsonrpc: '2.0',
            id: request.id,
            result: {
              content: [{
                type: 'text',
                text: JSON.stringify(result, null, 2)
              }]
            }
          };
        } catch (error) {
          response = {
            jsonrpc: '2.0',
            id: request.id,
            error: {
              code: -32603,
              message: error.message
            }
          };
        }
        break;

      default:
        response = {
          jsonrpc: '2.0',
          id: request.id,
          error: {
            code: -32601,
            message: 'Method not found'
          }
        };
    }

    console.log(JSON.stringify(response));
  } catch (error) {
    console.log(JSON.stringify({
      jsonrpc: '2.0',
      id: null,
      error: {
        code: -32700,
        message: `Parse error: ${error.message}`
      }
    }));
  }
});

process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));
