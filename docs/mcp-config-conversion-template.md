# Claude Desktop to Windsurf MCP Configuration Conversion Process

## Overview

This document outlines the process for converting Claude Desktop MCP server configurations to Windsurf-compatible configurations. Both systems use JSON configuration formats that are similar in structure but have important differences that must be addressed during conversion.

## Configuration Format Comparison

### Claude Desktop Format
```json
{
  "mcpServers": {
    "serverName": {
      "command": "executable",
      "args": ["arg1", "arg2"],
      "env": {
        "ENV_VAR": "value"
      }
    }
  }
}
```

### Windsurf Format
```json
{
  "mcpServers": {
    "serverName": {
      "command": "executable",
      "args": ["arg1", "arg2"],
      "env": {
        "ENV_VAR": "${ENV_VAR}"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

## Key Differences

1. **Required Fields**: Windsurf requires additional fields:
   - `disabled`: Boolean flag to enable/disable the server
   - `autoApprove`: Array of tools that are automatically approved for use

2. **Environment Variables**: 
   - Claude Desktop: Direct values
   - Windsurf: Uses `${ENV_VAR}` syntax for variable references

3. **Path Format**:
   - Windsurf typically requires Windows-style backslashes in paths

4. **Server Naming Conventions**:
   - Windsurf often uses hyphenated names (e.g., "desktop-commander")
   - Claude Desktop may use camelCase (e.g., "desktopCommander")

## Conversion Process

1. **Copy Base Structure**
   - Maintain the `mcpServers` object structure
   - Preserve server names unless they need to be reformatted

2. **Add Required Windsurf Fields**
   - Add `"disabled": false` to each server configuration
   - Add `"autoApprove": []` to each server configuration
   - Ensure `"env": {}` exists (empty object if no environment variables)

3. **Convert Environment Variables**
   - Change direct value references to `${ENV_VAR}` syntax
   - Document which environment variables need to be set in Windsurf

4. **Standardize Paths**
   - Convert forward slashes to backslashes in Windows paths
   - Use double backslashes for JSON escaping (`\\`)

5. **Validate Configuration**
   - Check for any missed fields or syntax errors
   - Confirm all server references are properly formatted

## Example Conversion

### Claude Desktop Configuration
```json
{
  "mcpServers": {
    "braveSearch": {
      "command": "node",
      "args": [
        "L:/plugins/brave-search/index.js"
      ],
      "env": {
        "BRAVE_API_KEY": "api-key-value-here"
      }
    }
  }
}
```

### Converted Windsurf Configuration
```json
{
  "mcpServers": {
    "brave-search": {
      "command": "node",
      "args": [
        "L:\\plugins\\brave-search\\index.js"
      ],
      "env": {
        "BRAVE_API_KEY": "${BRAVE_API_KEY}"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

## Configuration Testing

After conversion, test the configuration:

1. **Environment Setup**
   - Ensure all referenced environment variables are properly set
   - Example: `setx BRAVE_API_KEY "your-api-key-here"`

2. **Initial Testing**
   - Start with one server to verify configuration format
   - Check logs for any startup errors

3. **Full Integration**
   - Add remaining servers after initial validation
   - Test each server's functionality 

## Troubleshooting

Common issues and their solutions:

1. **Path Errors**
   - Double-check path separators (use `\\` in JSON)
   - Verify absolute paths are correctly specified

2. **Environment Variable Issues**
   - Confirm variables are set in the environment
   - Check for typos in variable names

3. **Server Not Found**
   - Verify the executable path is correct
   - Check if any prerequisite services need to be running

4. **Permission Errors**
   - Ensure Windsurf has appropriate permissions to run the specified commands
   - Check file permissions on executable files

## Quick Reference

| Claude Desktop Feature | Windsurf Equivalent |
|------------------------|---------------------|
| `"serverName"` | `"server-name"` (hyphenated) |
| `"env": {"KEY": "value"}` | `"env": {"KEY": "${KEY}"}` |
| `"L:/path"` | `"L:\\path"` |
| *(optional fields)* | `"disabled": false, "autoApprove": []` |
