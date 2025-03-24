import { createTestServer, TestServer } from '../utils/test-server.js';
import { createTestClient, TestClient } from '../utils/test-client.js';

describe('GitHub Tools E2E Tests', () => {
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

  // Note: GitHub API tests are marked as skipped by default
  // because they may require authentication tokens and may hit rate limits
  // To run these tests, you'll need to set up GitHub authentication
  // and remove the .skip from the tests

  test.skip('should search for repositories', async () => {
    // Search for a popular repository
    const result = await client.callTool('search_repositories', { 
      query: 'stars:>1000 language:javascript',
      perPage: 5,
      page: 1
    });
    
    // Verify result format
    expect(result.content).toHaveLength(1);
    
    const searchResults = result.content[0].text as string;
    
    // Should contain repository information
    expect(searchResults).toContain('Repository name:');
    expect(searchResults).toContain('Stars:');
    expect(searchResults).toContain('Description:');
  });

  test.skip('should get file contents from a repository', async () => {
    // Get README from a popular public repository
    const result = await client.callTool('get_file_contents', { 
      owner: 'facebook',
      repo: 'react',
      path: 'README.md'
    });
    
    // Verify result format
    expect(result.content).toHaveLength(1);
    
    const fileContent = result.content[0].text as string;
    
    // Should contain React README content
    expect(fileContent).toContain('React');
    expect(fileContent.length).toBeGreaterThan(100);
  });

  test.skip('should handle non-existent file errors', async () => {
    // Try to get a file that doesn't exist
    const result = await client.callTool('get_file_contents', { 
      owner: 'facebook',
      repo: 'react',
      path: 'not-a-real-file.txt'
    });
    
    // Should return an error
    expect(result.isError).toBe(true);
    expect(result.content).toHaveLength(1);
    expect(result.content[0].text).toContain('Error');
  });

  // Note: The create_issue and get_issue tests are skipped because
  // they require authentication and would create real issues in repositories
  
  test.skip('should create and get an issue', async () => {
    // This test is a placeholder and should not be run in automated tests
    // unless you have the proper permissions and setup
    
    // Create an issue
    const createResult = await client.callTool('create_issue', { 
      owner: 'YOUR_TEST_REPO_OWNER',
      repo: 'YOUR_TEST_REPO',
      title: 'Test issue from E2E tests',
      body: 'This is a test issue created by the E2E test suite. Please ignore.'
    });
    
    // Should contain the created issue number
    expect(createResult.content).toHaveLength(1);
    
    const issueCreationText = createResult.content[0].text as string;
    const issueNumberMatch = issueCreationText.match(/Issue #(\d+) created/);
    expect(issueNumberMatch).toBeTruthy();
    
    const issueNumber = parseInt(issueNumberMatch![1], 10);
    
    // Get the created issue
    const getResult = await client.callTool('get_issue', { 
      owner: 'YOUR_TEST_REPO_OWNER',
      repo: 'YOUR_TEST_REPO',
      issue_number: issueNumber
    });
    
    // Check the issue details
    expect(getResult.content).toHaveLength(1);
    expect(getResult.content[0].text).toContain('Test issue from E2E tests');
  });
});
