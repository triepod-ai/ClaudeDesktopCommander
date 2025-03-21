#!/usr/bin/env node

/**
 * update-dependencies.js
 * 
 * A utility script to safely update npm dependencies using a structured approach:
 * 1. Analyze current dependencies and categorize them
 * 2. Create a backup before making changes
 * 3. Update dependencies in batches by risk level
 * 4. Verify the project still works after updates
 * 5. Generate a report of changes
 * 
 * Usage:
 * node scripts/update-dependencies.js [options]
 * 
 * Options:
 *   --dry-run       Show what would be updated without making changes
 *   --patch-only    Only update patch versions (safer)
 *   --skip-tests    Skip running tests after updates
 *   --report-file   Specify a file to output the update report
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import readline from 'readline';

const execAsync = promisify(exec);
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise(resolve => rl.question(query, resolve));

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  dryRun: args.includes('--dry-run'),
  patchOnly: args.includes('--patch-only'),
  skipTests: args.includes('--skip-tests'),
  reportFile: args.includes('--report-file') ? args[args.indexOf('--report-file') + 1] : 'dependency-update-report.md'
};

// Risk categories for dependency updates
const RISK_LEVELS = {
  LOW: 'low',      // Patch updates (1.0.x)
  MEDIUM: 'medium', // Minor updates (1.x.0)
  HIGH: 'high'      // Major updates (x.0.0)
};

// Dependencies that require special handling
const CRITICAL_DEPENDENCIES = [
  // Add critical dependencies for your project here
  '@modelcontextprotocol/sdk',
  'zod',
  'typescript'
];

/**
 * Main function to update dependencies
 */
async function main() {
  console.log('===== NPM Dependency Update Utility =====\n');
  console.log(`Mode: ${options.dryRun ? 'Dry Run (no changes will be made)' : 'Live Update'}`);

  try {
    // Check if npm is installed
    await execAsync('npm --version');
    
    // Create backup of package files
    await createBackup();
    
    // Get outdated packages
    const outdatedPackages = await getOutdatedPackages();
    if (Object.keys(outdatedPackages).length === 0) {
      console.log('\n✅ All dependencies are up to date!');
      process.exit(0);
    }
    
    // Categorize packages by risk level
    const categorizedPackages = categorizeDependencies(outdatedPackages);
    
    // Display update plan
    displayUpdatePlan(categorizedPackages);
    
    if (options.dryRun) {
      console.log('\nDry run complete. No changes were made.');
      return;
    }
    
    // Confirm updates
    const proceed = await question('\nDo you want to proceed with these updates? (y/n): ');
    if (proceed.toLowerCase() !== 'y') {
      console.log('Update cancelled.');
      process.exit(0);
    }
    
    // Execute updates by risk level
    const updateResults = await executeUpdates(categorizedPackages);
    
    // Verify the project still works
    if (!options.skipTests) {
      await verifyProject();
    }
    
    // Generate update report
    await generateReport(categorizedPackages, updateResults);
    
    console.log(`\n✅ Dependency update complete! Report saved to ${options.reportFile}`);
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  } finally {
    rl.close();
  }
}

/**
 * Create backup of package.json and package-lock.json
 */
async function createBackup() {
  console.log('\nCreating backup of package files...');
  
  const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
  
  try {
    await fs.copyFile('package.json', `package.json.backup-${timestamp}`);
    console.log(`Created backup: package.json.backup-${timestamp}`);
    
    try {
      await fs.access('package-lock.json');
      await fs.copyFile('package-lock.json', `package-lock.json.backup-${timestamp}`);
      console.log(`Created backup: package-lock.json.backup-${timestamp}`);
    } catch (error) {
      // package-lock.json doesn't exist, skip backup
    }
  } catch (error) {
    throw new Error(`Failed to create backup: ${error.message}`);
  }
}

/**
 * Get list of outdated packages from npm
 */
