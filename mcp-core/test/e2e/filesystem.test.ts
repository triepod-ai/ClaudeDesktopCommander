import { createTestServer, TestServer } from '../utils/test-server.js';
import { createTestClient, TestClient } from '../utils/test-client.js';
import { join } from 'path';
import * as fs from 'fs/promises';
import { existsSync } from 'fs';

describe('Filesystem Tools E2E Tests', () => {
  let server: TestServer;
  let client: TestClient;
  let testDir: string;

  // Helper to generate a random test directory
  const getTempDir = () => {
    return join(process.cwd(), 'test', 'temp', `test-${Date.now()}-${Math.floor(Math.random() * 1000)}`);
  };

  beforeAll(async () => {
    // Create a test server
    server = createTestServer();
    
    // Create a test client
    client = await createTestClient(server);
    
    // Create temp directory for testing
    testDir = getTempDir();
    await fs.mkdir(testDir, { recursive: true });
  });

  afterAll(async () => {
    // Clean up
    await client.disconnect();
    await server.stop();
    
    // Remove test directory if it exists
    if (existsSync(testDir)) {
      await fs.rm(testDir, { recursive: true, force: true });
    }
  });

  test('should list directory contents', async () => {
    // Create test files
    await fs.writeFile(join(testDir, 'test1.txt'), 'Test content 1');
    await fs.writeFile(join(testDir, 'test2.txt'), 'Test content 2');
    
    // Create test subdirectory
    const subDir = join(testDir, 'subdir');
    await fs.mkdir(subDir, { recursive: true });
    
    // Call the list_directory tool
    const result = await client.callTool('list_directory', { path: testDir });
    
    // Verify results
    expect(result.content).toHaveLength(1);
    
    const dirContent = result.content[0].text as string;
    expect(dirContent).toContain('[FILE] test1.txt');
    expect(dirContent).toContain('[FILE] test2.txt');
    expect(dirContent).toContain('[DIR] subdir');
  });

  test('should read a file', async () => {
    // Create test file
    const testFilePath = join(testDir, 'read-test.txt');
    const testContent = 'This is test content for reading';
    await fs.writeFile(testFilePath, testContent);
    
    // Call the read_file tool
    const result = await client.callTool('read_file', { path: testFilePath });
    
    // Verify results
    expect(result.content).toHaveLength(1);
    expect(result.content[0].text).toBe(testContent);
  });

  test('should write a file', async () => {
    // Path for test file
    const testFilePath = join(testDir, 'write-test.txt');
    const testContent = 'This is new content to write';
    
    // Call the write_file tool
    const result = await client.callTool('write_file', { 
      path: testFilePath, 
      content: testContent 
    });
    
    // Verify tool result
    expect(result.content).toHaveLength(1);
    expect(result.content[0].text).toContain('Successfully wrote to');
    
    // Verify file was actually written
    const fileContent = await fs.readFile(testFilePath, 'utf-8');
    expect(fileContent).toBe(testContent);
  });

  test('should create a directory', async () => {
    // Path for test directory
    const newDirPath = join(testDir, 'new-dir', 'nested-dir');
    
    // Call the create_directory tool
    const result = await client.callTool('create_directory', { 
      path: newDirPath
    });
    
    // Verify tool result
    expect(result.content).toHaveLength(1);
    expect(result.content[0].text).toContain('Successfully created directory');
    
    // Verify directory was actually created
    const dirExists = existsSync(newDirPath);
    expect(dirExists).toBe(true);
  });

  test('should search for files', async () => {
    // Create test files with specific pattern
    await fs.writeFile(join(testDir, 'search-test1.md'), '# Markdown file 1');
    await fs.writeFile(join(testDir, 'search-test2.md'), '# Markdown file 2');
    await fs.writeFile(join(testDir, 'other-file.txt'), 'Not a markdown file');
    
    // Call the search_files tool to find markdown files
    const result = await client.callTool('search_files', { 
      path: testDir,
      pattern: '*.md'
    });
    
    // Verify results
    expect(result.content).toHaveLength(1);
    
    const searchResults = result.content[0].text as string;
    expect(searchResults).toContain('search-test1.md');
    expect(searchResults).toContain('search-test2.md');
    expect(searchResults).not.toContain('other-file.txt');
  });

  test('should get file info', async () => {
    // Create test file 
    const testFilePath = join(testDir, 'info-test.txt');
    await fs.writeFile(testFilePath, 'File for testing info');
    
    // Call the get_file_info tool
    const result = await client.callTool('get_file_info', { 
      path: testFilePath
    });
    
    // Verify results
    expect(result.content).toHaveLength(1);
    
    const infoText = result.content[0].text as string;
    expect(infoText).toContain('path:');
    expect(infoText).toContain('size:');
    expect(infoText).toContain('type:');
    expect(infoText).toContain('created:');
    expect(infoText).toContain('modified:');
  });

  test('should move a file', async () => {
    // Create source file 
    const sourceFilePath = join(testDir, 'move-source.txt');
    const destFilePath = join(testDir, 'move-dest.txt');
    const testContent = 'File to be moved';
    
    await fs.writeFile(sourceFilePath, testContent);
    
    // Call the move_file tool
    const result = await client.callTool('move_file', { 
      source: sourceFilePath,
      destination: destFilePath
    });
    
    // Verify tool result
    expect(result.content).toHaveLength(1);
    expect(result.content[0].text).toContain('Successfully moved');
    
    // Verify source file doesn't exist
    const sourceExists = existsSync(sourceFilePath);
    expect(sourceExists).toBe(false);
    
    // Verify destination file exists with correct content
    const destExists = existsSync(destFilePath);
    expect(destExists).toBe(true);
    
    const movedContent = await fs.readFile(destFilePath, 'utf-8');
    expect(movedContent).toBe(testContent);
  });

  test('should edit file blocks', async () => {
    // Create file with content to edit
    const editFilePath = join(testDir, 'edit-block-test.txt');
    const originalContent = 'Line 1: This is original content.\nLine 2: Do not modify this line.\nLine 3: This line will be edited.';
    
    await fs.writeFile(editFilePath, originalContent);
    
    // Create the edit block content
    const blockContent = `${editFilePath}
<<<<<<< SEARCH
Line 3: This line will be edited.
=======
Line 3: This line has been edited successfully.
>>>>>>> REPLACE`;
    
    // Call the edit_block tool
    const result = await client.callTool('edit_block', { 
      blockContent
    });
    
    // Verify tool result
    expect(result.content).toHaveLength(1);
    expect(result.content[0].text).toContain('Successfully applied edit');
    
    // Verify file was actually edited correctly
    const editedContent = await fs.readFile(editFilePath, 'utf-8');
    expect(editedContent).toContain('Line 1: This is original content.');
    expect(editedContent).toContain('Line 2: Do not modify this line.');
    expect(editedContent).toContain('Line 3: This line has been edited successfully.');
    expect(editedContent).not.toContain('Line 3: This line will be edited.');
  });
});
