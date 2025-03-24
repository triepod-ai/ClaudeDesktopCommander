import * as fs from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

// Simple test to verify Jest is working properly
describe('Basic Tests', () => {
  let testDir: string;

  // Helper to generate a random test directory
  const getTempDir = () => {
    return join(process.cwd(), 'test', 'temp', `test-${Date.now()}-${Math.floor(Math.random() * 1000)}`);
  };

  beforeAll(async () => {
    // Create temp directory for testing
    testDir = getTempDir();
    await fs.mkdir(testDir, { recursive: true });
  });

  afterAll(async () => {
    // Remove test directory if it exists
    if (existsSync(testDir)) {
      await fs.rm(testDir, { recursive: true, force: true });
    }
  });

  test('should create and read a file', async () => {
    // Create test file
    const testFilePath = join(testDir, 'basic-test.txt');
    const testContent = 'Basic test content';
    
    await fs.writeFile(testFilePath, testContent);
    
    // Verify file was created
    const fileExists = existsSync(testFilePath);
    expect(fileExists).toBe(true);
    
    // Read file contents
    const content = await fs.readFile(testFilePath, 'utf-8');
    expect(content).toBe(testContent);
  });
});