async function getOutdatedPackages() {
  console.log('\nChecking for outdated dependencies...');
  
  try {
    const { stdout } = await execAsync('npm outdated --json');
    
    // No outdated dependencies
    if (!stdout.trim()) {
      return {};
    }
    
    return JSON.parse(stdout);
  } catch (error) {
    // npm outdated returns a non-zero exit code when it finds outdated packages
    if (error.stdout) {
      try {
        return JSON.parse(error.stdout);
      } catch (parseError) {
        throw new Error(`Failed to parse npm outdated output: ${parseError.message}`);
      }
    }
    throw new Error(`Failed to check outdated packages: ${error.message}`);
  }
}

/**
 * Categorize dependencies by risk level and type (dev/prod)
 */
function categorizeDependencies(outdatedPackages) {
  console.log('\nCategorizing dependencies by risk level...');
  
  const result = {
    [RISK_LEVELS.LOW]: { dev: [], prod: [] },
    [RISK_LEVELS.MEDIUM]: { dev: [], prod: [] },
    [RISK_LEVELS.HIGH]: { dev: [], prod: [] },
    critical: []
  };
  
  Object.entries(outdatedPackages).forEach(([name, info]) => {
    const current = info.current || '0.0.0';
    const latest = info.latest;
    const wanted = info.wanted;
    
    // Determine if this is a dev dependency
    const isDev = info.type === 'devDependencies';
    
    // Determine if this is a critical dependency
    const isCritical = CRITICAL_DEPENDENCIES.includes(name);
    if (isCritical) {
      result.critical.push({ name, current, wanted, latest });
      return;
    }
    
    // Determine risk level
    const currentParts = current.split('.');
    const latestParts = latest.split('.');
    
    let riskLevel;
    if (currentParts[0] !== latestParts[0]) {
      riskLevel = RISK_LEVELS.HIGH;
    } else if (currentParts[1] !== latestParts[1]) {
      riskLevel = RISK_LEVELS.MEDIUM;
    } else {
      riskLevel = RISK_LEVELS.LOW;
    }
    
    // Skip if not patch updates when patch-only flag is set
    if (options.patchOnly && riskLevel !== RISK_LEVELS.LOW) {
      return;
    }
    
    result[riskLevel][isDev ? 'dev' : 'prod'].push({
      name,
      current,
      wanted,
      latest
    });
  });
  
  return result;
}

/**
 * Display the update plan
 */
function displayUpdatePlan(categorizedPackages) {
  console.log('\n===== Update Plan =====');
  
  // Handle critical dependencies
  if (categorizedPackages.critical.length > 0) {
    console.log('\n🚨 CRITICAL DEPENDENCIES (Require special attention):');
    categorizedPackages.critical.forEach(pkg => {
      console.log(`  - ${pkg.name}: ${pkg.current} → ${pkg.latest}`);
    });
  }
  
  // Low risk dependencies (patch)
  const lowRiskProd = categorizedPackages[RISK_LEVELS.LOW].prod;
  const lowRiskDev = categorizedPackages[RISK_LEVELS.LOW].dev;
  
  if (lowRiskProd.length > 0 || lowRiskDev.length > 0) {
    console.log(`\n🟢 LOW RISK UPDATES (PATCH):${options.dryRun ? ' (dry run)' : ''}`);
    
    if (lowRiskProd.length > 0) {
      console.log('  Production dependencies:');
      lowRiskProd.forEach(pkg => {
        console.log(`  - ${pkg.name}: ${pkg.current} → ${pkg.latest}`);
      });
    }
    
    if (lowRiskDev.length > 0) {
      console.log('  Development dependencies:');
      lowRiskDev.forEach(pkg => {
        console.log(`  - ${pkg.name}: ${pkg.current} → ${pkg.latest}`);
      });
    }
  }
  
  // Medium risk dependencies (minor)
  const mediumRiskProd = categorizedPackages[RISK_LEVELS.MEDIUM].prod;
  const mediumRiskDev = categorizedPackages[RISK_LEVELS.MEDIUM].dev;
  
  if (mediumRiskProd.length > 0 || mediumRiskDev.length > 0) {
    console.log(`\n🟡 MEDIUM RISK UPDATES (MINOR):${options.dryRun || options.patchOnly ? ' (skipped)' : ''}`);
    
    if (mediumRiskProd.length > 0) {
      console.log('  Production dependencies:');
      mediumRiskProd.forEach(pkg => {
        console.log(`  - ${pkg.name}: ${pkg.current} → ${pkg.latest}`);
      });
    }
    
    if (mediumRiskDev.length > 0) {
      console.log('  Development dependencies:');
      mediumRiskDev.forEach(pkg => {
        console.log(`  - ${pkg.name}: ${pkg.current} → ${pkg.latest}`);
      });
    }
  }
  
  // High risk dependencies (major)
  const highRiskProd = categorizedPackages[RISK_LEVELS.HIGH].prod;
  const highRiskDev = categorizedPackages[RISK_LEVELS.HIGH].dev;
  
  if (highRiskProd.length > 0 || highRiskDev.length > 0) {
    console.log(`\n🔴 HIGH RISK UPDATES (MAJOR):${options.dryRun || options.patchOnly ? ' (skipped)' : ''}`);
    
    if (highRiskProd.length > 0) {
      console.log('  Production dependencies:');
      highRiskProd.forEach(pkg => {
        console.log(`  - ${pkg.name}: ${pkg.current} → ${pkg.latest}`);
      });
    }
    
    if (highRiskDev.length > 0) {
      console.log('  Development dependencies:');
      highRiskDev.forEach(pkg => {
        console.log(`  - ${pkg.name}: ${pkg.current} → ${pkg.latest}`);
      });
    }
  }
}

