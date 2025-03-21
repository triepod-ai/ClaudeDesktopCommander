# Claude Desktop Commander MCP

[![npm downloads](https://img.shields.io/npm/dw/@triepod-ai/desktop-commander)](https://www.npmjs.com/package/@triepod-ai/desktop-commander)

Terminal commands, diff-based file editing, and comprehensive logging for Claude AI assistants. Integrates with both Claude Desktop and Windsurf IDE extension.

## Documentation

- [MCP Integration Guide](./MCP_INTEGRATION_README.md) - How to integrate MCP servers with Claude Desktop and Windsurf
- [MCP Tools Inventory](./MCP_TOOLS_INVENTORY.md) - Complete inventory of all available MCP tools
- [MCP Setup Guide](./MCP_SETUP_GUIDE.md) - Step-by-step instructions for setting up MCP servers
- [Dependency Management](./DEPENDENCY_MANAGEMENT.md) - How dependencies are managed
- [Testing Guide](./TESTING_GUIDE.md) - How to test MCP server integration

<p align="center">
  <a href="https://github.com/triepod-ai/ClaudeComputerCommander">
    <img width="380" src="https://raw.githubusercontent.com/triepod-ai/ClaudeComputerCommander/main/assets/triepod-logo.png" alt="Triepod AI" />
  </a>
</p>

This is a server that allows Claude desktop app to execute long-running terminal commands on your computer and manage processes through Model Context Protocol (MCP). Built on top of [MCP Filesystem Server](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem) to provide additional search and replace file editing capabilities, with enhanced logging and error handling.

> **Note:** This project is a fork of [wonderwhy-er/ClaudeComputerCommander](https://github.com/wonderwhy-er/ClaudeComputerCommander) with additional features and improvements.

## Features

- Execute terminal commands with output streaming
- Command timeout and background execution support
- Process management (list and kill processes)
- Session management for long-running commands
- Full filesystem operations:
  - Read/write files
  - Create/list directories
  - Move files/directories
  - Search files
  - Get file metadata
- Code editing capabilities:
  - Surgical text replacements for small changes
  - Full file rewrites for major changes
  - Multiple file support
  - Pattern-based replacements
- Comprehensive logging system:
  - File-based logging with rotation
  - **Advanced SQLite database logging**
  - Configurable log levels and formats
  - Detailed error tracking and diagnostics
- **Dependency Management System**:
  - Automated risk-based dependency updates
  - Package health monitoring
  - Incremental update strategy for critical dependencies

## Installation
First, ensure you've downloaded and installed the [Claude Desktop app](https://claude.ai/download) and you have [npm installed](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

### Option 1: Install through npx
Just run this in terminal
```
npx @triepod-ai/desktop-commander setup
```
Restart Claude if running

### Option 2: Add to claude_desktop_config by hand
Add this entry to your claude_desktop_config.json (on Mac, found at ~/Library/Application\ Support/Claude/claude_desktop_config.json):
```json
{
  "mcpServers": {
    "desktop-commander": {
      "command": "npx",
      "args": [
        "-y",
        "@triepod-ai/desktop-commander"
      ]
    }
  }
}
```
Restart Claude if running

### Option 3: Checkout locally
1. Clone and build:
```bash
git clone https://github.com/triepod-ai/ClaudeComputerCommander.git
cd ClaudeComputerCommander
npm run setup
```
Restart Claude if running

The setup command will:
- Install dependencies
- Build the server
- Configure Claude's desktop app
- Add MCP servers to Claude's config if needed

## Usage

The server provides these tool categories:

### Terminal Tools
- `execute_command`: Run commands with configurable timeout
- `read_output`: Get output from long-running commands
- `force_terminate`: Stop running command sessions
- `list_sessions`: View active command sessions
- `list_processes`: View system processes
- `kill_process`: Terminate processes by PID
- `block_command`/`unblock_command`: Manage command blacklist

### Filesystem Tools
- `read_file`/`write_file`: File operations
- `create_directory`/`list_directory`: Directory management  
- `move_file`: Move/rename files
- `search_files`: Pattern-based file search
- `get_file_info`: File metadata

### Edit Tools
- `edit_block`: Apply surgical text replacements (best for changes <20% of file size)
- `write_file`: Complete file rewrites (best for large changes >20% or when edit_block fails)

Search/Replace Block Format:
```
filepath.ext
<<<<<<< SEARCH
existing code to replace
=======
new code to insert
>>>>>>> REPLACE
```

Example:
```
src/main.js
<<<<<<< SEARCH
console.log("old message");
=======
console.log("new message");
>>>>>>> REPLACE
```

## SQLite Logging System

The enhanced SQLite logging system provides robust database logging capabilities:

- **Structured Logging**: Store logs in a structured format for advanced querying
- **Efficient Storage**: Optimized schema for better performance and reduced storage needs
- **Query Capabilities**: Filter, search, and analyze logs using SQL
- **Batch Processing**: Configurable batching for improved performance
- **Automatic Rotation**: Log rotation and management to prevent database bloat

Configure SQLite logging in your `config.json`:

```json
{
  "logging": {
    "database": {
      "enabled": true,
      "sqlite": {
        "path": "./logs/logs.db",
        "batchSize": 100,
        "flushInterval": 5000
      }
    }
  }
}
```

## Dependency Management

The dependency management system helps keep your dependencies secure and up-to-date:

- **Risk-Based Updates**: Dependencies are categorized by update risk (low, medium, high)
- **Staged Updates**: Updates are applied in batches with testing between each stage
- **Incremental Approach**: Critical dependencies use a stepped update approach for safety
- **Rollback Support**: Automatic backups and rollback capability if updates fail
- **Comprehensive Reporting**: Detailed reports of all update operations

Use the dependency update script:

```bash
# Show what would be updated without making changes
node scripts/update-dependencies.js --dry-run

# Only update patch versions (safer)
node scripts/update-dependencies.js --patch-only

# Run full update
node scripts/update-dependencies.js
```

For detailed documentation on dependency management, see [DEPENDENCY_MANAGEMENT.md](./DEPENDENCY_MANAGEMENT.md).

## Handling Long-Running Commands

For commands that may take a while:

1. `execute_command` returns after timeout with initial output
2. Command continues in background
3. Use `read_output` with PID to get new output
4. Use `force_terminate` to stop if needed

## Model Context Protocol Integration

We've successfully integrated 16 MCP servers with Claude clients:

1. **Desktop Commander**: File operations, command execution, and process management
2. **LLM API Servers**: claude, openai, grok, groq, mistral, perplexity, togetherai, huggingface
3. **Data Storage Servers**: pinecone, supabase, redis
4. **External API Servers**: github, google-maps, braveapi
5. **Filesystem Server**: filesystem

This project extends the MCP Filesystem Server to enable:
- Local server support in Claude Desktop and Windsurf
- Full system command execution with background processing
- Process management and tracking
- Advanced file operations
- Code editing with search/replace blocks

## Configuration

The server can be configured using the `config.json` file:

```json
{
  "blockedCommands": ["sudo", "rm", "format", ...],
  "logging": {
    "level": "info",
    "format": "simple",
    "file": {
      "enabled": true,
      "defaultPath": "./logs",
      "clientPath": "./logs/client",
      "maxSize": 5242880,
      "maxFiles": 5
    },
    "database": {
      "enabled": true,
      "sqlite": {
        "path": "./logs/logs.db",
        "batchSize": 100,
        "flushInterval": 5000
      }
    }
  }
}
```

For detailed documentation on all features and configuration options, see [DOCUMENTATION.md](./DOCUMENTATION.md).

## Contributing

If you find this project useful, please consider giving it a ⭐ star on GitHub! This helps others discover the project and encourages further development.

We welcome contributions from the community! Whether you've found a bug, have a feature request, or want to contribute code, here's how you can help:

- **Found a bug?** Open an issue at [github.com/triepod-ai/ClaudeComputerCommander/issues](https://github.com/triepod-ai/ClaudeComputerCommander/issues)
- **Have a feature idea?** Submit a feature request in the issues section
- **Want to contribute code?** Fork the repository, create a branch, and submit a pull request
- **Questions or discussions?** Start a discussion in the GitHub Discussions tab

All contributions, big or small, are greatly appreciated!

## Recent Enhancements

- **Robust Dependency Management**: New script for safe, categorized updates with detailed reporting and documentation
- **Advanced SQLite Logging**: Improved database schema, query optimization, and expanded logging capabilities
- **Package Updates**: All dependencies updated to latest stable versions
- **Improved Setup Script**: Better directory creation logic and error handling
- **Better Error Handling**: Structured error tracking and recovery
- **Command Execution Improvements**: More detailed tracking and logging of command execution
- **Updated Documentation**: Comprehensive documentation of all features and capabilities

## License

MIT
