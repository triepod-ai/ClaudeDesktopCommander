import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to fix remaining import path issues
function fixImportPaths(filePath) {
  console.log(`Fixing import paths in: ${filePath}`);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Add missing .js extensions to relative imports
  const importRegex = /import\s+(?:(?:{[^}]*}|\*\s+as\s+[^;]+|[^;{}]+)\s+from\s+)?['"](\.[^'"]*)['"]/g;
  
  let updatedContent = content.replace(importRegex, (match, importPath) => {
    if (importPath.startsWith('.') && !importPath.endsWith('.js')) {
      return match.replace(importPath, `${importPath}.js`);
    }
    return match;
  });
  
  // Write the updated content back to the file if changes were made
  if (content !== updatedContent) {
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`Fixed import paths in: ${filePath}`);
    return true;
  }
  return false;
}

// Function to fix type issues with unknown variables
function fixTypeIssues(filePath) {
  console.log(`Fixing type issues in: ${filePath}`);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Fix 'result' and 'error' is of type 'unknown'
  let updatedContent = content;
  
  // Fix JSON.parse results
  updatedContent = updatedContent.replace(
    /const\s+(\w+)\s*=\s*await\s+response\.json\(\)/g,
    'const $1: any = await response.json()'
  );
  
  // Fix error access
  updatedContent = updatedContent.replace(
    /error\.message/g,
    '(error as any).message'
  );
  
  // Fix result access
  updatedContent = updatedContent.replace(
    /result\.(\w+)/g,
    'result.$1 as any'
  );
  
  // Fix implicit any parameters
  updatedContent = updatedContent.replace(
    /\((\w+)\)\s*=>/g,
    '($1: any) =>'
  );
  
  // Fix specific Qdrant issues
  updatedContent = updatedContent.replace(
    /with_vectors/g,
    'with_vector'
  );
  
  updatedContent = updatedContent.replace(
    /getCollectionInfo/g,
    'getCollection'
  );
  
  // Write the updated content back to the file if changes were made
  if (content !== updatedContent) {
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`Fixed type issues in: ${filePath}`);
    return true;
  }
  return false;
}

// Function to fix the ToolOptions import issue
function fixToolOptionsIssue(filePath) {
  if (!filePath.endsWith('index.ts')) return false;
  
  console.log(`Checking for ToolOptions in: ${filePath}`);
  const content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes("import { ToolOptions } from '../schemas.js'")) {
    // Create a new interface for ToolOptions
    const updatedContent = content.replace(
      "import { ToolOptions } from '../schemas.js';",
      `
// Define ToolOptions interface locally since it's not exported from schemas.js
interface ToolOptions {
  [key: string]: any;
}
`
    );
    
    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`Fixed ToolOptions issue in: ${filePath}`);
      return true;
    }
  }
  
  return false;
}

// Function to fix FileInfo[] issue
function fixFileInfoNullIssue(filePath) {
  if (!filePath.includes('file-scanner.ts')) return false;
  
  console.log(`Checking for FileInfo[] null issue in: ${filePath}`);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Replace filter that could return null values
  const updatedContent = content.replace(
    /\.filter\(f => f\)/g,
    '.filter((f): f is FileInfo => f !== null)'
  );
  
  if (content !== updatedContent) {
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`Fixed FileInfo[] null issue in: ${filePath}`);
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
      let fileUpdated = false;
      
      fileUpdated = fixImportPaths(filePath) || fileUpdated;
      fileUpdated = fixTypeIssues(filePath) || fileUpdated;
      fileUpdated = fixToolOptionsIssue(filePath) || fileUpdated;
      fileUpdated = fixFileInfoNullIssue(filePath) || fileUpdated;
      
      if (fileUpdated) {
        totalFilesUpdated++;
      }
    }
    
    console.log(`\nTotal files updated: ${totalFilesUpdated} of ${tsFiles.length}`);
  } catch (error) {
    console.error('Error fixing remaining issues:', error);
    process.exit(1);
  }
}

main();
