import { createTestServer, TestServer } from '../utils/test-server.js';
import { createTestClient, TestClient } from '../utils/test-client.js';

describe('Time Tools E2E Tests', () => {
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

  test('should get current time in specific timezone', async () => {
    // Get current time in UTC
    const utcResult = await client.callTool('get_current_time', { 
      timezone: 'UTC'
    });
    
    // Verify format and content
    expect(utcResult.content).toHaveLength(1);
    
    const utcTime = utcResult.content[0].text as string;
    
    // Test that it's a valid date string (should match ISO format)
    const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
    expect(dateRegex.test(utcTime)).toBe(true);
    
    // Get time in a different timezone
    const laResult = await client.callTool('get_current_time', { 
      timezone: 'America/Los_Angeles'
    });
    
    expect(laResult.content).toHaveLength(1);
    
    const laTime = laResult.content[0].text as string;
    expect(dateRegex.test(laTime)).toBe(true);
    
    // Times should be different due to timezone offset
    expect(utcTime).not.toBe(laTime);
  });

  test('should convert time between timezones', async () => {
    // Convert a specific time between timezones
    const result = await client.callTool('convert_time', { 
      source_timezone: 'UTC',
      time: '12:00',
      target_timezone: 'America/New_York'
    });
    
    // Verify conversion
    expect(result.content).toHaveLength(1);
    
    const convertedTime = result.content[0].text as string;
    
    // Check format and output
    expect(convertedTime).toContain('12:00 UTC');
    expect(convertedTime).toContain('America/New_York');
    
    // Converting from UTC to NY should result in a different time
    // The actual time difference will depend on daylight saving time
    expect(convertedTime).not.toContain('12:00 America/New_York');
  });

  test('should handle invalid timezone', async () => {
    // Try to get time in an invalid timezone
    const result = await client.callTool('get_current_time', { 
      timezone: 'Not_A_Real_Timezone'
    });
    
    // Should return an error
    expect(result.isError).toBe(true);
    expect(result.content).toHaveLength(1);
    expect(result.content[0].text).toContain('Error');
  });

  test('should handle invalid time format', async () => {
    // Try to convert with an invalid time format
    const result = await client.callTool('convert_time', { 
      source_timezone: 'UTC',
      time: 'not-a-time',
      target_timezone: 'America/New_York'
    });
    
    // Should return an error
    expect(result.isError).toBe(true);
    expect(result.content).toHaveLength(1);
    expect(result.content[0].text).toContain('Error');
  });
});
