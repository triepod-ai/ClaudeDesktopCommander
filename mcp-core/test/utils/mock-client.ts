import { MockServer } from './mock-server.js';

/**
 * Mock client for testing server functionality
 */
export class MockClient {
  private server: MockServer;

  constructor(server: MockServer) {
    this.server = server;
  }

  /**
   * Connect to the mock server
   */
  async connect(): Promise<void> {
    await this.server.start();
  }

  /**
   * Disconnect from the mock server
   */
  async disconnect(): Promise<void> {
    await this.server.stop();
  }

  /**
   * List the available tools
   */
  async listTools() {
    return await this.server.listTools();
  }

  /**
   * Call a tool on the mock server
   */
  async callTool(name: string, args: Record<string, any>) {
    return await this.server.callTool(name, args);
  }
}

/**
 * Create a new mock client connected to the given mock server
 */
export async function createMockClient(server: MockServer): Promise<MockClient> {
  const client = new MockClient(server);
  await client.connect();
  return client;
}
