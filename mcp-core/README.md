# MCP Core Server

This is the core component of the Claude Desktop Commander, providing the main Model Context Protocol (MCP) server functionality.

## Features

- Command execution with timeout support
- Terminal session management
- Process listing and management
- File operations (read, write, edit, search)
- Directory operations (list, create)
- Command blocking and security

## Directory Structure

- `src/`: TypeScript source files
- `dist/`: Compiled JavaScript files
- `scripts/`: Utility scripts
- `logs/`: Log files

## Building

```bash
# Install dependencies
npm install

# Build the project
npm run build
```

## Running

```bash
# Start the MCP server
npm start

# Or use the batch file
run-desktop-commander.bat
```

## Configuration

The server can be configured through the `config.json` file in the root directory.

## Dependencies

See `package.json` for the list of dependencies.