/**
 * Execute updates in batches by risk level
 */
async function executeUpdates(categorizedPackages) {
  const results = {
    successful: [],
    failed: []
  };
  
  // Update critical dependencies individually with special handling
  if (categorizedPackages.critical.length > 0) {
    console.log('\n🚨 Updating critical dependencies (one by one)...');
    
    for (const pkg of categorizedPackages.critical) {
      try {
        console.log(`\nUpdating ${pkg.name} from ${pkg.current} to ${pkg.latest}...`);
        
        // For significant version jumps (e.g., 1.0.1 to 1.7.0), use an incremental approach
        if (shouldUpdateIncrementally(pkg.current, pkg.latest)) {
          await updateIncrementally(pkg.name, pkg.current, pkg.latest);
        } else {
          await execAsync(`npm install ${pkg.name}@${pkg.latest}`);
        }
        
        // Verify after each critical update
        if (!options.skipTests) {
          await verifyProject();
        }
        
        results.successful.push(`${pkg.name}@${pkg.latest}`);
        console.log(`✅ Successfully updated ${pkg.name} to ${pkg.latest}`);
      } catch (error) {
        results.failed.push({
          package: pkg.name,
          version: pkg.latest,
          error: error.message
        });
        console.error(`❌ Failed to update ${pkg.name}: ${error.message}`);
        
        // Try to roll back if update failed
        try {
          console.log(`Rolling back ${pkg.name} to ${pkg.current}...`);
          await execAsync(`npm install ${pkg.name}@${pkg.current}`);
        } catch (rollbackError) {
          console.error(`Failed to roll back ${pkg.name}: ${rollbackError.message}`);
        }
      }
    }
  }
  
  // Update low risk dependencies (patch)
  const lowRiskPackages = [
    ...categorizedPackages[RISK_LEVELS.LOW].prod,
    ...categorizedPackages[RISK_LEVELS.LOW].dev
  ];
  
  if (lowRiskPackages.length > 0) {
    console.log('\n🟢 Updating low risk dependencies (patch updates)...');
    await updatePackageBatch(lowRiskPackages, results);
  }
  
  // Update medium risk dependencies (minor) if not in patch-only mode
  if (!options.patchOnly) {
    const mediumRiskPackages = [
      ...categorizedPackages[RISK_LEVELS.MEDIUM].prod,
      ...categorizedPackages[RISK_LEVELS.MEDIUM].dev
    ];
    
    if (mediumRiskPackages.length > 0) {
      console.log('\n🟡 Updating medium risk dependencies (minor updates)...');
      await updatePackageBatch(mediumRiskPackages, results);
    }
    
    // Update high risk dependencies (major)
    const highRiskPackages = [
      ...categorizedPackages[RISK_LEVELS.HIGH].prod,
      ...categorizedPackages[RISK_LEVELS.HIGH].dev
    ];
    
    if (highRiskPackages.length > 0) {
      console.log('\n🔴 Updating high risk dependencies (major updates)...');
      
      // Update high risk dev dependencies first
      const devPackages = highRiskPackages.filter(pkg => 
        categorizedPackages[RISK_LEVELS.HIGH].dev.some(devPkg => devPkg.name === pkg.name)
      );
      
      if (devPackages.length > 0) {
        console.log('\nUpdating development dependencies first...');
        await updatePackageBatch(devPackages, results);
      }
      
      // Update high risk production dependencies one by one
      const prodPackages = highRiskPackages.filter(pkg => 
        categorizedPackages[RISK_LEVELS.HIGH].prod.some(prodPkg => prodPkg.name === pkg.name)
      );
      
      if (prodPackages.length > 0) {
        console.log('\nUpdating production dependencies one by one...');
        
        for (const pkg of prodPackages) {
          try {
            console.log(`\nUpdating ${pkg.name} from ${pkg.current} to ${pkg.latest}...`);
            await execAsync(`npm install ${pkg.name}@${pkg.latest}`);
            
            // Verify after each major production dependency update
            if (!options.skipTests) {
              await verifyProject();
            }
            
            results.successful.push(`${pkg.name}@${pkg.latest}`);
            console.log(`✅ Successfully updated ${pkg.name} to ${pkg.latest}`);
          } catch (error) {
            results.failed.push({
              package: pkg.name,
              version: pkg.latest,
              error: error.message
            });
            console.error(`❌ Failed to update ${pkg.name}: ${error.message}`);
            
            // Try to roll back if update failed
            try {
              console.log(`Rolling back ${pkg.name} to ${pkg.current}...`);
              await execAsync(`npm install ${pkg.name}@${pkg.current}`);
            } catch (rollbackError) {
              console.error(`Failed to roll back ${pkg.name}: ${rollbackError.message}`);
            }
          }
        }
      }
    }
  }
  
  return results;
}

