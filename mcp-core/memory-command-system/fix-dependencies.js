const fs = require('fs');
const path = require('path');

// Read package.json
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Update dependencies
if (!packageJson.dependencies) packageJson.dependencies = {};
if (!packageJson.devDependencies) packageJson.devDependencies = {};

// Replace inflight with lru-cache
if (packageJson.dependencies.inflight) {
  delete packageJson.dependencies.inflight;
  packageJson.dependencies['lru-cache'] = '^7.14.1';
}

// Update glob to a newer version
if (packageJson.dependencies.glob) {
  packageJson.dependencies.glob = '^9.3.2';
}

// Add resolutions for nested dependencies
if (!packageJson.resolutions) packageJson.resolutions = {};
packageJson.resolutions['glob'] = '^9.3.2';
packageJson.resolutions['inflight'] = 'npm:lru-cache@^7.14.1';

// Write updated package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('Dependencies updated in package.json');
