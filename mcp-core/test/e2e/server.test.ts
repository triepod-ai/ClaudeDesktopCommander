import { createTestServer, TestServer } from '../utils/test-server.js';
import { createTestClient, TestClient } from '../utils/test-client.js';

describe('Server API E2E Tests', () => {
  let server: TestServer;
  let client: TestClient;

  beforeAll(async () => {
    // Create a test server
    server = createTestServer();
    
    // Create a test client
    client = await createTestClient(server);
  });

  afterAll(async () => {
    // Clean up
    await client.disconnect();
    await server.stop();
  });

  test('should list all available tools', async () => {
    // Get the list of tools
    const result = await client.listTools();
    
    // Check for essential tools
    const toolNames = result.tools.map((tool: any) => tool.name);
    
    // Terminal tools
    expect(toolNames).toContain('execute_command');
    expect(toolNames).toContain('read_output');
    expect(toolNames).toContain('force_terminate');
    expect(toolNames).toContain('list_sessions');
    expect(toolNames).toContain('list_processes');
    expect(toolNames).toContain('kill_process');
    expect(toolNames).toContain('block_command');
    expect(toolNames).toContain('unblock_command');
    expect(toolNames).toContain('list_blocked_commands');
    
    // Filesystem tools
    expect(toolNames).toContain('read_file');
    expect(toolNames).toContain('read_multiple_files');
    expect(toolNames).toContain('write_file');
    expect(toolNames).toContain('create_directory');
    expect(toolNames).toContain('list_directory');
    expect(toolNames).toContain('move_file');
    expect(toolNames).toContain('search_files');
    expect(toolNames).toContain('get_file_info');
    expect(toolNames).toContain('list_allowed_directories');
    expect(toolNames).toContain('edit_block');
    
    // Time tools
    expect(toolNames).toContain('get_current_time');
    expect(toolNames).toContain('convert_time');
    
    // GitHub tools
    expect(toolNames).toContain('search_repositories');
    expect(toolNames).toContain('get_file_contents');
    expect(toolNames).toContain('create_issue');
    expect(toolNames).toContain('get_issue');
  });

  test('should have input schemas for all tools', async () => {
    // Get the list of tools
    const result = await client.listTools();
    
    // Check each tool has an input schema
    for (const tool of result.tools) {
      expect(tool.inputSchema).toBeDefined();
      expect(tool.inputSchema.type).toBe('object');
    }
  });

  test('should fail gracefully for unknown tool', async () => {
    // Call a non-existent tool
    const result = await client.callTool('non_existent_tool', {});
    
    // Should return an error
    expect(result.isError).toBe(true);
    expect(result.content).toHaveLength(1);
    expect(result.content[0].text).toContain('Unknown tool');
  });

  test('should validate tool arguments', async () => {
    // Call read_file without required path parameter
    const result = await client.callTool('read_file', {});
    
    // Should return a validation error
    expect(result.isError).toBe(true);
    expect(result.content).toHaveLength(1);
    expect(result.content[0].text).toContain('Error');
  });
});
