import { homedir, platform } from 'os';
import { join } from 'path';
import { readFileSync, writeFileSync, existsSync, appendFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Determine OS and set appropriate config path and command
const isWindows = platform() === 'win32';
const claudeConfigPath = isWindows
    ? join(process.env.APPDATA, 'Claude', 'claude_desktop_config.json')
    : join(homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');

// Setup logging
const LOG_FILE = join(__dirname, 'setup.log');

function logToFile(message, isError = false) {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} - ${isError ? 'ERROR: ' : ''}${message}\n`;
    try {
        appendFileSync(LOG_FILE, logMessage);
        // For setup script, we'll still output to console but in JSON format
        const jsonOutput = {
            type: isError ? 'error' : 'info',
            timestamp,
            message
        };
        process.stdout.write(JSON.stringify(jsonOutput) + '\n');
    } catch (err) {
        // Last resort error handling
        process.stderr.write(JSON.stringify({
            type: 'error',
            timestamp: new Date().toISOString(),
            message: `Failed to write to log file: ${err.message}`
        }) + '\n');
    }
}

// Check if config file exists and create default if not
if (!existsSync(claudeConfigPath)) {
    logToFile(`Claude config file not found at: ${claudeConfigPath}`);
    logToFile('Creating default config file...');
    
    // Create the directory if it doesn't exist
    const configDir = dirname(claudeConfigPath);
    if (!existsSync(configDir)) {
        // Use synchronous mkdir since we're already using sync file operations
        const { mkdirSync } = require('fs');
        mkdirSync(configDir, { recursive: true });
    }
    
    // Create default config
    const defaultConfig = {
        "serverConfig": isWindows
            ? {
                "command": "cmd.exe",
                "args": ["/c"]
              }
            : {
                "command": "/bin/sh",
                "args": ["-c"]
              }
    };
    
    writeFileSync(claudeConfigPath, JSON.stringify(defaultConfig, null, 2));
    logToFile('Default config file created. Please update it with your Claude API credentials.');
}

try {
    // Read existing config
    const configData = readFileSync(claudeConfigPath, 'utf8');
    const config = JSON.parse(configData);

    // Prepare the new server config based on OS
    // Determine if running through npx or locally
    const isNpx =  import.meta.url.endsWith('dist/setup-claude-server.js');

    const serverConfig = isNpx ? {
        "command": "npx",
        "args": [
            "@wonderwhy-er/desktop-commander"
        ]
    } : {
        "command": "node",
        "args": [
            join(__dirname, 'dist', 'index.js')
        ]
    };

    // Add or update the terminal server config
    if (!config.mcpServers) {
        config.mcpServers = {};
    }
    
    config.mcpServers.desktopCommander = serverConfig;

    // Add puppeteer server if not present
    /*if (!config.mcpServers.puppeteer) {
        config.mcpServers.puppeteer = {
            "command": "npx",
            "args": ["-y", "@modelcontextprotocol/server-puppeteer"]
        };
    }*/

    // Write the updated config back
    writeFileSync(claudeConfigPath, JSON.stringify(config, null, 2), 'utf8');
    
    logToFile('Successfully added MCP servers to Claude configuration!');
    logToFile(`Configuration location: ${claudeConfigPath}`);
    logToFile('\nTo use the servers:\n1. Restart Claude if it\'s currently running\n2. The servers will be available in Claude\'s MCP server list');
    
} catch (error) {
    // Enhanced error logging with more details
    logToFile(`Error updating Claude configuration: ${error.message}`, true);
    
    if (error.stack) {
        logToFile(`Error stack trace: ${error.stack}`, true);
    }
    
    // Additional context about what was being attempted
    logToFile(`This error occurred while trying to update the config file at: ${claudeConfigPath}`, true);
    
    // Guidance for troubleshooting
    logToFile('Possible solutions:', true);
    logToFile('1. Check if you have write permissions to the Claude config directory', true);
    logToFile('2. Make sure the Claude desktop app is not running while this script is executing', true);
    logToFile('3. Try running this script with administrator/elevated privileges', true);
    
    process.exit(1);
}
