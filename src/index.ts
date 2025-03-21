#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { server } from './server.js';
import { commandManager } from './command-manager.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { initializeLogging, shutdownLogging, logError, logInfo } from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runSetup() {
  const setupScript = join(__dirname, 'setup-claude-server.js');
  const { default: setupModule } = await import(setupScript);
  if (typeof setupModule === 'function') {
    await setupModule();
  }
}

async function runServer() {
  try {
    // Initialize logging system
    initializeLogging();
    
    // Check if first argument is "setup"
    if (process.argv[2] === 'setup') {
      logInfo('Running setup mode');
      await runSetup();
      await shutdownLogging();
      return;
    }
    
    // Handle uncaught exceptions
    process.on('uncaughtException', async (error) => {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logError('Uncaught exception', error instanceof Error ? error : new Error(errorMessage));
      await shutdownLogging();
      process.exit(1);
    });

    // Handle unhandled rejections
    process.on('unhandledRejection', async (reason) => {
      const errorMessage = reason instanceof Error ? reason.message : String(reason);
      logError('Unhandled rejection', reason instanceof Error ? reason : new Error(errorMessage));
      await shutdownLogging();
      process.exit(1);
    });

    const transport = new StdioServerTransport();
    logInfo('Server starting');
    
    // Load blocked commands from config file
    await commandManager.loadBlockedCommands();

    await server.connect(transport);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    process.stderr.write(JSON.stringify({
      type: 'error',
      timestamp: new Date().toISOString(),
      message: `Failed to start server: ${errorMessage}`
    }) + '\n');
    process.exit(1);
  }
}

runServer().catch(async (error) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  logError('Fatal error running server', error instanceof Error ? error : new Error(errorMessage));
  
  // Still write to stderr for immediate visibility
  process.stderr.write(JSON.stringify({
    type: 'error',
    timestamp: new Date().toISOString(),
    message: `Fatal error running server: ${errorMessage}`
  }) + '\n');
  
  await shutdownLogging();
  process.exit(1);
});
