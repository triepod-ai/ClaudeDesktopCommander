# Claude Desktop Commander Documentation

This documentation provides detailed information about the Claude Desktop Commander, including its architecture, key features, and recent improvements.

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Logging System](#logging-system)
4. [Command Execution](#command-execution)
5. [File Operations](#file-operations)
6. [Configuration](#configuration)
7. [Forking and Contributing](#forking-and-contributing)

## Overview

Claude Desktop Commander is an MCP (Model Context Protocol) server that allows Claude to execute terminal commands on your computer, manage processes, and perform file operations. It provides a bridge between the Claude AI assistant and your local machine, enabling Claude to help with tasks that require system access.

Recent enhancements include:
- Robust error handling and logging system with SQLite integration
- Improved setup script with better directory creation logic
- Enhanced command execution and tracking
- Comprehensive logging throughout the application

## Architecture

The system is built using a modular architecture with these key components:

### Core Components
- **Server**: Main MCP server implementation (`server.ts`)
- **Command Manager**: Handles command validation and blocking (`command-manager.ts`)
- **Terminal Manager**: Manages terminal sessions and process execution (`terminal-manager.ts`)
- **Logger**: Central logging system for the application (`logger.ts`)

### Tool Modules
- **Execute**: Command execution tools (`tools/execute.ts`)
- **Process**: Process management tools (`tools/process.ts`)
- **Filesystem**: File operation tools (`tools/filesystem.ts`)
- **Edit**: File editing tools (`tools/edit.ts`)

### Utility Components
- **Logging**: Comprehensive logging implementation (`utils/logging.ts`)
- **Schemas**: Tool schema definitions (`tools/schemas.ts`)
- **Types**: TypeScript type definitions (`types.ts`)

## Logging System

The enhanced logging system provides comprehensive tracking of all operations, errors, and system events. It offers both file-based and SQLite database logging options.

### Logging Features
- Multiple transport options (File, SQLite)
- Log rotation for file-based logs
- Batch processing with in-memory buffering
- Structured logging with metadata
- Different log levels (error, warn, info, debug)
- Fallback mechanisms and error recovery

### Log Levels
- **Error**: Critical issues that prevent operation
- **Warning**: Non-critical issues that should be addressed
- **Info**: Important operational information
- **Debug**: Detailed information for troubleshooting

### Configuring Logging
Logging is configured in the `config.json` file:

```json
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
    "enabled": false,
    "sqlite": {
      "path": "./logs/logs.db",
      "batchSize": 100,
      "flushInterval": 5000
    }
  },
  "buffer": {
    "enabled": true,
    "maxSize": 1000,
    "maxAge": 10000
  },
  "fallback": {
    "maxRetries": 5,
    "retryInterval": 10000
  }
}
```

### Enabling SQLite Logging
By default, SQLite logging is disabled. To enable it, set `database.enabled` to `true` in the configuration.

## Command Execution

The command execution system allows Claude to run terminal commands with timeout and background execution support.

### Command Execution Flow
1. Command is validated against blacklist
2. Process is spawned in shell
3. Output is captured from stdout and stderr
4. Initial output is returned after timeout
5. Process continues running in background if needed
6. Additional output can be retrieved using PID

### Command Security
- Blocked commands are defined in `config.json`
- Commands are validated before execution
- Commands can be added to or removed from the blacklist

## File Operations

File operations include reading, writing, searching, and editing files. These operations are secured to work only within allowed directories.

### File Editing Strategies
- **Edit Block**: For surgical changes (<20% of file)
- **Write File**: For complete rewrites (>20% of file)

### Security Measures
- Path validation prevents access outside allowed directories
- Symlink handling prevents security bypasses
- Content validation for all operations

## Configuration

Configuration is stored in `config.json` and includes:

### Blocked Commands
Commands that are not allowed to be executed.

### Logging Configuration
Settings for the logging system, including file paths, rotation settings, and database options.

Example configuration:
```json
{
  "blockedCommands": ["sudo", "rm", "format", ...],
  "logging": {
    "level": "info",
    "format": "simple",
    ...
  }
}
```

## Forking and Contributing

### Forking to Your GitHub
To fork this repository:

1. Visit the original repository: https://github.com/wonderwhy-er/ClaudeComputerCommander
2. Click the "Fork" button in the top-right corner
3. Select your GitHub account as the destination
4. Clone your forked repository:
   ```bash
   git clone https://github.com/YOUR-USERNAME/ClaudeComputerCommander.git
   cd ClaudeComputerCommander
   ```
5. Install dependencies and build:
   ```bash
   npm install
   npm run build
   ```

### Making Changes
1. Create a new branch for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes and commit them:
   ```bash
   git add .
   git commit -m "Description of changes"
   ```
3. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
4. Create a pull request from your fork to the original repository (optional)

### Publishing Your Fork
If you want to publish your fork as a separate package:

1. Update the package name in `package.json`:
   ```json
   "name": "@your-username/desktop-commander",
   ```
2. Update other metadata as needed (version, description, repository, etc.)
3. Publish to npm:
   ```bash
   npm login
   npm publish --access public
   ```

## Troubleshooting

### Common Issues
- **Config Directory Not Found**: The setup script has been improved to properly create missing directories
- **Command Timeout**: Long-running commands will continue in the background, use `read_output` to get updates
- **Permission Errors**: Ensure Claude has appropriate permissions to access directories

### Logging
When troubleshooting, check the logs in:
- File logs: `./logs/app-file.log`
- SQLite database: `./logs/logs.db` (if enabled)

### Debugging
For more detailed logging, change the log level to "debug" in `config.json`:
```json
"logging": {
  "level": "debug",
  ...
}