/**
 * Update a batch of packages
 */
async function updatePackageBatch(packages, results) {
  if (packages.length === 0) return;
  
  const packageStrings = packages.map(pkg => `${pkg.name}@${pkg.latest}`);
  console.log(`Updating: ${packageStrings.join(', ')}`);
  
  try {
    await execAsync(`npm install ${packageStrings.join(' ')}`);
    
    // Verify after batch update
    if (!options.skipTests) {
      await verifyProject();
    }
    
    results.successful.push(...packageStrings);
    console.log('✅ Batch update successful');
  } catch (error) {
    console.error(`❌ Batch update failed: ${error.message}`);
    console.log('Falling back to individual updates...');
    
    // Try updating packages individually
    for (const pkg of packages) {
      try {
        console.log(`Updating ${pkg.name} from ${pkg.current} to ${pkg.latest}...`);
        await execAsync(`npm install ${pkg.name}@${pkg.latest}`);
        results.successful.push(`${pkg.name}@${pkg.latest}`);
        console.log(`✅ Successfully updated ${pkg.name} to ${pkg.latest}`);
      } catch (error) {
        results.failed.push({
          package: pkg.name,
          version: pkg.latest,
          error: error.message
        });
        console.error(`❌ Failed to update ${pkg.name}: ${error.message}`);
      }
    }
    
    // Verify after individual updates
    if (!options.skipTests) {
      await verifyProject();
    }
  }
}

/**
 * Determine if a package should be updated incrementally
 */
function shouldUpdateIncrementally(current, latest) {
  const currentParts = current.split('.').map(Number);
  const latestParts = latest.split('.').map(Number);
  
  // If major versions differ by more than 1, or if minor versions differ significantly
  return (
    (latestParts[0] - currentParts[0] > 1) || 
    (latestParts[0] === currentParts[0] && latestParts[1] - currentParts[1] > 3)
  );
}

