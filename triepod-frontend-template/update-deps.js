const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting dependency update process...');

// Clean install with legacy peer deps
try {
  console.log('Removing node_modules and package-lock.json...');
  if (fs.existsSync('node_modules')) {
    execSync('rmdir /s /q node_modules', { stdio: 'inherit' });
  }
  if (fs.existsSync('package-lock.json')) {
    fs.unlinkSync('package-lock.json');
  }

  console.log('Installing packages with legacy peer deps...');
  execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });

  // Update Babel plugins
  console.log('Updating deprecated Babel plugins...');
  execSync('npm install --save-dev @babel/plugin-transform-class-properties @babel/plugin-transform-nullish-coalescing-operator @babel/plugin-transform-numeric-separator @babel/plugin-transform-optional-chaining @babel/plugin-transform-private-methods @babel/plugin-transform-private-property-in-object --legacy-peer-deps', { stdio: 'inherit' });

  // Update other deprecated packages
  console.log('Updating other deprecated packages...');
  execSync('npm install --save-dev @jridgewell/sourcemap-codec @rollup/plugin-terser glob@10.3.10 rimraf@5.0.5 lru-cache@10.2.0 --legacy-peer-deps', { stdio: 'inherit' });

  // Fix security vulnerabilities
  console.log('Running npm audit fix...');
  execSync('npm audit fix --force --legacy-peer-deps', { stdio: 'inherit' });

  console.log('Dependency update process completed successfully!');
} catch (error) {
  console.error('Error updating dependencies:', error.message);
  process.exit(1);
}
