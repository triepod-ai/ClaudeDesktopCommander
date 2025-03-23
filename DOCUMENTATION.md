# Claude Desktop Commander Documentation

This documentation provides detailed information about the Claude Desktop Commander, including its architecture, key features, and recent improvements.

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Logging System](#logging-system)
4. [Command Execution](#command-execution)
5. [File Operations](#file-operations)
6. [Enhanced Code Analyzer](#enhanced-code-analyzer)
7. [Configuration](#configuration)
8. [Forking and Contributing](#forking-and-contributing)
9. [Troubleshooting](#troubleshooting)

## Overview

Claude Desktop Commander is an MCP (Model Context Protocol) server that allows Claude to execute terminal commands on your computer, manage processes, perform file operations, and analyze codebases. It provides a bridge between the Claude AI assistant and your local machine, enabling Claude to help with tasks that require system access and deep code understanding.

Recent enhancements include:
- Enhanced code analyzer with semantic understanding and vector database storage
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
- **Code Analyzer**: Advanced codebase analysis (`tools/code-analyzer/`)

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

## Enhanced Code Analyzer

The enhanced code analyzer provides deep semantic understanding of codebases, storing analysis in a vector database and enabling natural language queries.

### Code Analyzer Architecture

The code analyzer is structured into several modular components:

1. **Scanner**: Analyzes directory structure and code files
2. **Analysis**: Uses LLM to understand code semantics
3. **Storage**: Persists analysis in a vector database
4. **Claude Interface**: Handles natural language queries

### Key Components

- **FileScanner**: Enhanced directory traversal with depth control
- **CodeChunker**: Intelligent code chunking for analysis
- **LLMAnalyzer**: Integration with local Tensor LLM
- **VectorStorage**: Qdrant vector database integration
- **QueryHandler**: Natural language query processing

### Prerequisites

The enhanced code analyzer requires:
- **Qdrant Vector Database**: Running at http://127.0.0.1:6333
- **Tensor LLM Service**: Running at http://localhost:8020

### Code Analyzer Configuration

The code analyzer can be configured in `src/tools/code-analyzer/config.ts`:

```javascript
export default {
  scanner: {
    maxDepth: 10,
    defaultIncludePatterns: ['**/*.js', '**/*.ts', '**/*.py', '**/*.java', '**/*.jsx', '**/*.tsx', '**/*.go', '**/*.rs'],
    defaultExcludePatterns: ['**/node_modules/**', '**/dist/**', '**/.git/**', '**/build/**', '**/__pycache__/**'],
    maxFileSize: 1000 * 1024, // 1MB
    chunkSize: 1000, // lines per chunk
    overlapSize: 50 // lines of overlap between chunks
  },
  llm: {
    url: 'http://localhost:8020',
    embeddingsUrl: 'http://localhost:8020/embeddings',
    temperature: 0.1,
    maxTokens: 2000,
    retryAttempts: 3,
    retryDelay: 1000
  },
  vectorDb: {
    url: 'http://127.0.0.1:6333',
    collection: 'code_analysis',
    dimensions: 1536,
    distance: 'Cosine'
  }
};
```

### Analysis Process

The code analyzer follows this process:
1. Scan a directory for code files
2. Chunk files into manageable segments
3. Analyze each chunk with the LLM
4. Generate vector embeddings for semantic understanding
5. Store analysis and embeddings in Qdrant
6. Enable natural language queries against the stored analysis

### Available Tools

- **code_analyzer**: Analyzes a codebase to extract key information
  ```
  Parameters:
  - directory: Path to analyze
  - maxDepth: Maximum directory depth to scan (default: 3)
  - filePatterns: File patterns to include (e.g. ["*.ts", "*.js"])
  - includeChunks: Whether to include chunked content in results
  - includeSummary: Whether to include a natural language summary
  - maxFileSize: Maximum file size in KB to analyze (default: 500)
  ```

- **query_codebase**: Queries the analyzed codebase using natural language
  ```
  Parameters:
  - query: Natural language query about the codebase
  - limit: Maximum number of results to return (default: 5)
  ```

### Integrating with External Tools

The code analyzer can be integrated with other development tools:
- **IDE extensions**: Direct integration with code editors
- **CI/CD pipelines**: Automated analysis during builds
- **Documentation generators**: Augmenting documentation with semantic insights

For detailed setup and usage instructions, see [CODE_ANALYZER_SETUP.md](./CODE_ANALYZER_SETUP.md).

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
- **Vector Database Connection Error**: Verify Qdrant is running at http://127.0.0.1:6333
- **LLM Service Error**: Check if Tensor LLM is running at http://localhost:8020

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
```