/**
 * Update a package incrementally through intermediate versions
 */
async function updateIncrementally(packageName, current, latest) {
  console.log(`Incrementally updating ${packageName} from ${current} to ${latest}...`);
  
  const currentParts = current.split('.').map(Number);
  const latestParts = latest.split('.').map(Number);
  
  // Get all available versions
  const { stdout } = await execAsync(`npm view ${packageName} versions --json`);
  const allVersions = JSON.parse(stdout);
  
  // Sort versions and filter out only the ones between current and latest
  const sortedVersions = allVersions
    .filter(version => {
      const parts = version.split('.').map(Number);
      
      // Compare versions to see if it's between current and latest
      return (
        // Must be greater than current
        (parts[0] > currentParts[0] || 
         (parts[0] === currentParts[0] && parts[1] > currentParts[1]) ||
         (parts[0] === currentParts[0] && parts[1] === currentParts[1] && parts[2] > currentParts[2])) &&
        // Must be less than latest
        (parts[0] < latestParts[0] || 
         (parts[0] === latestParts[0] && parts[1] < latestParts[1]) ||
         (parts[0] === latestParts[0] && parts[1] === latestParts[1] && parts[2] <= latestParts[2]))
      );
    })
    .sort((a, b) => {
      const aParts = a.split('.').map(Number);
      const bParts = b.split('.').map(Number);
      
      if (aParts[0] !== bParts[0]) return aParts[0] - bParts[0];
      if (aParts[1] !== bParts[1]) return aParts[1] - bParts[1];
      return aParts[2] - bParts[2];
    });
  
  // Select intermediate versions
  const intermediateVersions = [];
  
  // Major version jumps
  if (latestParts[0] > currentParts[0]) {
    // Add the first version of each major version
    let currentMajor = currentParts[0];
    
    while (currentMajor < latestParts[0]) {
      currentMajor++;
      
      const firstOfMajor = sortedVersions.find(v => v.startsWith(`${currentMajor}.`));
      if (firstOfMajor) {
        intermediateVersions.push(firstOfMajor);
      }
    }
  } 
  // Minor version jumps (within same major)
  else if (latestParts[1] - currentParts[1] > 3) {
    // Add some intermediate minor versions
    const minorVersions = sortedVersions.filter(v => v.startsWith(`${currentParts[0]}.`));
    
    // Sample at regular intervals
    const step = Math.max(1, Math.floor(minorVersions.length / 3));
    for (let i = 0; i < minorVersions.length; i += step) {
      intermediateVersions.push(minorVersions[i]);
    }
  }
  
  // Add the final target version
  intermediateVersions.push(latest);
  
  // Remove duplicates
  const uniqueVersions = [...new Set(intermediateVersions)];
  
  console.log(`Update path: ${current} → ${uniqueVersions.join(' → ')}`);
  
  // Update through each intermediate version
  for (const version of uniqueVersions) {
    console.log(`\nUpdating to intermediate version: ${version}...`);
    await execAsync(`npm install ${packageName}@${version}`);
    
    // Verify after each intermediate update
    if (!options.skipTests) {
      await verifyProject();
    }
  }
}

/**
 * Verify the project works after updates
 */
async function verifyProject() {
  console.log('\nVerifying project build...');
  
  try {
    // Check if project has a build script
    const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
    
    if (packageJson.scripts && packageJson.scripts.build) {
      console.log('Running build script...');
      await execAsync('npm run build');
      console.log('✅ Build successful');
    } else {
      console.log('No build script found. Skipping build verification.');
    }
    
    // Check if project has tests
    if (packageJson.scripts && packageJson.scripts.test) {
      console.log('Running tests...');
      await execAsync('npm test');
      console.log('✅ Tests passed');
    } else {
      console.log('No test script found. Skipping test verification.');
    }
  } catch (error) {
    throw new Error(`Project verification failed: ${error.message}`);
  }
}

/**
 * Generate a report of the updates
 */
