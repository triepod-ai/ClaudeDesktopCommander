/**
 * Mock Server for MCP Core Testing
 * 
 * This implementation mocks the server's API without direct dependencies
 * on the actual server implementation.
 */

// Mock server implementation that mimics the real server's interface
export class MockServer {
  private isRunning: boolean = false;

  // Start the mock server
  async start(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;
  }

  // Stop the mock server
  async stop(): Promise<void> {
    if (!this.isRunning) return;
    this.isRunning = false;
  }

  // Mock implementation of tool listing
  async listTools() {
    return {
      tools: [
        {
          name: "execute_command",
          description: "Execute a terminal command",
          inputSchema: { type: "object", properties: {} }
        },
        {
          name: "read_file",
          description: "Read file contents",
          inputSchema: { type: "object", properties: {} }
        },
        {
          name: "write_file",
          description: "Write file contents",
          inputSchema: { type: "object", properties: {} }
        },
        // Add more mock tools as needed
      ]
    };
  }

  // Mock implementation of tool calling
  async callTool(name: string, args: Record<string, any>) {
    // Implement basic mock functionality for each tool
    switch (name) {
      case "execute_command": {
        return {
          content: [{ type: "text", text: `Command started with PID 12345\nInitial output:\nMock command output` }]
        };
      }
      case "read_file": {
        return {
          content: [{ type: "text", text: `Mock file content for ${args.path}` }]
        };
      }
      case "write_file": {
        return {
          content: [{ type: "text", text: `Successfully wrote to ${args.path}` }]
        };
      }
      // Add more mock implementations as needed
      case "non_existent_tool": {
        return {
          content: [{ type: "text", text: `Error: Unknown tool: non_existent_tool` }],
          isError: true
        };
      }
      default: {
        return {
          content: [{ type: "text", text: `Mock response for ${name}` }]
        };
      }
    }
  }
}

// Create a new mock server instance
export function createMockServer(): MockServer {
  return new MockServer();
}
