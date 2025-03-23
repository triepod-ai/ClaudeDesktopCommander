// copy-remaining-files.js
// Script to copy remaining files to _archive that couldn't be moved due to permission issues

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Directory to copy (that had permission issues)
const dirToCopy = 'triepod-frontend-template';

// Create _archive directory if it doesn't exist
const archiveDir = path.join(__dirname, '_archive');
if (!fs.existsSync(archiveDir)) {
  fs.mkdirSync(archiveDir);
  console.log('Created _archive directory');
}

// For Windows, use xcopy command which handles permission issues better
try {
  const source = path.join(__dirname, dirToCopy);
  const destination = path.join(archiveDir, dirToCopy);
  
  if (fs.existsSync(source)) {
    // Create destination directory
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination, { recursive: true });
    }
    
    // Use xcopy with /E (copy subdirectories, including empty ones) and /I (assume destination is a directory)
    const command = `xcopy "${source}" "${destination}" /E /I /Y`;
    console.log(`Executing: ${command}`);
    execSync(command);
    console.log(`Copied ${dirToCopy} to _archive`);
    
    // After copying, add a .gitignore file in the original directory to ignore its contents
    // This is a workaround since we couldn't move it
    const gitignorePath = path.join(source, '.gitignore-all');
    fs.writeFileSync(gitignorePath, '*\n!.gitignore-all\n');
    console.log(`Added .gitignore-all to ${dirToCopy} to ignore its contents`);
  } else {
    console.log(`Directory ${dirToCopy} not found, skipping`);
  }
} catch (err) {
  console.error(`Error copying ${dirToCopy}:`, err);
}

console.log('Remaining files copy complete!');
