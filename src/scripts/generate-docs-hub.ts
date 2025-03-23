#!/usr/bin/env node
// src/scripts/generate-docs-hub.ts
import fs from 'fs';
import path from 'path';
import { documentationMetadata, toolDocumentationMap, ToolDocumentation } from '../utils/documentation-metadata.js';

/**
 * Generate a documentation hub markdown file
 * @param outputPath Path to write the documentation hub file
 */
async function generateDocumentationHub(outputPath: string = 'DOCUMENTATION_HUB.md') {
  console.log(`Generating documentation hub at ${outputPath}...`);

  let markdown = '# Claude Desktop Commander Documentation Hub\n\n';
  
  // Add a general introduction
  markdown += 'This documentation hub provides a central location to find information about all tools and features available in Claude Desktop Commander.\n\n';
  
  // Section 1: Documentation by Tool
  markdown += '## Documentation by Tool\n\n';
  Object.entries(toolDocumentationMap).forEach(([tool, paths]) => {
    markdown += `### ${tool}\n\n`;
    paths.forEach((path: string) => {
      const doc = documentationMetadata.find((d: ToolDocumentation) => d.path === path);
      if (doc) {
        markdown += `- [${doc.name}](${path}) - ${doc.description}\n`;
      } else {
        markdown += `- [${path}](${path})\n`;
      }
    });
    markdown += '\n';
  });
  
  // Section 2: All Documentation Files
  markdown += '## All Documentation Files\n\n';
  documentationMetadata.forEach(doc => {
    markdown += `### [${doc.name}](${doc.path})\n\n`;
    markdown += `${doc.description}\n\n`;
    markdown += `**Tools Covered**: ${doc.toolCoverage.join(', ')}\n\n`;
    markdown += `**Last Updated**: ${doc.lastUpdated.toDateString()}\n\n`;
  });
  
  // Section 3: Recently Updated Documentation
  markdown += '## Recently Updated Documentation\n\n';
  const recentDocs = [...documentationMetadata]
    .sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime())
    .slice(0, 5);
  
  recentDocs.forEach(doc => {
    markdown += `- [${doc.name}](${doc.path}) - Last updated on ${doc.lastUpdated.toDateString()}\n`;
  });
  
  // Write the file
  try {
    // Ensure the file exists (create if it doesn't)
    await fs.promises.writeFile(outputPath, markdown);
    console.log(`Documentation hub generated successfully at ${outputPath}`);
    return true;
  } catch (error) {
    console.error('Error generating documentation hub:', error);
    return false;
  }
}

// Run the generator if this script is executed directly
// For ES modules, we need to use a different way to check if this is the main module
if (import.meta.url.endsWith(process.argv[1])) {
  const outputPath = process.argv[2] || 'DOCUMENTATION_HUB.md';
  generateDocumentationHub(outputPath)
    .then(success => {
      if (success) {
        console.log('Documentation hub generation completed successfully.');
      } else {
        console.error('Documentation hub generation failed.');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Error during documentation hub generation:', error);
      process.exit(1);
    });
}

export { generateDocumentationHub };