import { server } from '../../src/server.js';
import { commandManager } from '../../src/command-manager.js';
import { initializeLogging, shutdownLogging } from '../../src/logger.js';

/**
 * Test server utility for E2E testing
 */
export class TestServer {
  private isRunning: boolean = false;

  /**
   * Start the server in-memory for testing
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    // Initialize logging
    initializeLogging();

    // Initialize command manager
    await commandManager.loadBlockedCommands();

    this.isRunning = true;
  }

  /**
   * Stop the server
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }
    
    // Shutdown logging
    await shutdownLogging();
    
    this.isRunning = false;
  }

  /**
   * Get the server instance
   */
  getServer() {
    return server;
  }
}

/**
 * Create a new test server instance
 */
export function createTestServer(): TestServer {
  return new TestServer();
}
