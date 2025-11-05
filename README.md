# GROWCRM MCP Server

[![Smithery](https://smithery.ai/badge/@growcrm/mcp-server)](https://smithery.ai/server/@growcrm/mcp-server)
[![NPM Version](https://img.shields.io/npm/v/@growcrm/mcp-server)](https://www.npmjs.com/package/@growcrm/mcp-server)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Complete Model Context Protocol (MCP) server for GROWCRM - Manage your entire CRM through AI assistants like Claude, ChatGPT, and other MCP-compatible tools.

## 🚀 Features

**35 AI-Powered Tools** organized across 8 categories:

### 🧑‍💼 Client Management (5 tools)
- List, get, create, update, and delete clients
- Full client lifecycle management
- Search and filter capabilities

### 📁 Project Management (5 tools)
- Complete project CRUD operations
- Project tracking and status updates
- Client-project relationships

### ✏️ Task Management (5 tools)
- Task creation and tracking
- Status updates and assignments
- Project-task associations

### 💰 Invoicing (4 tools)
- Invoice generation and management
- Status tracking (draft, sent, paid)
- Client billing integration

### 🎯 Lead Management (4 tools)
- Lead tracking and qualification
- Lead-to-client conversion
- Sales pipeline management

### 🎫 Support Tickets (4 tools)
- Ticket creation and tracking
- Status management
- Customer support workflow

### 📋 Estimates, Expenses & Contracts (7 tools)
- Estimate creation and conversion to invoices
- Expense tracking and management
- Contract lifecycle management

### 📊 Dashboard (1 tool)
- Real-time statistics and KPIs
- Business overview and metrics

## 📦 Installation

### Via Smithery

To install GROWCRM MCP Server for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@growcrm/mcp-server):

```bash
npx -y @smithery/cli install @growcrm/mcp-server --client claude
```

### Via NPX (Recommended)

```bash
npx -y @growcrm/mcp-server
```

### Via NPM

```bash
npm install -g @growcrm/mcp-server
```

### Via Docker

```bash
docker pull growcrm/mcp-server:latest
docker run -e GROWCRM_API_URL=your_url -e GROWCRM_API_TOKEN=your_token growcrm/mcp-server
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file with:

```env
GROWCRM_API_URL=https://your-growcrm-instance.com/api/v1
GROWCRM_API_TOKEN=your_sanctum_bearer_token
```

### Claude Desktop Configuration

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "growcrm": {
      "command": "npx",
      "args": ["-y", "@growcrm/mcp-server"],
      "env": {
        "GROWCRM_API_URL": "https://your-growcrm-instance.com/api/v1",
        "GROWCRM_API_TOKEN": "your_token_here"
      }
    }
  }
}
```

## 🎯 Quick Start

1. **Generate API Token** in your GROWCRM instance:
   ```bash
   php artisan tinker
   $user = User::find(1);
   $token = $user->createToken('mcp-server')->plainTextToken;
   echo $token;
   ```

2. **Configure MCP Server** with your credentials

3. **Start Using** through your AI assistant:
   - "List all my clients"
   - "Create a new project for client #5"
   - "Show me today's tasks"
   - "Generate an invoice for client Acme Corp"

## 📚 Available Tools

All 35 tools tested and validated:

| Category | Tools | Status |
|----------|-------|--------|
| **Clients** | list, get, create, update, delete | ✅ Tested |
| **Projects** | list, get, create, update, delete | ✅ Tested |
| **Tasks** | list, get, create, update, delete | ✅ Tested |
| **Invoices** | list, get, create, update_status | ✅ Tested |
| **Leads** | list, get, create, convert | ✅ Tested |
| **Tickets** | list, get, create, update_status | ✅ Tested |
| **Estimates** | list, create, convert | ✅ Tested |
| **Expenses** | list, create | ✅ Tested |
| **Contracts** | list, create | ✅ Tested |
| **Dashboard** | get_stats | ✅ Tested |

## 📚 Documentation

- [Quickstart Guide](QUICKSTART.md)
- [API Documentation](API_REST_GUIDE.md)
- [Docker Deployment](DOCKER_GUIDE.md)
- [NPX Usage Guide](ACCES_NPX.md)
- [Complete Project Documentation](PROJET_COMPLET.md)

## 🧪 Testing

All 35 tools have been systematically tested with real data:

```bash
# Run tests
npm test

# Test specific category
npm test -- clients
```

See [Mission Accomplie](MISSION_ACCOMPLIE.md) for detailed test results.

## 🔒 Security

- ✅ Laravel Sanctum authentication
- ✅ Bearer token-based API access
- ✅ Secure environment variable configuration
- ✅ No credentials stored in code
- ✅ HTTPS-only communication

## 🐳 Docker Support

Full Docker support with:
- Multi-stage builds
- Alpine Linux (minimal footprint)
- Health checks
- Production-ready configuration

See [Docker Guide](DOCKER_GUIDE.md) for details.

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/Aminetwiti/mcpgrowcrm/issues)
- **Email**: support@growcrm.io
- **Documentation**: [Full Docs](https://github.com/Aminetwiti/mcpgrowcrm)

## 🌟 Acknowledgments

Built with:
- [Model Context Protocol SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [GROWCRM](https://growcrm.io)
- [Laravel](https://laravel.com)
- [Docker](https://docker.com)

## 📊 Stats

- **35** AI-powered tools
- **8** business categories
- **100%** test coverage
- **Production-ready**

---

**Made with ❤️ by the GROWCRM Team**

[⬆ Back to top](#growcrm-mcp-server)
