#!/usr/bin/env node
// src/scripts/find-docs.ts
import { findDocumentationForTool, getDocumentationDetails, listAllTools } from '../utils/documentation-helper.js';

// Simple command-line parser
function parseArgs() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  const params = args.slice(1);
  
  return { command, params };
}

// Print usage information
function printUsage() {
  console.log('Documentation Finder CLI');
  console.log('------------------------');
  console.log('Usage:');
  console.log('  find-docs tool <tool-name>     Find documentation for a specific tool');
  console.log('  find-docs list                 List all available tools');
  console.log('  find-docs help                 Show this help message');
  console.log('\nExamples:');
  console.log('  find-docs tool code_analyzer');
  console.log('  find-docs list');
}

// Find and display documentation for a tool
function findDocs(toolName: string) {
  if (!toolName) {
    console.error('Error: Please provide a tool name');
    process.exit(1);
  }
  
  const docs = findDocumentationForTool(toolName);
  
  if (docs.length === 0) {
    console.log(`No documentation found for tool: ${toolName}`);
    process.exit(0);
  }
  
  console.log(`Documentation for ${toolName}:`);
  docs.forEach((path: string) => {
    const details = getDocumentationDetails(path);
    if (details) {
      console.log(`- ${details.name}: ${path}`);
      console.log(`  ${details.description}`);
      console.log(`  Last updated: ${details.lastUpdated.toDateString()}`);
    } else {
      console.log(`- ${path} (No details available)`);
    }
  });
}

// List all available tools
function listTools() {
  const tools = listAllTools();
  console.log('Available tools:');
  tools.forEach(tool => {
    const docs = findDocumentationForTool(tool);
    console.log(`- ${tool} (${docs.length} documentation files)`);
  });
}

// Main function
function main() {
  const { command, params } = parseArgs();
  
  switch (command) {
    case 'tool':
      findDocs(params[0]);
      break;
    case 'list':
      listTools();
      break;
    case 'help':
    default:
      printUsage();
      break;
  }
}

// Run the CLI if this is the main module
if (import.meta.url.endsWith(process.argv[1])) {
  main();
}