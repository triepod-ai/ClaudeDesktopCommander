import { TestServer } from './test-server.js';

/**
 * Test client for making tool requests to the server
 */
export class TestClient {
  private server: TestServer;

  constructor(server: TestServer) {
    this.server = server;
  }

  /**
   * Connect the client to the server
   */
  async connect(): Promise<void> {
    // Start the server if not running
    await this.server.start();
  }

  /**
   * Disconnect the client
   */
  async disconnect(): Promise<void> {
    // Nothing to do, we're using direct calls
  }

  /**
   * List available tools
   */
  async listTools() {
    const serverInstance = this.server.getServer();
    // Use the server's internal handlers directly
    const result = await serverInstance.onRequest({
      id: '1',
      method: 'mcp.listTools',
      params: {},
    });
    
    return result.result;
  }

  /**
   * Call a tool
   * @param name Tool name
   * @param args Tool arguments
   */
  async callTool(name: string, args: Record<string, any>) {
    const serverInstance = this.server.getServer();
    // Use the server's internal handlers directly
    const result = await serverInstance.onRequest({
      id: '1',
      method: 'mcp.callTool',
      params: {
        name,
        arguments: args,
      },
    });
    
    return result.result;
  }
}

/**
 * Create a test client connected to the given server
 */
export async function createTestClient(server: TestServer): Promise<TestClient> {
  const client = new TestClient(server);
  await client.connect();
  return client;
}
