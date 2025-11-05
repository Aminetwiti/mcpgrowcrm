# GROWCRM MCP Server

[![NPM Version](https://img.shields.io/npm/v/growcrm-mcp-server)](https://www.npmjs.com/package/growcrm-mcp-server)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Complete Model Context Protocol (MCP) server for GROWCRM - Manage your entire CRM through AI assistants like Claude, ChatGPT, and other MCP-compatible tools.

## 🚀 Quick Start

### Installation for Claude Desktop

Add this configuration to your Claude Desktop config file:

**Location:**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

**Configuration:**
```json
{
  "mcpServers": {
    "growcrm": {
      "command": "npx",
      "args": ["-y", "growcrm-mcp-server"],
      "env": {
        "GROWCRM_API_URL": "https://app.ty-dev.fr/api/v1",
        "GROWCRM_API_TOKEN": "YOUR_TOKEN_HERE"
      }
    }
  }
}
```

Get your API token from GROWCRM Settings → API.

## 📦 Alternative Installation Methods

### Via NPM
```bash
npm install -g growcrm-mcp-server
growcrm-mcp-server
```

### Via NPX (Direct)
```bash
npx -y growcrm-mcp-server
```

## 🎯 Features

**35 AI-Powered Tools** across 8 categories:

### 🧑‍💼 Client Management (5 tools)
- List, get, create, update, and delete clients
- Full client lifecycle management

### 📁 Project Management (5 tools)
- Complete project CRUD operations
- Project tracking and status updates

### ✏️ Task Management (5 tools)
- Task creation and tracking
- Status updates and assignments

### 💰 Invoicing (5 tools)
- Invoice generation and management
- Payment tracking

### 🎯 Lead Management (5 tools)
- Lead tracking and qualification
- Lead-to-client conversion

### 🎫 Support Tickets (5 tools)
- Ticket creation and tracking
- Customer support workflow

### 📋 Estimates (2 tools)
- Estimate creation and management

### 💸 Expenses (2 tools)
- Expense tracking and reporting

### 📄 Contracts (1 tool)
- Contract management

## 🔧 Environment Variables

**Required:**
- `GROWCRM_API_URL` - Your GROWCRM API endpoint
- `GROWCRM_API_TOKEN` - Your API authentication token

**Optional:**
- `GROWCRM_DEFAULT_LIMIT` - Default items per page (default: 50)
- `GROWCRM_TIMEOUT` - Request timeout in ms (default: 30000)

## 📖 Usage Examples

Ask Claude:
- "List my GROWCRM clients"
- "Create a new project called 'Website Redesign'"
- "Show me all open tickets"
- "Create an invoice for client X"
- "What are my pending tasks?"

## 🛠️ Troubleshooting

### MCP server not found
Verify Node.js is installed (>= 18.0.0):
```bash
node --version
```

### Authentication failed
Test your API token:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" https://app.ty-dev.fr/api/v1/clients
```

### Cannot connect
- Verify `GROWCRM_API_URL` is correct
- Check your internet connection
- Ensure GROWCRM instance is accessible

## 📚 Documentation

- **NPM Package**: https://www.npmjs.com/package/growcrm-mcp-server
- **Full Repository**: https://github.com/Aminetwiti/mcpgrowcrm
- **Issues**: https://github.com/Aminetwiti/growcrm-mcp-server/issues

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Support

- Open an issue on GitHub
- Email: support@growcrm.io
- Documentation: See full repository for detailed guides

---

**Made with ❤️ for the GROWCRM community**
