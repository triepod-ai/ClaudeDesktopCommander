// src/utils/documentation-metadata.ts
export interface ToolDocumentation {
  name: string;           // Name of the document
  path: string;           // File path relative to project root
  description: string;    // Brief description of content
  toolCoverage: string[]; // Tools documented in this file
  lastUpdated: Date;      // Last modification date
}

export const documentationMetadata: ToolDocumentation[] = [
  {
    name: "MCP Tools Inventory",
    path: "MCP_TOOLS_INVENTORY.md",
    description: "Comprehensive inventory of all tools available through MCP servers integrated with Claude",
    toolCoverage: ["execute_command", "read_file", "edit_block", "code_analyzer", "query_codebase", "list_processes", "kill_process"],
    lastUpdated: new Date("2025-03-23")
  },
  {
    name: "Enhanced Code Analyzer Setup",
    path: "CODE_ANALYZER_SETUP.md",
    description: "Detailed setup guide for the enhanced code analyzer with vector database and LLM integration",
    toolCoverage: ["code_analyzer", "query_codebase"],
    lastUpdated: new Date("2025-03-23")
  },
  {
    name: "Documentation Guide",
    path: "DOCUMENTATION.md",
    description: "Technical documentation about the Claude Desktop Commander architecture, features, and components",
    toolCoverage: ["execute_command", "read_file", "edit_block", "code_analyzer", "list_processes"],
    lastUpdated: new Date("2025-03-23")
  },
  {
    name: "MCP Integration Guide",
    path: "MCP_INTEGRATION_README.md",
    description: "Guide for integrating MCP servers with Claude Desktop and Windsurf",
    toolCoverage: ["All MCP tools"],
    lastUpdated: new Date("2025-03-23")
  },
  {
    name: "MCP Setup Guide",
    path: "MCP_SETUP_GUIDE.md",
    description: "Step-by-step instructions for setting up MCP servers",
    toolCoverage: ["All MCP tools"],
    lastUpdated: new Date("2025-03-23")
  },
  {
    name: "Dependency Management",
    path: "DEPENDENCY_MANAGEMENT.md",
    description: "Information about dependency management and update strategies",
    toolCoverage: ["N/A"],
    lastUpdated: new Date("2025-03-23")
  },
  {
    name: "Testing Guide",
    path: "TESTING_GUIDE.md",
    description: "Guide for testing MCP server integration",
    toolCoverage: ["All MCP tools"],
    lastUpdated: new Date("2025-03-23")
  },
  {
    name: "Code Analyzer Changelog",
    path: "CODE_ANALYZER_CHANGELOG.md",
    description: "Changelog tracking enhancements to the code analyzer module",
    toolCoverage: ["code_analyzer", "query_codebase"],
    lastUpdated: new Date("2025-03-23")
  },
  {
    name: "Code Analyzer Module",
    path: "src/tools/code-analyzer/index.ts",
    description: "Main entry point for the code analyzer tool implementation",
    toolCoverage: ["code_analyzer", "query_codebase"],
    lastUpdated: new Date("2025-03-23")
  },
  {
    name: "Code Analyzer Config",
    path: "src/tools/code-analyzer/config.ts",
    description: "Configuration options for the code analyzer, including LLM and vector database settings",
    toolCoverage: ["code_analyzer", "query_codebase"],
    lastUpdated: new Date("2025-03-23")
  }
];

export const toolDocumentationMap: Record<string, string[]> = {
  "execute_command": ["MCP_TOOLS_INVENTORY.md", "DOCUMENTATION.md"],
  "read_output": ["MCP_TOOLS_INVENTORY.md"],
  "force_terminate": ["MCP_TOOLS_INVENTORY.md"],
  "list_sessions": ["MCP_TOOLS_INVENTORY.md"],
  "list_processes": ["MCP_TOOLS_INVENTORY.md", "DOCUMENTATION.md"],
  "kill_process": ["MCP_TOOLS_INVENTORY.md", "DOCUMENTATION.md"],
  "block_command": ["MCP_TOOLS_INVENTORY.md"],
  "unblock_command": ["MCP_TOOLS_INVENTORY.md"],
  "read_file": ["MCP_TOOLS_INVENTORY.md", "DOCUMENTATION.md"],
  "write_file": ["MCP_TOOLS_INVENTORY.md", "DOCUMENTATION.md"],
  "create_directory": ["MCP_TOOLS_INVENTORY.md"],
  "list_directory": ["MCP_TOOLS_INVENTORY.md"],
  "move_file": ["MCP_TOOLS_INVENTORY.md"],
  "search_files": ["MCP_TOOLS_INVENTORY.md"],
  "get_file_info": ["MCP_TOOLS_INVENTORY.md"],
  "edit_block": ["MCP_TOOLS_INVENTORY.md", "DOCUMENTATION.md"],
  "code_analyzer": ["MCP_TOOLS_INVENTORY.md", "CODE_ANALYZER_SETUP.md", "DOCUMENTATION.md", "CODE_ANALYZER_CHANGELOG.md"],
  "query_codebase": ["MCP_TOOLS_INVENTORY.md", "CODE_ANALYZER_SETUP.md", "CODE_ANALYZER_CHANGELOG.md"]
};