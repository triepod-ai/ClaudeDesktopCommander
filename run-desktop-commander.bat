@echo off
REM This is a launcher for the Claude Desktop MCP Server
REM Points to the reorganized component structure

cd /d "L:\ClaudeDesktopCommander\mcp-core"
"C:\Program Files\nodejs\node.exe" --no-warnings dist/index.js
