/**
 * EXTENSIONS RECOMMANDÉES POUR LE SERVEUR MCP GROWCRM
 * Ajoutez ces outils dans index.js pour enrichir les fonctionnalités
 */

// ============================================================================
// 1. DEVIS / ESTIMATES (très demandé)
// ============================================================================

const ESTIMATES_TOOLS = [
  {
    name: 'create_estimate',
    description: 'Créer un nouveau devis pour un client',
    inputSchema: {
      type: 'object',
      properties: {
        estimate_clientid: {
          type: 'number',
          description: 'ID du client',
          required: true
        },
        estimate_projectid: {
          type: 'number',
          description: 'ID du projet (optionnel)'
        },
        estimate_date: {
          type: 'string',
          description: 'Date du devis (YYYY-MM-DD)'
        },
        estimate_expiry_date: {
          type: 'string',
          description: 'Date d\'expiration (YYYY-MM-DD)'
        },
        items: {
          type: 'array',
          description: 'Liste des lignes du devis',
          items: {
            type: 'object',
            properties: {
              item_description: { type: 'string' },
              item_quantity: { type: 'number' },
              item_rate: { type: 'number' },
              item_tax: { type: 'number' }
            }
          }
        }
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
        estimate_id: {
          type: 'number',
          description: 'ID du devis à convertir',
          required: true
        }
      },
      required: ['estimate_id']
    }
  }
];

// ============================================================================
// 2. DÉPENSES DÉTAILLÉES (comptabilité)
// ============================================================================

const EXPENSES_TOOLS = [
  {
    name: 'create_expense',
    description: 'Enregistrer une nouvelle dépense',
    inputSchema: {
      type: 'object',
      properties: {
        expense_description: {
          type: 'string',
          description: 'Description de la dépense',
          required: true
        },
        expense_amount: {
          type: 'number',
          description: 'Montant',
          required: true
        },
        expense_date: {
          type: 'string',
          description: 'Date de la dépense (YYYY-MM-DD)'
        },
        expense_categoryid: {
          type: 'number',
          description: 'ID de la catégorie'
        },
        expense_projectid: {
          type: 'number',
          description: 'ID du projet (optionnel)'
        },
        expense_clientid: {
          type: 'number',
          description: 'ID du client (optionnel)'
        },
        expense_billable: {
          type: 'string',
          description: 'Facturable ? (yes/no)'
        }
      },
      required: ['expense_description', 'expense_amount']
    }
  },
  {
    name: 'get_expenses_report',
    description: 'Obtenir un rapport de dépenses par période',
    inputSchema: {
      type: 'object',
      properties: {
        start_date: { type: 'string', description: 'Date de début (YYYY-MM-DD)' },
        end_date: { type: 'string', description: 'Date de fin (YYYY-MM-DD)' },
        category_id: { type: 'number', description: 'Filtrer par catégorie' },
        project_id: { type: 'number', description: 'Filtrer par projet' },
        billable: { type: 'string', description: 'Filtrer facturable (yes/no/all)' }
      }
    }
  }
];

// ============================================================================
// 3. GESTION DU TEMPS (time tracking)
// ============================================================================

const TIME_TRACKING_TOOLS = [
  {
    name: 'start_timer',
    description: 'Démarrer un chronomètre pour une tâche',
    inputSchema: {
      type: 'object',
      properties: {
        task_id: {
          type: 'number',
          description: 'ID de la tâche',
          required: true
        },
        description: {
          type: 'string',
          description: 'Description du travail'
        }
      },
      required: ['task_id']
    }
  },
  {
    name: 'stop_timer',
    description: 'Arrêter le chronomètre en cours',
    inputSchema: {
      type: 'object',
      properties: {
        timer_id: {
          type: 'number',
          description: 'ID du timer'
        }
      }
    }
  },
  {
    name: 'get_timesheet',
    description: 'Obtenir les feuilles de temps',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: { type: 'number', description: 'Filtrer par utilisateur' },
        project_id: { type: 'number', description: 'Filtrer par projet' },
        start_date: { type: 'string', description: 'Date de début (YYYY-MM-DD)' },
        end_date: { type: 'string', description: 'Date de fin (YYYY-MM-DD)' }
      }
    }
  }
];

// ============================================================================
// 4. CONTRATS (gestion documentaire)
// ============================================================================

const CONTRACTS_TOOLS = [
  {
    name: 'list_contracts',
    description: 'Lister les contrats',
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
    name: 'create_contract',
    description: 'Créer un nouveau contrat',
    inputSchema: {
      type: 'object',
      properties: {
        doc_title: { type: 'string', description: 'Titre du contrat', required: true },
        doc_clientid: { type: 'number', description: 'ID du client', required: true },
        doc_contract_date: { type: 'string', description: 'Date du contrat' },
        doc_start_date: { type: 'string', description: 'Date de début' },
        doc_end_date: { type: 'string', description: 'Date de fin' },
        doc_contract_value: { type: 'number', description: 'Valeur du contrat' }
      },
      required: ['doc_title', 'doc_clientid']
    }
  },
  {
    name: 'sign_contract',
    description: 'Signer un contrat (côté équipe)',
    inputSchema: {
      type: 'object',
      properties: {
        contract_id: { type: 'number', description: 'ID du contrat', required: true }
      },
      required: ['contract_id']
    }
  }
];

// ============================================================================
// 5. RAPPORTS & ANALYTICS (business intelligence)
// ============================================================================

