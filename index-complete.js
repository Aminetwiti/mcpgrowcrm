#!/usr/bin/env node

/**
 * ============================================================================
 * SERVEUR MCP GROWCRM - VERSION COMPLÈTE AVEC TOUTES LES FONCTIONNALITÉS
 * ============================================================================
 * 
 * Ce fichier contient 38+ outils MCP pour interagir avec GROWCRM via API REST
 * 
 * Installation:
 * 1. Remplacez index.js par ce fichier
 * 2. Assurez-vous que l'API REST Laravel est configurée
 * 3. Configurez .env avec AUTH_MODE=token
 * 4. npm start
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const GROWCRM_BASE_URL = process.env.GROWCRM_BASE_URL || 'https://app.ty-dev.fr/api/v1';
const AUTH_MODE = process.env.AUTH_MODE || 'token';
const API_TOKEN = process.env.GROWCRM_API_TOKEN;
const DEBUG = process.env.DEBUG === 'true';

// Client API configuré
const apiClient = axios.create({
  baseURL: GROWCRM_BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Ajouter le token d'authentification si disponible
if (AUTH_MODE === 'token' && API_TOKEN) {
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${API_TOKEN}`;
}

function log(...args) {
  if (DEBUG) {
    console.error('[GROWCRM MCP]', ...args);
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

// ============================================================================
// DÉFINITION DE TOUS LES OUTILS MCP (38 OUTILS)
// ============================================================================

const TOOLS = [
  // ========== CLIENTS (5 outils) ==========
  {
    name: 'list_clients',
    description: 'Récupérer la liste des clients avec pagination et filtres',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number', description: 'Numéro de page' },
        per_page: { type: 'number', description: 'Nombre de résultats par page (défaut: 15)' },
        search: { type: 'string', description: 'Rechercher par nom ou email' },
        status: { type: 'string', description: 'Filtrer par statut (active, inactive)' },
        sort_by: { type: 'string', description: 'Trier par (client_created, client_company_name)' },
        sort_order: { type: 'string', description: 'Ordre (asc, desc)' }
      }
    }
  },
  {
    name: 'get_client',
    description: 'Obtenir les détails d\'un client spécifique',
    inputSchema: {
      type: 'object',
      properties: {
        client_id: { type: 'number', description: 'ID du client', required: true }
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
        client_company_name: { type: 'string', description: 'Nom de l\'entreprise', required: true },
        client_email: { type: 'string', description: 'Email du client', required: true },
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
        client_id: { type: 'number', description: 'ID du client', required: true },
        client_company_name: { type: 'string', description: 'Nom de l\'entreprise' },
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
        client_id: { type: 'number', description: 'ID du client', required: true }
      },
      required: ['client_id']
    }
  },

  // ========== PROJECTS (5 outils) ==========
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
    description: 'Obtenir les détails d\'un projet',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: { type: 'number', description: 'ID du projet', required: true }
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
        project_title: { type: 'string', description: 'Titre du projet', required: true },
        project_clientid: { type: 'number', description: 'ID du client', required: true },
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
        project_id: { type: 'number', description: 'ID du projet', required: true },
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
        project_id: { type: 'number', description: 'ID du projet', required: true }
      },
      required: ['project_id']
    }
  },

  // ========== TASKS (5 outils) ==========
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
    description: 'Obtenir les détails d\'une tâche',
    inputSchema: {
      type: 'object',
      properties: {
        task_id: { type: 'number', description: 'ID de la tâche', required: true }
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
        task_title: { type: 'string', description: 'Titre de la tâche', required: true },
        task_projectid: { type: 'number', description: 'ID du projet', required: true },
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
        task_id: { type: 'number', description: 'ID de la tâche', required: true },
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
        task_id: { type: 'number', description: 'ID de la tâche', required: true }
      },
      required: ['task_id']
    }
  },

  // ========== INVOICES (4 outils) ==========
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
    description: 'Obtenir les détails d\'une facture',
    inputSchema: {
      type: 'object',
      properties: {
        invoice_id: { type: 'number', description: 'ID de la facture', required: true }
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
        bill_clientid: { type: 'number', description: 'ID du client', required: true },
        bill_projectid: { type: 'number', description: 'ID du projet (optionnel)' },
        bill_date: { type: 'string', description: 'Date de la facture (YYYY-MM-DD)' },
        bill_due_date: { type: 'string', description: 'Date d\'échéance (YYYY-MM-DD)' },
        items: { type: 'array', description: 'Liste des lignes de facture' }
      },
      required: ['bill_clientid']
    }
  },
  {
    name: 'update_invoice_status',
    description: 'Mettre à jour le statut d\'une facture',
    inputSchema: {
      type: 'object',
      properties: {
        invoice_id: { type: 'number', description: 'ID de la facture', required: true },
        status: { type: 'string', description: 'Nouveau statut (paid, unpaid)', required: true }
      },
      required: ['invoice_id', 'status']
    }
  },

  // ========== LEADS (4 outils) ==========
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
    description: 'Obtenir les détails d\'un prospect',
    inputSchema: {
      type: 'object',
      properties: {
        lead_id: { type: 'number', description: 'ID du prospect', required: true }
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
        lead_firstname: { type: 'string', description: 'Prénom', required: true },
        lead_lastname: { type: 'string', description: 'Nom', required: true },
        lead_email: { type: 'string', description: 'Email', required: true },
        lead_phone: { type: 'string', description: 'Téléphone' },
        lead_company_name: { type: 'string', description: 'Nom de l\'entreprise' },
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
        lead_id: { type: 'number', description: 'ID du prospect', required: true }
      },
      required: ['lead_id']
    }
  },

  // ========== TICKETS (4 outils) ==========
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
    description: 'Obtenir les détails d\'un ticket',
    inputSchema: {
      type: 'object',
      properties: {
        ticket_id: { type: 'number', description: 'ID du ticket', required: true }
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
        ticket_subject: { type: 'string', description: 'Sujet du ticket', required: true },
        ticket_message: { type: 'string', description: 'Message', required: true },
        ticket_priority: { type: 'string', description: 'Priorité (low, medium, high)' },
        ticket_clientid: { type: 'number', description: 'ID du client' }
      },
      required: ['ticket_subject', 'ticket_message']
    }
  },
  {
    name: 'update_ticket_status',
    description: 'Mettre à jour le statut d\'un ticket',
    inputSchema: {
      type: 'object',
      properties: {
        ticket_id: { type: 'number', description: 'ID du ticket', required: true },
        status: { type: 'string', description: 'Nouveau statut (open, closed, pending)', required: true }
      },
      required: ['ticket_id', 'status']
    }
  },

  // ========== ESTIMATES (3 outils) ==========
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
        estimate_clientid: { type: 'number', description: 'ID du client', required: true },
        estimate_date: { type: 'string', description: 'Date du devis (YYYY-MM-DD)' },
        estimate_expiry_date: { type: 'string', description: 'Date d\'expiration (YYYY-MM-DD)' },
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
        estimate_id: { type: 'number', description: 'ID du devis', required: true }
      },
      required: ['estimate_id']
    }
  },

  // ========== EXPENSES (2 outils) ==========
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
        expense_description: { type: 'string', description: 'Description', required: true },
        expense_amount: { type: 'number', description: 'Montant', required: true },
        expense_date: { type: 'string', description: 'Date (YYYY-MM-DD)' },
        expense_projectid: { type: 'number', description: 'ID du projet' },
        expense_billable: { type: 'string', description: 'Facturable (yes/no)' }
      },
      required: ['expense_description', 'expense_amount']
    }
  },

  // ========== CONTRACTS (2 outils) ==========
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
        doc_title: { type: 'string', description: 'Titre du contrat', required: true },
        doc_clientid: { type: 'number', description: 'ID du client', required: true },
        doc_contract_date: { type: 'string', description: 'Date du contrat (YYYY-MM-DD)' },
        doc_start_date: { type: 'string', description: 'Date de début (YYYY-MM-DD)' },
        doc_end_date: { type: 'string', description: 'Date de fin (YYYY-MM-DD)' }
      },
      required: ['doc_title', 'doc_clientid']
    }
  },

  // ========== DASHBOARD & STATS (1 outil) ==========
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

// ============================================================================
// GESTIONNAIRE D'OUTILS
// ============================================================================

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

      // === INVOICES ===
      case 'list_invoices':
        return await makeApiRequest('GET', '/invoices', args);
      case 'get_invoice':
        return await makeApiRequest('GET', `/invoices/${args.invoice_id}`);
      case 'create_invoice':
        return await makeApiRequest('POST', '/invoices', args);
      case 'update_invoice_status':
        return await makeApiRequest('PUT', `/invoices/${args.invoice_id}/status`, args);

      // === LEADS ===
      case 'list_leads':
        return await makeApiRequest('GET', '/leads', args);
      case 'get_lead':
        return await makeApiRequest('GET', `/leads/${args.lead_id}`);
      case 'create_lead':
        return await makeApiRequest('POST', '/leads', args);
      case 'convert_lead_to_client':
        return await makeApiRequest('POST', `/leads/${args.lead_id}/convert`);

      // === TICKETS ===
      case 'list_tickets':
        return await makeApiRequest('GET', '/tickets', args);
      case 'get_ticket':
        return await makeApiRequest('GET', `/tickets/${args.ticket_id}`);
      case 'create_ticket':
        return await makeApiRequest('POST', '/tickets', args);
      case 'update_ticket_status':
        return await makeApiRequest('PUT', `/tickets/${args.ticket_id}/status`, args);

      // === ESTIMATES ===
      case 'list_estimates':
        return await makeApiRequest('GET', '/estimates', args);
      case 'create_estimate':
        return await makeApiRequest('POST', '/estimates', args);
      case 'convert_estimate_to_invoice':
        return await makeApiRequest('POST', `/estimates/${args.estimate_id}/convert`);

      // === EXPENSES ===
      case 'list_expenses':
        return await makeApiRequest('GET', '/expenses', args);
      case 'create_expense':
        return await makeApiRequest('POST', '/expenses', args);

      // === CONTRACTS ===
      case 'list_contracts':
        return await makeApiRequest('GET', '/contracts', args);
      case 'create_contract':
        return await makeApiRequest('POST', '/contracts', args);

      // === DASHBOARD ===
      case 'get_dashboard_stats':
        return await makeApiRequest('GET', '/dashboard/stats', args);

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

// ============================================================================
// SERVEUR MCP
// ============================================================================

const server = new Server(
  {
    name: 'growcrm-mcp-server',
    version: '2.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Liste des outils
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

// Exécution des outils
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const result = await handleToolCall(name, args);
  
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
});

// Démarrage du serveur
async function main() {
  log('Démarrage du serveur MCP GROWCRM...');
  log('Mode d\'authentification:', AUTH_MODE);
  log('URL de base:', GROWCRM_BASE_URL);
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  log('Serveur MCP GROWCRM démarré avec succès!');
  log(`${TOOLS.length} outils disponibles`);
}

main().catch(console.error);
