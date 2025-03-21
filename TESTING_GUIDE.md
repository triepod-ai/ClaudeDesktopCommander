# MCP Integration Testing Guide

This guide will help you test the integration between Claude clients (Claude Desktop and Windsurf) and the various MCP servers we've configured.

## Prerequisites

1. Claude Desktop app or Windsurf extension installed
2. MCP servers configured (see [MCP_SETUP_GUIDE.md](./MCP_SETUP_GUIDE.md))
3. API keys configured for any services you'll be testing

## General Testing Process

1. **Restart your Claude client** after making any configuration changes
2. **Test one MCP server at a time** to isolate any issues
3. **Record the results** of each test for troubleshooting
4. **Check logs** if something doesn't work as expected

## Testing by Client

### Claude Desktop Testing

1. Open Claude Desktop
2. Type or ask a query that will trigger the use of an MCP server
3. Verify the expected result is returned
4. If there's an error, check the console logs (Help > Toggle Developer Tools)

### Windsurf Testing

1. Open VS Code with the Windsurf extension
2. Use the Windsurf chat panel to ask a query that will trigger the use of an MCP server
3. Verify the expected result is returned
4. If there's an error, check the Output panel (View > Output > Windsurf)

## Testing Desktop Commander

### Test Terminal Command Execution

1. Ask: "Execute the command `dir` (or `ls` on Mac/Linux) and show me the results"
2. Expected outcome: Directory listing from your system is displayed

### Test File Operations

1. Ask: "Read the content of this file: `L:\ClaudeDesktopCommander\test\test-data\test-file.txt`"
2. Expected outcome: Content of the test file is displayed:
   ```
   This is a test file.
   It has multiple lines.
   This line will be modified.
   ```

### Test Search & Replace

1. Ask: "In the file `L:\ClaudeDesktopCommander\test\test-data\edit-test.js`, change 'Original message' to 'Updated message'"
2. Expected outcome: File is updated successfully
3. Verification: Ask to read the file again to confirm changes

### Test Process Management

1. Ask: "List all running processes on my system"
2. Expected outcome: List of running processes with PIDs and resource usage

### Test Long-Running Commands

1. Ask: "Execute the command `ping -t google.com` (Windows) or `ping google.com` (Mac/Linux) with a timeout of 5 seconds"
2. Expected outcome: Initial output is shown before timeout
3. Ask to read the output using the session ID or PID provided
4. Expected outcome: More output from the ongoing command execution
5. Ask to terminate the command
6. Expected outcome: Command is terminated successfully

## Testing LLM API Servers

### Claude API

1. Ask: "Use the claude server to generate a short story about a robot learning to paint"
2. Expected outcome: A story generated using the Claude API

### OpenAI API

1. Ask: "Use the openai server to generate a JavaScript function that calculates Fibonacci numbers"
2. Expected outcome: A code snippet generated using the OpenAI API

### Other LLM APIs

Test other LLM API servers (mistral, perplexity, etc.) with similar prompts.

## Testing Data Storage Servers

### Pinecone

1. Ask: "Use the pinecone server to list available indexes"
2. Expected outcome: List of vector indexes in your Pinecone account

### Supabase

1. Ask: "Use the supabase server to run a simple query on a table"
2. Expected outcome: Query results from your Supabase database

### Redis

1. Ask: "Use the redis server to set a key named 'test' with the value 'hello world'"
2. Expected outcome: Confirmation that the key was set

## Testing External API Servers

### GitHub

1. Ask: "Use the github server to list my repositories"
2. Expected outcome: List of repositories from your GitHub account

### Google Maps

1. Ask: "Use the google-maps server to find the coordinates of the Empire State Building"
2. Expected outcome: Latitude and longitude coordinates

### Brave Search

1. Ask: "Use the braveapi server to search for 'renewable energy news'"
2. Expected outcome: Search results about renewable energy

## Testing Combined Workflows

1. Ask: "Use the openai server to generate a short poem, then save it to a file called poem.txt"
2. Expected outcome: A poem generated and saved to a file

2. Ask: "Search for information about climate change using the braveapi server, then summarize the results using the claude server"
3. Expected outcome: Search results and a summary

## Error Handling Testing

1. Ask to execute a blocked command: "Execute the command `sudo ls`"
2. Expected outcome: Information that the command is blocked for security reasons

2. Try to use a server without proper API keys: "Use the github server to list repositories" (with invalid token)
3. Expected outcome: Clear error message about authentication failure

## Advanced Testing

### File Editing Pattern Testing

1. Ask to make multiple changes to a file: "In the file `L:\ClaudeDesktopCommander\test\test-data\edit-test.js`, change 'Original message' to 'Updated message' and change 'enabled: false' to 'enabled: true'"
2. Expected outcome: Both changes successfully applied using the edit_block feature

### Chain of Tool Usage

1. Ask to perform a sequence of operations: "Create a new directory called 'test-output', generate a JSON file with random data using the openai server, save it to the new directory, then read it back"
2. Expected outcome: All operations complete successfully in sequence

### Concurrent Operations

1. Ask to start a long-running command, then immediately ask for other information
2. Expected outcome: The long-running command continues in the background while other requests are processed

## Troubleshooting

If you encounter issues:

### Client Issues

1. Check if your Claude client is properly configured
2. Verify API keys are set correctly
3. Restart the client after configuration changes
4. Ensure you have the latest version of the client

### MCP Server Issues

1. Verify the MCP server configuration is correct
2. Check if required dependencies are installed
3. Look for error messages in the logs:
   - Desktop Commander: `L:\ClaudeDesktopCommander\logs`
   - Other servers: Check the terminal output or system logs
4. Try running the MCP server directly from the command line

## Reporting Results

When reporting issues, include:

1. The exact query you used
2. The expected behavior
3. The actual behavior or error message
4. Client and environment information:
   - Operating system
   - Claude client and version
   - MCP server version
   - Any relevant configuration settings
5. Log snippets showing the error

Use the [TEST_REPORT_TEMPLATE.md](./TEST_REPORT_TEMPLATE.md) format for consistent reporting.

## Next Steps

After successfully testing all MCP servers:

1. Document any configuration adjustments made during testing
2. Share successful test results with the team
3. Consider automating some tests for future updates
4. Explore more advanced use cases combining multiple MCP servers
