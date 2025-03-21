# Claude Desktop Commander MCP Testing Guide

This guide will help you test the integration between Claude Desktop and the Claude Desktop Commander MCP server.

## Prerequisites

1. Claude Desktop app installed
2. Claude Desktop Commander MCP server configured in Claude Desktop config
3. API key configured in Claude Desktop config

## Testing Process

### Step 1: Restart Claude Desktop

If Claude Desktop is currently running, please restart it to ensure it loads the updated configuration with the MCP server.

### Step 2: Test Terminal Command Execution

1. Open Claude Desktop
2. Type or ask: "Execute the command `dir` (or `ls` on Mac/Linux) and show me the results"
3. Claude should use the Commander MCP to execute the command and display the results
4. Expected outcome: Claude shows the directory listing from your system

### Step 3: Test File Operations

1. In Claude Desktop, ask: "Read the content of this file: `L:\ClaudeDesktopCommander\test\test-data\test-file.txt`"
2. Claude should use the Commander MCP to read the file and display its contents
3. Expected outcome: Claude shows the content of the test file:
   ```
   This is a test file.
   It has multiple lines.
   This line will be modified.
   ```

### Step 4: Test Search & Replace

1. In Claude Desktop, ask: "In the file `L:\ClaudeDesktopCommander\test\test-data\edit-test.js`, change 'Original message' to 'Updated message'"
2. Claude should use the Commander MCP to edit the file
3. Expected outcome: Claude confirms the file has been updated
4. Verification: You can check the file was modified by asking Claude to read the file again

### Step 5: Test Process Management

1. In Claude Desktop, ask: "List all running processes on my system"
2. Claude should use the Commander MCP to fetch and display the list of processes
3. Expected outcome: Claude shows a list of running processes with their PIDs and resource usage

### Step 6: Test Long-Running Commands

1. In Claude Desktop, ask: "Execute the command `ping -t google.com` (Windows) or `ping google.com` (Mac/Linux) with a timeout of 5 seconds"
2. Claude should start the command and show initial output before timeout
3. Ask Claude to read the output using the session ID or PID it provides
4. Expected outcome: Claude shows more output from the ongoing command execution
5. Ask Claude to terminate the command
6. Expected outcome: Claude confirms the command has been terminated

## Error Handling Testing

1. Ask Claude to execute a blocked command like: "Execute the command `sudo ls`"
2. Expected outcome: Claude should inform you that the command is blocked for security reasons

## Advanced Testing

### File Editing Pattern Testing

1. Ask Claude to make multiple changes to a file: "In the file `L:\ClaudeDesktopCommander\test\test-data\edit-test.js`, change 'Original message' to 'Updated message' and change 'enabled: false' to 'enabled: true'"
2. Expected outcome: Claude should successfully make both changes using the edit_block feature

### Directory Operations

1. Ask Claude to list all files in the test directory: "List all files in `L:\ClaudeDesktopCommander\test\test-data`"
2. Expected outcome: Claude should display a list of files in the test directory

## Troubleshooting

If you encounter issues:

1. Check if Claude Desktop is properly configured with the API key
2. Verify the MCP server configuration in the Claude config file
3. Check if the test files exist in the expected locations
4. Restart Claude Desktop if needed
5. Check the logs in `L:\ClaudeDesktopCommander\logs` for any error messages

## Reporting Results

If you encounter any issues during testing, please report them with:
1. The exact command you asked Claude to execute
2. The expected behavior
3. The actual behavior or error message
4. Any relevant log information

## Next Steps

After completing the testing, if everything works as expected, you're ready to use the Claude Desktop Commander MCP for more advanced tasks!
