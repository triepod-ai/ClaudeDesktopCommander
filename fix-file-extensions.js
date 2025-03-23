import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function fixFileExtensions(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);
  
  console.log(`Fixing file extensions in: ${fileName}`);
  
  // Use a more accurate regex for relative imports
  const importRegex = /import\s+(?:(?:{[^}]*}|\*\s+as\s+[^;]+|[^;{}]+)\s+from\s+)?['"](\.[^'"]*)['"]/g;
  
  let updatedContent = content;
  let matches = content.match(importRegex);
  
  if (matches) {
    matches.forEach(match => {
      const relativePath = match.match(/['"](.[^'"]*)['"]/)[1];
      
      if (!relativePath.endsWith('.js')) {
        const replacement = match.replace(`'${relativePath}'`, `'${relativePath}.js'`)
                               .replace(`"${relativePath}"`, `"${relativePath}.js"`);
        updatedContent = updatedContent.replace(match, replacement);
      }
    });
  }
  
  if (content !== updatedContent) {
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`Updated imports in: ${fileName}`);
    return true;
  }
  
  return false;
}

// Fix specific syntax issues in query-handler.ts
function fixQueryHandler() {
  const filePath = path.join(__dirname, 'src/tools/code-analyzer/claude/query-handler.ts');
  const content = fs.readFileSync(filePath, 'utf8');
  
  let updatedContent = content.replace(
    /result\.analysis as any\.summary/g,
    '(result.analysis as any).summary'
  );
  
  updatedContent = updatedContent.replace(
    /result\.analysis as any\.purpose/g,
    '(result.analysis as any).purpose'
  );
  
  if (content !== updatedContent) {
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log('Fixed query-handler.ts syntax issues');
    return true;
  }
  
  return false;
}

// Fix file scanner null issue
function fixFileScanner() {
  const filePath = path.join(__dirname, 'src/tools/code-analyzer/scanner/file-scanner.ts');
  const content = fs.readFileSync(filePath, 'utf8');
  
  // This is a more focused fix
  const updatedContent = content.replace(
    /return files\.filter\(f => f\);/,
    'return files.filter((f): f is FileInfo => f !== null);'
  );
  
  if (content !== updatedContent) {
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log('Fixed file-scanner.ts null filtering issue');
    return true;
  }
  
  return false;
}

// Fix vector-db type issue
function fixVectorDb() {
  const filePath = path.join(__dirname, 'src/tools/code-analyzer/storage/vector-db.ts');
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Handle null/undefined issue
  let updatedContent = content;
  
  // Find the specific area with the type error
  const typeErrorLine = content.split('\n').findIndex(line => 
    line.includes('scrollId:') || line.includes('nextPageOffset:')
  );
  
  if (typeErrorLine > 0) {
    const lines = updatedContent.split('\n');
    // Add null coalescing operator to ensure it's never undefined
    lines[typeErrorLine] = lines[typeErrorLine].replace(
      /scrollId:\s*nextPageOffset/,
      'scrollId: nextPageOffset ?? null'
    );
    updatedContent = lines.join('\n');
  }
  
  if (content !== updatedContent) {
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log('Fixed vector-db.ts type issue');
    return true;
  }
  
  return false;
}

// Fix controller chunk parameter
function fixController() {
  const filePath = path.join(__dirname, 'src/tools/code-analyzer/controller.ts');
  const content = fs.readFileSync(filePath, 'utf8');
  
  const updatedContent = content.replace(
    /function createChunkId\(chunk\):/,
    'function createChunkId(chunk: any):'
  );
  
  if (content !== updatedContent) {
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log('Fixed controller.ts chunk parameter type');
    return true;
  }
  
  return false;
}

async function main() {
  try {
    // Fix files with import path issues
    const problematicFiles = [
      'src/tools/code-analyzer/analysis/index.ts',
      'src/tools/code-analyzer/claude/index.ts',
      'src/tools/code-analyzer/scanner/index.ts',
      'src/tools/code-analyzer/storage/index.ts'
    ];
    
    let updated = 0;
    
    for (const filePath of problematicFiles) {
      const fullPath = path.join(__dirname, filePath);
      if (fixFileExtensions(fullPath)) {
        updated++;
      }
    }
    
    // Fix specific files with other issues
    if (fixQueryHandler()) updated++;
    if (fixFileScanner()) updated++;
    if (fixVectorDb()) updated++;
    if (fixController()) updated++;
    
    console.log(`\nTotal files updated: ${updated}`);
    console.log('Run tsc --noEmit to check if all issues are fixed');
  } catch (error) {
    console.error('Error fixing issues:', error);
    process.exit(1);
  }
}

main();
