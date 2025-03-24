import { join } from 'path';
import * as fs from 'fs/promises';
import { existsSync } from 'fs';

/**
 * Real filesystem tests that demonstrate E2E testing functionality
 * without needing to use the actual server
 */
describe('Filesystem E2E Tests', () => {
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

  test('should create, read, and list files', async () => {
    // Create test files
    const file1Path = join(testDir, 'test1.txt');
    const file2Path = join(testDir, 'test2.txt');
    const content1 = 'Test content 1';
    const content2 = 'Test content 2';
    
    await fs.writeFile(file1Path, content1);
    await fs.writeFile(file2Path, content2);
    
    // Read files
    const readContent1 = await fs.readFile(file1Path, 'utf-8');
    const readContent2 = await fs.readFile(file2Path, 'utf-8');
    
    // Verify content
    expect(readContent1).toBe(content1);
    expect(readContent2).toBe(content2);
    
    // List directory contents
    const entries = await fs.readdir(testDir);
    
    // Verify directory listing
    expect(entries).toContain('test1.txt');
    expect(entries).toContain('test2.txt');
  });

  test('should create and navigate directories', async () => {
    // Create nested directories
    const nestedDir = join(testDir, 'level1', 'level2', 'level3');
    await fs.mkdir(nestedDir, { recursive: true });
    
    // Verify directories were created
    const exists = existsSync(nestedDir);
    expect(exists).toBe(true);
    
    // Create a file in the nested directory
    const filePath = join(nestedDir, 'nested-file.txt');
    const content = 'Content in nested file';
    await fs.writeFile(filePath, content);
    
    // Read the file
    const readContent = await fs.readFile(filePath, 'utf-8');
    expect(readContent).toBe(content);
  });

  test('should move and rename files', async () => {
    // Create a file
    const sourcePath = join(testDir, 'source.txt');
    const destPath = join(testDir, 'destination.txt');
    const content = 'File to be moved';
    
    await fs.writeFile(sourcePath, content);
    
    // Move/rename the file
    await fs.rename(sourcePath, destPath);
    
    // Verify source no longer exists
    const sourceExists = existsSync(sourcePath);
    expect(sourceExists).toBe(false);
    
    // Verify destination exists with correct content
    const destExists = existsSync(destPath);
    expect(destExists).toBe(true);
    
    const readContent = await fs.readFile(destPath, 'utf-8');
    expect(readContent).toBe(content);
  });

  test('should get file info', async () => {
    // Create a file
    const filePath = join(testDir, 'info.txt');
    const content = 'File for testing info';
    
    await fs.writeFile(filePath, content);
    
    // Get file stats
    const stats = await fs.stat(filePath);
    
    // Verify stats
    expect(stats.isFile()).toBe(true);
    expect(stats.size).toBe(content.length);
    expect(stats.birthtime).toBeDefined();
    expect(stats.mtime).toBeDefined();
  });
});
