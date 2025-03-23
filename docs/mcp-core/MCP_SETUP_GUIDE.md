# MCP Server Setup Guide

This guide provides step-by-step instructions for setting up and configuring Model Context Protocol (MCP) servers with Claude clients. It covers both Claude Desktop and Windsurf integration.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Getting Started](#getting-started)
3. [Setting Up Claude Desktop Commander](#setting-up-claude-desktop-commander)
4. [Adding LLM API Servers](#adding-llm-api-servers)
5. [Adding Data Storage Servers](#adding-data-storage-servers)
6. [Adding External API Servers](#adding-external-api-servers)
7. [Creating Custom MCP Servers](#creating-custom-mcp-servers)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have:

- [Node.js](https://nodejs.org/) (v18 or higher) installed
- [Claude Desktop](https://claude.ai/download) installed (for Claude Desktop integration)
- [Windsurf](https://www.codeium.com/windsurf) extension installed (for Windsurf integration)
- API keys for any external services you plan to use
- Basic knowledge of JSON for editing configuration files

## Getting Started

### Understanding MCP Configuration

MCP servers are defined in configuration files:

- **Claude Desktop**: `%APPDATA%\Claude\claude_desktop_config.json` (Windows) or `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)
- **Windsurf**: `c:/Users/[username]/.codeium/windsurf/mcp_config.json` (Windows) or `~/.codeium/windsurf/mcp_config.json` (macOS/Linux)

### Configuration Format

MCP server entries follow this general structure:

```json
"server-name": {
  "command": "executable",
  "args": ["arg1", "arg2"],
  "env": {
    "ENV_VAR": "value"
  }
}
```

## Setting Up Claude Desktop Commander

The Claude Desktop Commander is a powerful MCP server that provides terminal command execution, file operations, and process management.

### For Claude Desktop

1. **Clone the repository**:
   ```bash
   git clone https://github.com/triepod-ai/ClaudeComputerCommander.git
   cd ClaudeComputerCommander
   ```

2. **Set up the server**:
   ```bash
   npm run install:all
   npm run build:mcp
   ```

3. **Use the included launcher script** (Windows) or create a shell script (macOS/Linux):
   
   **Windows (`run-desktop-commander.bat`)**:
   Already included in the repository root directory.
   
   **macOS/Linux (`run-desktop-commander.sh`)**:
   ```bash
   #!/bin/bash
   cd "$(dirname "$0")"
   cd mcp-core
   node dist/index.js
   ```
   
   Make the script executable on macOS/Linux:
   ```bash
   chmod +x run-desktop-commander.sh
   ```

4. **Update Claude Desktop config**:
   ```json
   "mcpServers": {
     "desktopCommander": {
       "command": "C:\\full\\path\\to\\ClaudeDesktopCommander\\run-desktop-commander.bat",
       "args": []
     }
   }
   ```

### For Windsurf

1. **Clone and build** as above.

2. **Update Windsurf MCP config**:
   ```json
   "mcpServers": {
     "desktop-commander": {
       "command": "node",
       "args": ["C:\\full\\path\\to\\ClaudeDesktopCommander\\mcp-core\\dist\\index.js"]
     }
   }
   ```

## Adding LLM API Servers

### Claude API Server

1. **Install package**:
   ```bash
   npm install -g claude-mcp-server
   ```

2. **Get API key** from [Anthropic Console](https://console.anthropic.com/).

3. **Add to Windsurf config**:
   ```json
   "claude": {
     "command": "npx",
     "args": ["-y", "claude-mcp-server"],
     "env": {
       "CLAUDE_API_KEY": "${ANTHROPIC_API_KEY}"
     }
   }
   ```

4. **Add to Claude Desktop config**:
   ```json
   "claude-api": {
     "command": "npx",
     "args": ["-y", "claude-mcp-server"],
     "env": {
       "CLAUDE_API_KEY": "your-api-key-here"
     }
   }
   ```

### OpenAI API Server

1. **Install package**:
   ```bash
   npm install -g openai-mcp-server
   ```

2. **Get API key** from [OpenAI Platform](https://platform.openai.com/api-keys).

3. **Add to Windsurf config**:
   ```json
   "openai": {
     "command": "npx",
     "args": ["-y", "openai-mcp-server"],
     "env": {
       "OPENAI_API_KEY": "${OPENAI_API_KEY}"
     }
   }
   ```

4. **Add to Claude Desktop config**:
   ```json
   "openai": {
     "command": "npx",
     "args": ["-y", "openai-mcp-server"],
     "env": {
       "OPENAI_API_KEY": "your-api-key-here"
     }
   }
   ```

### Other LLM Servers

Similar installation and configuration patterns apply to:
- Mistral API (`mistral-mcp-server`)
- Perplexity (`perplexity-mcp`)
- TogetherAI (using `openai-compatible-mcp-server`)
- HuggingFace (`huggingface-mcp-server`)

## Adding Data Storage Servers

### Pinecone Vector Database

1. **Install package**:
   ```bash
   npm install -g mcp-pinecone
   ```

2. **Get API key and environment** from [Pinecone Console](https://app.pinecone.io/).

3. **Add to config**:
   ```json
   "pinecone": {
     "command": "npx",
     "args": ["-y", "mcp-pinecone"],
     "env": {
       "PINECONE_API_KEY": "your-api-key-here",
       "PINECONE_ENVIRONMENT": "your-environment-here"
     }
   }
   ```

### Supabase Database

1. **Install package**:
   ```bash
   npm install -g @supabase/mcp-server-postgrest
   ```

2. **Get URL and key** from your Supabase project settings.

3. **Add to config**:
   ```json
   "supabase": {
     "command": "npx",
     "args": ["-y", "@supabase/mcp-server-postgrest"],
     "env": {
       "SUPABASE_URL": "your-project-url",
       "SUPABASE_KEY": "your-api-key"
     }
   }
   ```

### Redis Database

1. **Install package**:
   ```bash
   npm install -g redis-mcp-server
   ```

2. **Configure Redis connection**:

3. **Add to config**:
   ```json
   "redis": {
     "command": "npx",
     "args": ["-y", "redis-mcp-server"],
     "env": {
       "REDIS_URL": "redis://username:password@host:port"
     }
   }
   ```

## Adding External API Servers

### GitHub API

1. **Install package**:
   ```bash
   npm install -g github-mcp-server
   ```

2. **Generate a GitHub token** with appropriate permissions.

3. **Add to config**:
   ```json
   "github": {
     "command": "npx",
     "args": ["-y", "github-mcp-server"],
     "env": {
       "GITHUB_TOKEN": "your-github-token"
     }
   }
   ```

### Google Maps API

1. **Install package**:
   ```bash
   npm install -g google-maps-mcp
   ```

2. **Get API key** from [Google Cloud Console](https://console.cloud.google.com/).

3. **Add to config**:
   ```json
   "google-maps": {
     "command": "npx",
     "args": ["-y", "google-maps-mcp"],
     "env": {
       "GOOGLE_MAPS_API_KEY": "your-api-key"
     }
   }
   ```

### Brave Search API

1. **Install package**:
   ```bash
   npm install -g brave-search-mcp
   ```

2. **Get API key** from [Brave Search Developer Hub](https://brave.com/search/api/).

3. **Add to config**:
   ```json
   "braveapi": {
     "command": "npx",
     "args": ["-y", "brave-search-mcp"],
     "env": {
       "BRAVE_API_KEY": "your-api-key"
     }
   }
   ```

## Creating Custom MCP Servers

You can create your own MCP servers to provide custom tools and capabilities.

### TypeScript Template

1. **Install MCP SDK**:
   ```bash
   npm install @modelcontextprotocol/sdk
   ```

2. **Create a new server project**:
   ```bash
   npx @modelcontextprotocol/create-server my-custom-server
   cd my-custom-server
   ```

3. **Implement your server**:
   
   Edit `src/index.ts` to define your tools and resources:

   ```typescript
   #!/usr/bin/env node
   import { Server } from '@modelcontextprotocol/sdk/server/index.js';
   import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
   import {
     CallToolRequestSchema,
     ListToolsRequestSchema,
   } from '@modelcontextprotocol/sdk/types.js';

   class MyCustomServer {
     private server: Server;

     constructor() {
       this.server = new Server(
         {
           name: 'my-custom-server',
           version: '0.1.0',
         },
         {
           capabilities: {
             tools: {},
           },
         }
       );
       
       this.setupToolHandlers();
     }

     private setupToolHandlers() {
       this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
         tools: [
           {
             name: 'my_custom_tool',
             description: 'A custom tool',
             inputSchema: {
               type: 'object',
               properties: {
                 param1: {
                   type: 'string',
                   description: 'Parameter 1',
                 },
               },
               required: ['param1'],
             },
           },
         ],
       }));

       this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
         if (request.params.name === 'my_custom_tool') {
           // Implement your tool logic here
           return {
             content: [
               {
                 type: 'text',
                 text: `Processed: ${request.params.arguments.param1}`,
               },
             ],
           };
         }
         
         throw new Error(`Unknown tool: ${request.params.name}`);
       });
     }

     async run() {
       const transport = new StdioServerTransport();
       await this.server.connect(transport);
       console.error('Custom MCP server running on stdio');
     }
   }

   const server = new MyCustomServer();
   server.run().catch(console.error);
   ```

4. **Build your server**:
   ```bash
   npm run build
   ```

5. **Add to config**:
   ```json
   "my-custom-server": {
     "command": "node",
     "args": ["path/to/my-custom-server/build/index.js"]
   }
   ```

## Troubleshooting

### Common Issues

#### Server Not Connecting

1. **Check logs**:
   - Claude Desktop: Check the app's developer console
   - Windsurf: Check the extension output panel

2. **Verify the executable path**:
   - Ensure absolute paths are used in Claude Desktop config
   - Confirm the executable exists and is accessible

3. **Environment variables**:
   - Verify API keys and environment variables are correctly set
   - Check for typos in variable names or values

#### Permission Issues

1. **Executable permissions**:
   - On macOS/Linux, ensure scripts are executable: `chmod +x script.sh`
   - On Windows, check execution policies if using PowerShell

2. **API key permissions**:
   - Verify the API keys have the necessary permissions/scopes
   - Check if API keys are still valid (not expired or revoked)

#### Node.js and NPM Issues

1. **Version compatibility**:
   - Ensure Node.js version is compatible (v18+ recommended)
   - Check for dependency conflicts

2. **Package installation**:
   - Try reinstalling packages with `npm install -g package --force`
   - Clear npm cache: `npm cache clean --force`

### Debugging Tools

1. **Test the server directly**:
   ```bash
   node path/to/server.js
   ```
   Then type a valid JSON-RPC request to test.

2. **Enable verbose logging**:
   - Add environment variables for debugging:
     ```json
     "env": {
       "DEBUG": "mcp:*"
     }
     ```

3. **Check for configuration typos**:
   - Validate your JSON configuration with a JSON validator

## Next Steps

After successfully setting up your MCP servers:

1. Restart your Claude client (Claude Desktop or Windsurf)
2. Test each server with basic commands
3. Refer to the [MCP Tools Inventory](MCP_TOOLS_INVENTORY.md) for a complete list of available tools
4. Follow the [Testing Guide](../testing/TESTING_GUIDE.md) for thorough validation
