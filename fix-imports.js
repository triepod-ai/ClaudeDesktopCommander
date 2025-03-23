import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to add .js extension to relative import paths
function fixImports(filePath) {
  console.log(`Processing: ${filePath}`);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Regex to match import statements with relative paths without file extensions
  const importRegex = /import\s+(?:(?:{[^}]*}|\*\s+as\s+[^;]+|[^;{}]+)\s+from\s+)?['"](\.[^'"]*)['"]/g;
  
  // Replace import statements to add .js extension
  const updatedContent = content.replace(importRegex, (match, importPath) => {
    // Only add .js extension if it doesn't already have one and is a relative path
    if (importPath.startsWith('.') && !importPath.endsWith('.js')) {
      return match.replace(importPath, `${importPath}.js`);
    }
    return match;
  });
  
  // Write the updated content back to the file
  if (content !== updatedContent) {
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`Updated imports in: ${filePath}`);
    return true;
  }
  return false;
}

// Function to fix glob import
function fixGlobImport(filePath) {
  console.log(`Checking glob import in: ${filePath}`);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if file contains incorrect glob import
  if (content.includes('import glob from')) {
    const updatedContent = content.replace(
      /import\s+glob\s+from\s+['"]glob['"]/g, 
      "import { glob } from 'glob'"
    );
    
    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`Fixed glob import in: ${filePath}`);
      return true;
    }
  }
  return false;
}

// Function to fix unknown type errors
function fixTypeErrors(filePath) {
  console.log(`Checking for type errors in: ${filePath}`);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Fix 'error' is of type 'unknown'
  let updatedContent = content.replace(
    /catch\s*\(error\)\s*{/g,
    'catch (error: any) {'
  );
  
  // Fix implicit any types
  const implicitAnyRegex = /\((\w+)\)(?!\s*:\s*\w+)/g;
  updatedContent = updatedContent.replace(implicitAnyRegex, (match, paramName) => {
    // Skip certain patterns that don't need fixing
    if (['this', 'data', 'response', 'file', 'chunk', 'options'].includes(paramName)) {
      return match;
    }
    return `(${paramName}: any)`;
  });
  
  if (content !== updatedContent) {
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`Fixed type errors in: ${filePath}`);
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
      fileUpdated = fixImports(filePath) || fileUpdated;
      fileUpdated = fixGlobImport(filePath) || fileUpdated;
      fileUpdated = fixTypeErrors(filePath) || fileUpdated;
      
      if (fileUpdated) {
        totalFilesUpdated++;
      }
    }
    
    console.log(`\nTotal files updated: ${totalFilesUpdated} of ${tsFiles.length}`);
  } catch (error) {
    console.error('Error fixing imports:', error);
    process.exit(1);
  }
}

main();
