import { findDocumentationForTool, getDocumentationDetails } from './dist/utils/documentation-helper.js';

const toolName = 'code_analyzer';
const docs = findDocumentationForTool(toolName);

console.log(`Documentation for ${toolName}:`);
docs.forEach(path => {
  const details = getDocumentationDetails(path);
  if (details) {
    console.log(`- ${details.name}: ${path}`);
    console.log(`  ${details.description}`);
    console.log(`  Last updated: ${details.lastUpdated.toDateString()}`);
  } else {
    console.log(`- ${path} (No details available)`);
  }
});
