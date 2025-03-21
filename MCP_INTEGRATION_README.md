# Claude Desktop MCP Server Integration Guide

This document explains how to properly configure and integrate MCP servers with Claude Desktop.

## MCP Server Configuration Format

The Claude Desktop app uses a specific format in its configuration file to specify MCP servers:

```json
{
  "apiKey": "YOUR_ANTHROPIC_API_KEY",
  "serverConfig": {
    "command": "cmd.exe",
    "args": [
      "/c"
    ]
  },
  "mcpServers": {
    "serverName": {
      "command": "FULL_PATH_TO_EXECUTABLE",
      "args": [
        "ARG1",
        "ARG2",
        "etc"
      ]
    }
  }
}
```

### Configuration Components:

1. **apiKey**: Your Anthropic API key for Claude
2. **serverConfig**: Base configuration for command execution
3. **mcpServers**: Collection of MCP servers, each with:
   - A unique name as the key (e.g., "desktopCommander")
   - A `command` field with the full path to the executable
   - An `args` array with command-line arguments

## Claude Desktop Commander MCP Server

We've configured our Desktop Commander MCP server using a batch script approach:

```json
"desktopCommander": {
  "command": "L:\\ClaudeDesktopCommander\\run-desktop-commander.bat",
  "args": []
}
```

The batch script (`run-desktop-commander.bat`) ensures:
1. The correct working directory is set
2. Absolute paths are used for all components
3. The Node.js executable is properly referenced

## Alternative Configuration Methods

### Direct Node.js Execution

```json
"desktopCommander": {
  "command": "C:\\Program Files\\nodejs\\node.exe",
  "args": [
    "L:\\ClaudeDesktopCommander\\dist\\index.js"
  ]
}
```

### Python-based MCP Servers Example

For Python-based MCP servers using `uv` (as shown in your example):

```json
"weather": {
  "command": "C:\\full\\path\\to\\uv.exe",
  "args": [
    "--directory",
    "C:\\ABSOLUTE\\PATH\\TO\\PARENT\\FOLDER\\weather",
    "run",
    "weather.py"
  ]
}
```

## Testing MCP Integration

Use the provided test scripts to verify integration:

1. `run-tests.bat`: Checks configuration and creates test data
2. `TESTING_GUIDE.md`: Provides detailed testing steps
3. `TEST_REPORT_TEMPLATE.md`: For documenting test results

## Troubleshooting

If Claude Desktop fails to connect to your MCP server:

1. Check that Claude Desktop has been restarted after configuration changes
2. Verify that all paths in the configuration are absolute paths
3. Confirm the executable specified in `command` exists and is accessible
4. Check logs in the Claude Desktop app for error messages
5. Try running the MCP server directly from the command line to verify it works

## Important Notes

- Always use absolute paths in the configuration
- Make sure the executable has appropriate permissions
- Restart Claude Desktop after making changes to the configuration
- Batch scripts can help manage complex startup requirements
