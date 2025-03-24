import { createTestServer, TestServer } from '../utils/test-server.js';
import { createTestClient, TestClient } from '../utils/test-client.js';

describe('Terminal Tools E2E Tests', () => {
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

  test('should execute a command and read its output', async () => {
    // Execute a simple echo command
    const executeResult = await client.callTool('execute_command', { 
      command: 'echo "Hello from E2E test"',
      timeout_ms: 5000
    });
    
    // Check that execution started
    expect(executeResult.content).toHaveLength(1);
    expect(executeResult.content[0].text).toContain('Command started with PID');
    
    // Extract PID from the result
    const pidMatch = executeResult.content[0].text.match(/Command started with PID (\d+)/);
    expect(pidMatch).toBeTruthy();
    
    const pid = parseInt(pidMatch![1], 10);
    expect(pid).toBeGreaterThan(0);
    
    // Read the output from the command
    const readResult = await client.callTool('read_output', { pid });
    
    // Check the command output
    expect(readResult.content).toHaveLength(1);
    expect(readResult.content[0].text).toContain('Hello from E2E test');
  });

  test('should list active sessions', async () => {
    // Execute a command that will run for a moment
    const executeResult = await client.callTool('execute_command', { 
      command: 'ping -n 10 127.0.0.1 > nul',  // Windows equivalent of "sleep"
      timeout_ms: 1000
    });
    
    // Extract PID
    const pidMatch = executeResult.content[0].text.match(/Command started with PID (\d+)/);
    const pid = parseInt(pidMatch![1], 10);
    
    // List sessions
    const sessionsResult = await client.callTool('list_sessions', {});
    
    // Check that our session is listed
    expect(sessionsResult.content).toHaveLength(1);
    expect(sessionsResult.content[0].text).toContain(`${pid}`);
  });

  test('should terminate a running command', async () => {
    // Execute a long-running command
    const executeResult = await client.callTool('execute_command', { 
      command: 'ping -n 60 127.0.0.1 > nul',  // Will run for ~60 seconds
      timeout_ms: 1000
    });
    
    // Extract PID
    const pidMatch = executeResult.content[0].text.match(/Command started with PID (\d+)/);
    const pid = parseInt(pidMatch![1], 10);
    
    // Terminate the command
    const terminateResult = await client.callTool('force_terminate', { pid });
    
    // Check that termination was successful
    expect(terminateResult.content).toHaveLength(1);
    expect(terminateResult.content[0].text).toContain('Process terminated');
    
    // Check that the session is no longer active
    const sessionsResult = await client.callTool('list_sessions', {});
    expect(sessionsResult.content[0].text).not.toContain(`${pid}`);
  });

  test('should block and unblock commands', async () => {
    // Block a command
    const blockResult = await client.callTool('block_command', { 
      command: 'format' 
    });
    
    // Check that command was blocked
    expect(blockResult.content).toHaveLength(1);
    expect(blockResult.content[0].text).toContain('Command blocked');
    
    // List blocked commands
    const listResult = await client.callTool('list_blocked_commands', {});
    
    // Check that our command is in the list
    expect(listResult.content).toHaveLength(1);
    expect(listResult.content[0].text).toContain('format');
    
    // Unblock the command
    const unblockResult = await client.callTool('unblock_command', { 
      command: 'format' 
    });
    
    // Check that command was unblocked
    expect(unblockResult.content).toHaveLength(1);
    expect(unblockResult.content[0].text).toContain('Command unblocked');
    
    // Check it's no longer in the list
    const finalListResult = await client.callTool('list_blocked_commands', {});
    expect(finalListResult.content[0].text).not.toContain('format');
  });

  test('should list processes', async () => {
    // Get the list of processes
    const result = await client.callTool('list_processes', {});
    
    // Check that we get process info
    expect(result.content).toHaveLength(1);
    
    // The output should contain typical process names
    const processOutput = result.content[0].text as string;
    expect(processOutput).toContain('PID');  // Header
    
    // Should have at least one process (likely many)
    const lines = processOutput.split('\n');
    expect(lines.length).toBeGreaterThan(1);
  });
});
