# Claude Desktop Commander (Reorganized)

This project has been restructured to properly separate components into a clean architecture:

## Project Structure

```
ClaudeDesktopCommander/
├── mcp-core/              # Core MCP server functionality
│   ├── src/               # TypeScript source files
│   ├── package.json       # Core dependencies
│   ├── tsconfig.json      # TypeScript configuration
│   └── run-desktop-commander.bat  # Launch script for core MCP
│
├── code-analyzer/         # Code analysis component
│   ├── src/               # TypeScript source files
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
├── _archive/              # Archived temporary files and obsolete components
│
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

### Building the Core MCP Server

```bash
cd mcp-core
npm install
npm run build
```

### Running the Core MCP Server

Use the main launcher script in the root directory:

```bash
run-desktop-commander.bat
```

### Building the Code Analyzer

```bash
cd code-analyzer
npm install
npm run build
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

## Future Development

Each component can now be developed, tested, and versioned independently. The modular structure allows for:

1. Independent dependency management
2. Clearer separation of concerns
3. Targeted testing and development
4. Easier maintenance and extension