const REPORTS_TOOLS = [
  {
    name: 'get_revenue_report',
    description: 'Rapport de revenus par période',
    inputSchema: {
      type: 'object',
      properties: {
        period: {
          type: 'string',
          description: 'Période: today, week, month, year, custom',
          required: true
        },
        start_date: { type: 'string', description: 'Si period=custom (YYYY-MM-DD)' },
        end_date: { type: 'string', description: 'Si period=custom (YYYY-MM-DD)' },
        group_by: { type: 'string', description: 'Grouper par: day, week, month, client, project' }
      },
      required: ['period']
    }
  },
  {
    name: 'get_project_profitability',
    description: 'Calculer la rentabilité d\'un projet',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: {
          type: 'number',
          description: 'ID du projet',
          required: true
        }
      },
      required: ['project_id']
    }
  },
  {
    name: 'get_team_performance',
    description: 'Rapport de performance de l\'équipe',
    inputSchema: {
      type: 'object',
      properties: {
        start_date: { type: 'string', description: 'Date de début (YYYY-MM-DD)' },
        end_date: { type: 'string', description: 'Date de fin (YYYY-MM-DD)' },
        user_id: { type: 'number', description: 'Filtrer par utilisateur' }
      }
    }
  }
];

// ============================================================================
// 6. NOTIFICATIONS & WEBHOOKS (automatisation)
// ============================================================================

const AUTOMATION_TOOLS = [
  {
    name: 'send_notification',
    description: 'Envoyer une notification à un utilisateur',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: { type: 'number', description: 'ID de l\'utilisateur', required: true },
        title: { type: 'string', description: 'Titre de la notification', required: true },
        message: { type: 'string', description: 'Message', required: true },
        link: { type: 'string', description: 'Lien (optionnel)' }
      },
      required: ['user_id', 'title', 'message']
    }
  },
  {
    name: 'create_reminder',
    description: 'Créer un rappel automatique',
    inputSchema: {
      type: 'object',
      properties: {
        reminder_title: { type: 'string', description: 'Titre', required: true },
        reminder_date: { type: 'string', description: 'Date du rappel (YYYY-MM-DD)', required: true },
        reminder_time: { type: 'string', description: 'Heure (HH:MM)' },
        reminder_type: { type: 'string', description: 'Type: invoice, project, task, lead' },
        reminder_related_id: { type: 'number', description: 'ID de l\'élément lié' }
      },
      required: ['reminder_title', 'reminder_date']
    }
  }
];

// ============================================================================
// 7. CATÉGORIES & TAGS (organisation)
// ============================================================================

const ORGANIZATION_TOOLS = [
  {
    name: 'list_categories',
    description: 'Lister toutes les catégories',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          description: 'Type: clients, projects, leads, invoices, expenses, items'
        }
      }
    }
  },
  {
    name: 'manage_tags',
    description: 'Gérer les tags d\'un élément',
    inputSchema: {
      type: 'object',
      properties: {
        resource_type: {
          type: 'string',
          description: 'Type: client, project, task, lead, invoice',
          required: true
        },
        resource_id: {
          type: 'number',
          description: 'ID de l\'élément',
          required: true
        },
        tags: {
          type: 'array',
          description: 'Liste des tags à ajouter',
          items: { type: 'string' }
        },
        action: {
          type: 'string',
          description: 'Action: add, remove, replace'
        }
      },
      required: ['resource_type', 'resource_id', 'tags']
    }
  }
];

// ============================================================================
// GESTIONNAIRES D'OUTILS (à ajouter dans handleToolCall)
// ============================================================================

/* 
Dans index.js, ajoutez ces cas dans la fonction handleToolCall() :

case 'create_estimate':
  return await makeApiRequest('POST', '/estimates', args);

case 'convert_estimate_to_invoice':
  return await makeApiRequest('POST', `/estimates/${args.estimate_id}/convert`, {});

case 'create_expense':
  return await makeApiRequest('POST', '/expenses', args);

case 'get_expenses_report':
  return await makeApiRequest('GET', '/expenses/report', args);

case 'start_timer':
  return await makeApiRequest('POST', '/timesheets/start', args);

case 'stop_timer':
  return await makeApiRequest('POST', '/timesheets/stop', args);

case 'get_timesheet':
  return await makeApiRequest('GET', '/timesheets/search', args);

case 'list_contracts':
  return await makeApiRequest('GET', '/contracts/search', args);

case 'create_contract':
  return await makeApiRequest('POST', '/contracts', args);

case 'sign_contract':
  return await makeApiRequest('POST', `/contracts/${args.contract_id}/sign`, {});

case 'get_revenue_report':
  return await makeApiRequest('GET', '/reports/revenue', args);

case 'get_project_profitability':
  return await makeApiRequest('GET', `/reports/project-profitability/${args.project_id}`);

case 'get_team_performance':
  return await makeApiRequest('GET', '/reports/team-performance', args);

case 'send_notification':
  return await makeApiRequest('POST', '/notifications', args);

case 'create_reminder':
  return await makeApiRequest('POST', '/reminders', args);

case 'list_categories':
  return await makeApiRequest('GET', '/categories', args);

case 'manage_tags':
  return await makeApiRequest('POST', `/tags/${args.resource_type}/${args.resource_id}`, args);
*/

// ============================================================================
// TOTAL: +22 NOUVEAUX OUTILS
// De 16 outils → 38 outils MCP disponibles !
// ============================================================================

export {
  ESTIMATES_TOOLS,
  EXPENSES_TOOLS,
  TIME_TRACKING_TOOLS,
  CONTRACTS_TOOLS,
  REPORTS_TOOLS,
  AUTOMATION_TOOLS,
  ORGANIZATION_TOOLS
};
