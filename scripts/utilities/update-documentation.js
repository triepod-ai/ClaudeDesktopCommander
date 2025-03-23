// update-documentation.js
// Script to update documentation to reflect the reorganized project structure

const fs = require('fs');
const path = require('path');

// Files to move to _archive
const filesToArchive = [
  'DOCUMENTATION.md',
  'DOCUMENTATION_SYSTEM.md',
  'code-analyzer-dependencies.txt',
  'codeanalyst.modelfile',
  'code_analyzer_config.ts',
  'final-fixes.js',
  'fix-file-extensions.js',
  'fix-imports.js',
  'fix-remaining-issues.js',
  'fix-syntax.js',
  'mcp-server-wrapper.js',
  'package.json.backup',
  'test-api-compatibility.js',
  'test-code-analyzer.js',
  'simplified-approach.md',
  'verify-setup.bat',
  'verify-setup.sh',
  'triepod-frontend-template',
  'setup-claude-server.js'
];

// Files to update (rename from UPDATED_ to original)
const filesToUpdate = [
  'README.md',
  'DOCUMENTATION_HUB.md'
];

// Create _archive directory if it doesn't exist
const archiveDir = path.join(__dirname, '_archive');
if (!fs.existsSync(archiveDir)) {
  fs.mkdirSync(archiveDir);
  console.log('Created _archive directory');
}

// Move files to _archive
filesToArchive.forEach(file => {
  const sourcePath = path.join(__dirname, file);
  const destPath = path.join(archiveDir, file);
  
  // Check if file exists
  if (fs.existsSync(sourcePath)) {
    // Create directories recursively if needed
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    // Move file
    try {
      fs.renameSync(sourcePath, destPath);
      console.log(`Moved ${file} to _archive`);
    } catch (err) {
      console.error(`Error moving ${file}:`, err);
    }
  } else {
    console.log(`File ${file} not found, skipping`);
  }
});

// Update documentation files
filesToUpdate.forEach(file => {
  const updatedPath = path.join(__dirname, 'UPDATED_' + file);
  const originalPath = path.join(__dirname, file);
  
  // Check if updated file exists
  if (fs.existsSync(updatedPath)) {
    // Backup original if it exists
    if (fs.existsSync(originalPath)) {
      const backupPath = path.join(archiveDir, file);
      fs.renameSync(originalPath, backupPath);
      console.log(`Backed up ${file} to _archive`);
    }
    
    // Rename updated file to original
    try {
      fs.renameSync(updatedPath, originalPath);
      console.log(`Updated ${file} with new content`);
    } catch (err) {
      console.error(`Error updating ${file}:`, err);
    }
  } else {
    console.log(`Updated file for ${file} not found, skipping`);
  }
});

console.log('Documentation update complete!');