async function generateReport(categorizedPackages, updateResults) {
  console.log('\nGenerating update report...');
  
  const report = [
    '# Dependency Update Report',
    `\nGenerated: ${new Date().toISOString()}`,
    '\n## Update Summary',
    '\n| Category | Updated | Failed |',
    '|----------|---------|--------|',
    `| Critical | ${categorizedPackages.critical.filter(pkg => 
      updateResults.successful.includes(`${pkg.name}@${pkg.latest}`)
    ).length} | ${categorizedPackages.critical.filter(pkg => 
      updateResults.failed.some(f => f.package === pkg.name)
    ).length} |`,
    `| Low Risk | ${
      categorizedPackages[RISK_LEVELS.LOW].prod.length + 
      categorizedPackages[RISK_LEVELS.LOW].dev.length -
      categorizedPackages[RISK_LEVELS.LOW].prod.filter(pkg => 
        updateResults.failed.some(f => f.package === pkg.name)
      ).length -
      categorizedPackages[RISK_LEVELS.LOW].dev.filter(pkg => 
        updateResults.failed.some(f => f.package === pkg.name)
      ).length
    } | ${
      categorizedPackages[RISK_LEVELS.LOW].prod.filter(pkg => 
        updateResults.failed.some(f => f.package === pkg.name)
      ).length +
      categorizedPackages[RISK_LEVELS.LOW].dev.filter(pkg => 
        updateResults.failed.some(f => f.package === pkg.name)
      ).length
    } |`,
    options.patchOnly ? '' : `| Medium Risk | ${
      categorizedPackages[RISK_LEVELS.MEDIUM].prod.length + 
      categorizedPackages[RISK_LEVELS.MEDIUM].dev.length -
      categorizedPackages[RISK_LEVELS.MEDIUM].prod.filter(pkg => 
        updateResults.failed.some(f => f.package === pkg.name)
      ).length -
      categorizedPackages[RISK_LEVELS.MEDIUM].dev.filter(pkg => 
        updateResults.failed.some(f => f.package === pkg.name)
      ).length
    } | ${
      categorizedPackages[RISK_LEVELS.MEDIUM].prod.filter(pkg => 
        updateResults.failed.some(f => f.package === pkg.name)
      ).length +
      categorizedPackages[RISK_LEVELS.MEDIUM].dev.filter(pkg => 
        updateResults.failed.some(f => f.package === pkg.name)
      ).length
    } |`,
    options.patchOnly ? '' : `| High Risk | ${
      categorizedPackages[RISK_LEVELS.HIGH].prod.length + 
      categorizedPackages[RISK_LEVELS.HIGH].dev.length -
      categorizedPackages[RISK_LEVELS.HIGH].prod.filter(pkg => 
        updateResults.failed.some(f => f.package === pkg.name)
      ).length -
      categorizedPackages[RISK_LEVELS.HIGH].dev.filter(pkg => 
        updateResults.failed.some(f => f.package === pkg.name)
      ).length
    } | ${
      categorizedPackages[RISK_LEVELS.HIGH].prod.filter(pkg => 
        updateResults.failed.some(f => f.package === pkg.name)
      ).length +
      categorizedPackages[RISK_LEVELS.HIGH].dev.filter(pkg => 
        updateResults.failed.some(f => f.package === pkg.name)
      ).length
    } |`,
    
    '\n## Successful Updates',
    updateResults.successful.length > 0 ? 
      updateResults.successful.map(pkg => `- ${pkg}`).join('\n') : 
      'No successful updates.',
    
    '\n## Failed Updates',
    updateResults.failed.length > 0 ? 
      updateResults.failed.map(pkg => `- ${pkg.package}@${pkg.version}: ${pkg.error}`).join('\n') : 
      'No failed updates.',
    
    '\n## Next Steps',
    '\n1. Run tests to verify everything works as expected',
    '2. Check for any deprecated API usage in your code',
    '3. Update your code to use new features or APIs where applicable',
    '4. Check for any security vulnerabilities that may have been fixed'
  ].filter(Boolean).join('\n');
  
  await fs.writeFile(options.reportFile, report);
}

// Run the main function
main().catch(console.error);
