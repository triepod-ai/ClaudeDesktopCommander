import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to directly fix files with explicit paths
function fixFile(filePath, fixFunction) {
  try {
    const fullPath = path.join(__dirname, filePath);
    console.log(`Fixing file: ${filePath}`);
    const content = fs.readFileSync(fullPath, 'utf8');
    const updatedContent = fixFunction(content);
    
    if (content !== updatedContent) {
      fs.writeFileSync(fullPath, updatedContent, 'utf8');
      console.log(`Successfully updated: ${filePath}`);
      return true;
    } else {
      console.log(`No changes needed for: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

// Fix for index files with import path issues
function fixImportPaths(content) {
  return content.replace(
    /from\s+['"](\.[^'"]*)['"]/g,
    (match, importPath) => {
      if (importPath.startsWith('.') && !importPath.endsWith('.js')) {
        return match.replace(importPath, `${importPath}.js`);
      }
      return match;
    }
  );
}

// Fix for file-scanner.ts FileInfo[] issue
function fixFileScanner(content) {
  // Fix the filter to properly type guard
  return content.replace(
    /return fileInfos\.filter\(Boolean\) as FileInfo\[\];/,
    'return fileInfos.filter((fi): fi is FileInfo => fi !== null);'
  );
}

// Fix for vector-db.ts undefined issue
function fixVectorDb(content) {
  return content.replace(
    /scrollId: nextPageOffset/g, 
    'scrollId: nextPageOffset ?? null'
  );
}

// Process all files
async function main() {
  const filesToFix = [
    { 
      path: 'src/tools/code-analyzer/analysis/index.ts', 
      fix: fixImportPaths 
    },
    { 
      path: 'src/tools/code-analyzer/claude/index.ts', 
      fix: fixImportPaths 
    },
    { 
      path: 'src/tools/code-analyzer/scanner/index.ts', 
      fix: fixImportPaths 
    },
    { 
      path: 'src/tools/code-analyzer/storage/index.ts', 
      fix: fixImportPaths 
    },
    { 
      path: 'src/tools/code-analyzer/scanner/file-scanner.ts', 
      fix: fixFileScanner 
    },
    { 
      path: 'src/tools/code-analyzer/storage/vector-db.ts', 
      fix: fixVectorDb 
    }
  ];
  
  let totalFixed = 0;
  
  for (const file of filesToFix) {
    if (fixFile(file.path, file.fix)) {
      totalFixed++;
    }
  }
  
  console.log(`\nTotal files fixed: ${totalFixed} of ${filesToFix.length}`);
}

main();
