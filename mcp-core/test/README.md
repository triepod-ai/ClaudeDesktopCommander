# End-to-End Tests for MCP-Core

This directory contains end-to-end (E2E) tests for the MCP-Core application. The tests validate functionality in an integrated manner.

## Test Structure

- `e2e/` - Contains all end-to-end test files organized by functionality
- `utils/` - Contains test utilities, helpers, and setup code
- `temp/` - Temporary directory for test files (automatically cleaned up after tests)

## Testing Approaches

This test framework provides two testing approaches:

1. **Real Filesystem Tests** - Tests that work with the actual filesystem, creating temporary directories and files for testing basic operations without requiring the server to be running.

2. **Mock Server Tests** - Tests that use mock implementations of the server and client to simulate MCP operations without direct dependencies on the main codebase.

## Running Tests

The following npm scripts are available for running tests:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run all end-to-end tests
npm run test:e2e

# Run only mock server tests
npm run test:mock

# Run only basic filesystem tests
npm run test:basic
```

## Test Files

- `basic.test.ts` - Simple tests to verify the testing infrastructure
- `mock-server.test.ts` - Tests using the mock server implementation
- `mock-filesystem.test.ts` - Filesystem tests using real filesystem operations

## Mock Implementations

### MockServer

The `MockServer` class in `utils/mock-server.ts` provides a simplified implementation of the MCP server API without the full dependencies. It includes:

- Tool listing functionality
- Tool execution simulation
- Error handling

### MockClient

The `MockClient` class in `utils/mock-client.ts` provides a client that works with the MockServer, featuring:

- Connection management
- Tool listing
- Tool execution

## Adding New Tests

When adding new tests:

1. Add test files to the appropriate subdirectory under `e2e/`
2. Use the `mock-*.test.ts` naming pattern for mock-based tests
3. Follow the existing pattern of creating before/after hooks
4. Use the test utilities in `utils/` for common operations
5. Clean up any resources created during tests

## Debugging Tests

For debugging tests:

1. Use the `--no-cache` flag: `npx jest test/e2e/your-test.ts --no-cache`
2. Run a single test with `--testNamePattern`: `npx jest -t "should do something"`
3. Increase verbosity with `--verbose`

## Temporary Files

Tests that create files use the `test/temp` directory, which is:

1. Created automatically if it doesn't exist
2. Test files are created in uniquely named subdirectories to prevent conflicts
3. Automatically cleaned up after tests complete

The pattern used for test directories is: `test-{timestamp}-{random}`
