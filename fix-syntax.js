import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to fix syntax errors in TypeScript files
function fixSyntaxErrors(filePath) {
  console.log(`Processing: ${filePath}`);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Fix switch statement type annotations
  let updatedContent = content.replace(
    /switch\s*\(([^)]+):\s*any\)\s*{/g,
    'switch ($1) {'
  );
  
  // Fix function argument type annotations
  updatedContent = updatedContent.replace(
    /\(([^)]+):\s*any\)/g,
    '($1)'
  );
  
  // Fix trailing commas in type errors
  updatedContent = updatedContent.replace(
    /error\.message(,\s*)?/g,
    'error.message'
  );
  
  // Fix comma issues in type declarations
  updatedContent = updatedContent.replace(
    /\}\)\)/g,
    '})'
  );
  
  // Write the updated content back to the file if changes were made
  if (content !== updatedContent) {
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`Fixed syntax in: ${filePath}`);
    return true;
  }
  return false;
}

async function main() {
  try {
    // Find all TypeScript files in the code-analyzer directory
    const codeAnalyzerDir = path.join(__dirname, 'src', 'tools', 'code-analyzer');
    const tsFiles = await glob(`${codeAnalyzerDir}/**/*.ts`);
    
    let totalFilesUpdated = 0;
    
    for (const filePath of tsFiles) {
      if (fixSyntaxErrors(filePath)) {
        totalFilesUpdated++;
      }
    }
    
    console.log(`\nTotal files updated: ${totalFilesUpdated} of ${tsFiles.length}`);
  } catch (error) {
    console.error('Error fixing syntax:', error);
    process.exit(1);
  }
}

main();
