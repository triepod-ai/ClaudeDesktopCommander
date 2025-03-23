@echo off
REM Run the MCP server for Claude Desktop
cd /d "L:\ClaudeDesktopCommander\mcp-core"
"C:\Program Files\nodejs\node.exe" --no-warnings dist/index.js
