# Claude Desktop Commander

This project provides a powerful interface between Claude and your local machine, allowing Claude to execute commands, manage files, and analyze code on your behalf.

## Project Structure

```
ClaudeDesktopCommander/
├── mcp-core/              # Core MCP server functionality
│   ├── src/               # TypeScript source files
│   ├── dist/              # Compiled JavaScript files
│   ├── scripts/           # Utility scripts
│   ├── logs/              # Log files
│   ├── package.json       # Core dependencies
│   ├── tsconfig.json      # TypeScript configuration
│   └── run-desktop-commander.bat  # Launch script for core MCP
│
├── code-analyzer/         # Code analysis component
│   ├── src/               # TypeScript source files
│   ├── scripts/           # Analyzer-specific scripts
│   ├── package.json       # Code analyzer dependencies
│   └── tsconfig.json      # TypeScript configuration
│
├── ollama-wrapper/        # Ollama API integration
│   ├── src/               # JavaScript source files
│   ├── models/            # Ollama model configurations
│   ├── package.json       # Ollama wrapper dependencies
│   ├── run-ollama-api.bat # Windows launch script
│   └── run-ollama-api.sh  # Linux/macOS launch script
│
├── docs/                  # Documentation
│   ├── general/           # General documentation
│   ├── mcp-core/          # MCP Core documentation
│   ├── code-analyzer/     # Code Analyzer documentation
│   └── testing/           # Testing documentation
│
├── _archive/              # Archived temporary files and obsolete components
│
├── assets/                # Shared assets and resources
├── package.json           # Workspace/monorepo configuration
├── run-desktop-commander.bat  # Main launcher (points to mcp-core)
└── .gitignore             # Git ignore configuration
```

## Components

### MCP Core Server

This is the core Claude Desktop Commander MCP server that handles:
- Command execution
- File operations
- Process management
- Terminal operations

### Code Analyzer

A separate component for code analysis that includes:
- File scanning and chunking
- LLM-based code analysis
- Vector database integration
- Embedding generation

### Ollama Wrapper

A component for integrating with Ollama's API:
- Ollama model management
- Inference API integration
- Model configuration

## Building and Running

### Installing All Components

```bash
# Install dependencies for all components
npm run install:all
```

### Building the Core MCP Server

```bash
# Build the MCP core server
npm run build:mcp
```

### Running the Core MCP Server

Use the main launcher script in the root directory:

```bash
run-desktop-commander.bat
```

### Building the Code Analyzer

```bash
# Build the code analyzer
npm run build:analyzer
```

### Running the Ollama Wrapper

For Windows:
```bash
cd ollama-wrapper
run-ollama-api.bat
```

For Linux/macOS:
```bash
cd ollama-wrapper
./run-ollama-api.sh
```

## Integration with Claude Desktop

Update your Claude Desktop configuration to point to the main `run-desktop-commander.bat` file:

```json
"desktopCommander": {
  "command": "L:\\ClaudeDesktopCommander\\run-desktop-commander.bat",
  "args": []
}
```

## Documentation

Detailed documentation is available in the following files:
- [MCP Tools Inventory](../mcp-core/MCP_TOOLS_INVENTORY.md): Complete list of available tools
- [MCP Setup Guide](../mcp-core/MCP_SETUP_GUIDE.md): Setup instructions for MCP servers
- [Code Analyzer Setup](../code-analyzer/CODE_ANALYZER_SETUP.md): Setup guide for the code analyzer

## Future Development

Each component can now be developed, tested, and versioned independently. The modular structure allows for:

1. Independent dependency management
2. Clearer separation of concerns
3. Targeted testing and development
4. Easier maintenance and extension
