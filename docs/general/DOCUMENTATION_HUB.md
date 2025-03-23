# Claude Desktop Commander Documentation Hub

This documentation hub provides a central location to find information about all tools and features available in the newly reorganized Claude Desktop Commander.

## Component Documentation

### MCP Core Server

- [MCP Tools Inventory](../mcp-core/MCP_TOOLS_INVENTORY.md) - Comprehensive inventory of all tools available through MCP servers
- [MCP Setup Guide](../mcp-core/MCP_SETUP_GUIDE.md) - Step-by-step instructions for setting up MCP servers
- [MCP Integration Guide](../mcp-core/MCP_INTEGRATION_README.md) - Guide for integrating MCP servers with Claude Desktop

### Code Analyzer

- [Code Analyzer Setup](../code-analyzer/CODE_ANALYZER_SETUP.md) - Detailed setup guide for the enhanced code analyzer
- [Code Analyzer Changelog](../code-analyzer/CODE_ANALYZER_CHANGELOG.md) - Changelog tracking enhancements to the code analyzer module

### Ollama Wrapper

- [Ollama API Documentation](../../ollama-wrapper/README.md) - Documentation for the Ollama API wrapper

## Tools by Component

### MCP Core Tools

#### Terminal Management

- **execute_command**: Run commands with configurable timeout
- **read_output**: Get output from long-running commands
- **force_terminate**: Stop running command sessions
- **list_sessions**: View active command sessions
- **list_processes**: View system processes
- **kill_process**: Terminate processes by PID
- **block_command/unblock_command**: Manage command blacklist

#### File Operations

- **read_file**: Read file contents
- **write_file**: Write or replace file contents
- **create_directory**: Create a new directory
- **list_directory**: List directory contents
- **move_file**: Move or rename files
- **search_files**: Pattern-based file search
- **get_file_info**: File metadata
- **edit_block**: Apply surgical text replacements

### Code Analyzer Tools

- **code_analyzer**: Analyzes a codebase to extract key information
- **query_codebase**: Queries the analyzed codebase using natural language

### Ollama Wrapper Tools

- **ollama_inference**: Run inference with local Ollama models
- **ollama_manage_models**: List and manage Ollama models

## Installation and Setup Guides

- [MCP Setup Guide](../mcp-core/MCP_SETUP_GUIDE.md) - Setting up the MCP server
- [Code Analyzer Setup](../code-analyzer/CODE_ANALYZER_SETUP.md) - Setting up the code analyzer
- [Dependency Management](DEPENDENCY_MANAGEMENT.md) - Managing dependencies

## Testing Resources

- [Testing Guide](../testing/TESTING_GUIDE.md) - Guide for testing MCP server integration
- [Test Report Template](../testing/TEST_REPORT_TEMPLATE.md) - Template for creating test reports

## Recently Updated Documentation

- [README.md](README.md) - Updated with new project structure
- [MCP Tools Inventory](../mcp-core/MCP_TOOLS_INVENTORY.md) - Updated to reflect component separation
- [DOCUMENTATION_HUB.md](DOCUMENTATION_HUB.md) - Reorganized to match new project structure
