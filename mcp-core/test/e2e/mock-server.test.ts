import { createMockServer } from '../utils/mock-server.js';
import { createMockClient, MockClient } from '../utils/mock-client.js';

describe('Mock Server API Tests', () => {
  let server: ReturnType<typeof createMockServer>;
  let client: MockClient;

  beforeAll(async () => {
    // Create a mock server
    server = createMockServer();
    
    // Create a mock client
    client = await createMockClient(server);
  });

  afterAll(async () => {
    // Clean up
    await client.disconnect();
  });

  test('should list available tools', async () => {
    // Get the list of tools
    const result = await client.listTools();
    
    // Verify we get tools
    expect(result.tools).toBeDefined();
    expect(Array.isArray(result.tools)).toBe(true);
    expect(result.tools.length).toBeGreaterThan(0);
    
    // Check specific tools
    const toolNames = result.tools.map((tool: any) => tool.name);
    expect(toolNames).toContain('execute_command');
    expect(toolNames).toContain('read_file');
    expect(toolNames).toContain('write_file');
  });

  test('should execute mock commands', async () => {
    // Call the execute_command tool
    const result = await client.callTool('execute_command', { command: 'echo "test"' });
    
    // Verify result format
    expect(result.content).toBeDefined();
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content[0].text).toContain('Command started with PID');
  });

  test('should handle unknown tools gracefully', async () => {
    // Call a non-existent tool
    const result = await client.callTool('non_existent_tool', {});
    
    // Verify error response
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Unknown tool');
  });
});
