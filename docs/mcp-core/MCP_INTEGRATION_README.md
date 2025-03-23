# MCP Server Integration Guide

This document explains how to properly configure and integrate MCP (Model Context Protocol) servers with both Claude Desktop and Windsurf.

## Overview

MCP allows Claude to access additional tools and capabilities through external servers. The Claude Desktop Commander project provides powerful tools for terminal command execution, file operations, and process management.

Currently, we have successfully integrated with:
- Claude Desktop app
- Windsurf IDE extension

## Windsurf Integration

### Windsurf MCP Configuration Format

Windsurf uses a dedicated MCP configuration file located at:
```
c:/Users/[username]/.codeium/windsurf/mcp_config.json
```

This configuration follows this format:

```json
{
  "env": {
    "VARIABLE_NAME": "${VARIABLE_NAME}",
    "API_KEY_NAME": "${API_KEY_NAME}"
  },
  "mcpServers": {
    "serverName": {
      "command": "executable",
      "args": [
        "ARG1",
        "ARG2"
      ],
      "env": {
        "SERVER_SPECIFIC_ENV": "${ENV_VARIABLE}"
      }
    }
  }
}
```

### Available MCP Servers for Windsurf

We have successfully integrated 16 MCP servers with Windsurf:

1. **desktop-commander**: File operations and command execution
   ```json
   "desktop-commander": {
     "command": "node",
     "args": ["L:\\ClaudeDesktopCommander\\mcp-core\\dist\\index.js"]
   }
   ```

2. **LLM API Servers**:
   - claude
   - openai
   - grok
   - groq
   - mistral
   - perplexity
   - togetherai
   - huggingface

3. **Data Storage Servers**:
   - pinecone
   - supabase
   - redis

4. **External API Servers**:
   - github
   - google-maps
   - braveapi

5. **Filesystem Server**:
   - filesystem

## Claude Desktop Integration

### Claude Desktop Configuration Format

The Claude Desktop app uses a specific format in its configuration file to specify MCP servers, typically located at:
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "apiKey": "YOUR_ANTHROPIC_API_KEY",
  "serverConfig": {
    "command": "cmd.exe",
    "args": [
      "/c"
    ]
  },
  "mcpServers": {
    "serverName": {
      "command": "FULL_PATH_TO_EXECUTABLE",
      "args": [
        "ARG1",
        "ARG2",
        "etc"
      ]
    }
  }
}
```

### Configuration Components:

1. **apiKey**: Your Anthropic API key for Claude
2. **serverConfig**: Base configuration for command execution
3. **mcpServers**: Collection of MCP servers, each with:
   - A unique name as the key (e.g., "desktopCommander")
   - A `command` field with the full path to the executable
   - An `args` array with command-line arguments

### Claude Desktop Commander MCP Server

We've configured our Desktop Commander MCP server using a batch script approach:

```json
"desktopCommander": {
  "command": "L:\\ClaudeDesktopCommander\\run-desktop-commander.bat",
  "args": []
}
```

The batch script (`run-desktop-commander.bat`) ensures:
1. The correct working directory is set
2. Absolute paths are used for all components
3. The Node.js executable is properly referenced

### Alternative Configuration Methods

#### Direct Node.js Execution

```json
"desktopCommander": {
  "command": "C:\\Program Files\\nodejs\\node.exe",
  "args": [
    "L:\\ClaudeDesktopCommander\\mcp-core\\dist\\index.js"
  ]
}
```

#### Python-based MCP Servers Example

For Python-based MCP servers using `uv`:

```json
"weather": {
  "command": "C:\\full\\path\\to\\uv.exe",
  "args": [
    "--directory",
    "C:\\ABSOLUTE\\PATH\\TO\\PARENT\\FOLDER\\weather",
    "run",
    "weather.py"
  ]
}
```

## Key Differences Between Windsurf and Claude Desktop Configuration

| Feature | Windsurf | Claude Desktop |
|---------|----------|---------------|
| Configuration Location | `c:/Users/[username]/.codeium/windsurf/mcp_config.json` | `%APPDATA%\Claude\claude_desktop_config.json` |
| Environment Variables | Supports global and per-server env variables | Limited env variable support |
| Paths | Relative paths may work | Must use absolute paths |
| Server Naming | More standardized naming conventions | Flexible naming |

## MCP Tools Inventory

The following tools are available through our configured MCP servers:

### Desktop Commander Tools
- Command execution with timeout and background support
- Process management (list/kill)
- File operations (read/write/search)
- File editing with search/replace blocks

### LLM API Tools
- Text generation
- Embeddings
- Chat completions
- Function calling

### Data Storage Tools
- Vector database operations (Pinecone)
- SQL queries (Supabase)
- Key-value operations (Redis)

### External API Tools
- GitHub repository management
- Google Maps location services
- Brave Search web queries

## Testing MCP Integration

Use the provided test scripts to verify integration:

1. `run-tests.bat`: Checks configuration and creates test data
2. For detailed testing, refer to the Testing Guide in the documentation.
3. See Test Report Template for documenting test results

## Troubleshooting

If your Claude client fails to connect to your MCP server:

1. Check that the client has been restarted after configuration changes
2. Verify that all paths in the configuration are correct (absolute paths for Claude Desktop)
3. Confirm the executable specified in `command` exists and is accessible
4. Check logs in the client app for error messages
5. Try running the MCP server directly from the command line to verify it works

### Common Issues with Windsurf Integration

- Environment variables not properly set
- Relative paths causing issues
- Missing API keys
- Incompatible server versions

### Common Issues with Claude Desktop Integration

- Absolute paths not used
- Incorrect Node.js path
- Missing batch script
- Server not executable
- Restart needed after configuration changes

## Important Notes

- For Claude Desktop, always use absolute paths in the configuration
- For Windsurf, use consistent environment variable patterns
- Make sure executables have appropriate permissions
- Restart clients after making changes to configurations
- Batch scripts can help manage complex startup requirements
