// Claude Desktop Commander MCP Integration Test
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get current directory equivalent to __dirname in CommonJS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test file paths
const TEST_DIR = path.join(__dirname, 'test-data');
const TEST_FILE = path.join(TEST_DIR, 'test-file.txt');
const TEST_EDIT_FILE = path.join(TEST_DIR, 'edit-test.js');

// Create test directory and files if they don't exist
function setupTestEnvironment() {
  console.log('Setting up test environment...');
  
  // Create test directory
  if (!fs.existsSync(TEST_DIR)) {
    fs.mkdirSync(TEST_DIR, { recursive: true });
    console.log(`Created test directory: ${TEST_DIR}`);
  }
  
  // Create test file
  if (!fs.existsSync(TEST_FILE)) {
    fs.writeFileSync(TEST_FILE, 'This is a test file.\nIt has multiple lines.\nThis line will be modified.');
    console.log(`Created test file: ${TEST_FILE}`);
  }
  
  // Create edit test file
  if (!fs.existsSync(TEST_EDIT_FILE)) {
    fs.writeFileSync(TEST_EDIT_FILE, `
// Sample JavaScript file for edit testing
function testFunction() {
  console.log("Original message");
  return true;
}

const config = {
  enabled: false,
  timeout: 5000,
  retries: 3
};

export { testFunction, config };
    `);
    console.log(`Created edit test file: ${TEST_EDIT_FILE}`);
  }
  
  console.log('Test environment setup complete.\n');
}

// Run tests
function runTests() {
  console.log('Running integration tests...');
  console.log('=================================================');
  
  // 1. Verify Claude Desktop config
  console.log('1. Checking Claude Desktop configuration...');
  const configPath = process.platform === 'win32' 
    ? path.join(process.env.APPDATA, 'Claude', 'claude_desktop_config.json')
    : path.join(os.homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
  
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    console.log('Claude Desktop config found:');
    console.log('MCP Servers:', Object.keys(config.mcpServers || {}));
    
    if (config.mcpServers?.desktopCommander) {
      console.log('Desktop Commander MCP server configured correctly ✅');
    } else {
      console.log('Desktop Commander MCP server not found in config ❌');
    }
  } else {
    console.log(`Claude Desktop config not found at ${configPath} ❌`);
  }
  console.log('-------------------------------------------------');
  
  // 2. Manual Testing Instructions
  console.log('2. Manual Testing Instructions:');
  console.log('To fully test the integration, open Claude Desktop and try the following commands:');
  console.log('');
  console.log('A. Terminal Command Test:');
  console.log('   Ask Claude: "Execute the command `dir` (or `ls` on Mac/Linux) and show me the results"');
  console.log('');
  console.log('B. File Operation Test:');
  console.log(`   Ask Claude: "Read the content of this file: ${TEST_FILE}"`);
  console.log('');
  console.log('C. Search & Replace Test:');
  console.log(`   Ask Claude: "In the file ${TEST_EDIT_FILE}, change 'Original message' to 'Updated message'"`);
  console.log('');
  console.log('D. Process Management Test:');
  console.log('   Ask Claude: "List all running processes on my system"');
  console.log('');
  console.log('-------------------------------------------------');
}

// Run the tests
setupTestEnvironment();
runTests();

console.log('\nNext Steps:');
console.log('1. Start/restart Claude Desktop app');
console.log('2. Follow the manual testing instructions above to verify integration');
console.log('3. Report any issues or success to the developers');
