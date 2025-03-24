// Jest setup file
import { join } from 'path';
import * as fs from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';

// Create the test temp directory if it doesn't exist
const testTempDir = join(process.cwd(), 'test', 'temp');
if (!existsSync(testTempDir)) {
  mkdirSync(testTempDir, { recursive: true });
}

// Increase test timeout for e2e tests
// For ESM compatibility
import { jest } from '@jest/globals';
jest.setTimeout(30000);

// Global teardown to clean up temp files
// For ESM compatibility
import { afterAll } from '@jest/globals';
afterAll(async () => {
  try {
    // Read temp directory
    const entries = await fs.readdir(testTempDir);
    
    // Clean up test directories
    for (const entry of entries) {
      if (entry.startsWith('test-')) {
        await fs.rm(join(testTempDir, entry), { recursive: true, force: true });
      }
    }
  } catch (error) {
    console.error('Error cleaning up test directories:', error);
  }
});
