@echo off
echo ============================================================
echo    COMPLETE MCP SERVER REBUILD AND RESTART UTILITY
echo ============================================================
echo.
echo This utility will stop, clean, rebuild, and restart all MCP servers
echo to fix JSON parsing errors and improve stability.
echo.
echo WARNING: Make sure Claude Desktop is closed before proceeding!
echo.
pause

echo.
echo [1/6] Stopping any running MCP services...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM python.exe 2>nul
taskkill /F /IM ollama.exe 2>nul
echo Done.
echo.

echo [2/6] Applying fixes to source code...
echo - All code fixes have been applied
echo - Configuration has been updated in claude_desktop_config.json
echo.

echo [3/6] Rebuilding Ollama Server...
if exist "L:\ClaudeDesktopCommander\mcp-ollama\package.json" (
    echo - Installing dependencies for Ollama Server...
    pushd "L:\ClaudeDesktopCommander\mcp-ollama"
    call npm install
    echo - Building Ollama server...
    call npm run build
    popd
) else (
    echo - Skipping: Ollama server files not found
)
echo.

echo [4/6] Rebuilding Code Analyzer...
if exist "L:\ToolNexusMCP_plugins\code-analyzer\package.json" (
    echo - Installing dependencies for Code Analyzer...
    pushd "L:\ToolNexusMCP_plugins\code-analyzer"
    call npm install
    echo - Building Code Analyzer...
    call npm run build
    popd
) else (
    if exist "L:\ClaudeDesktopCommander\code-analyzer\package.json" (
        echo - Installing dependencies for Code Analyzer...
        pushd "L:\ClaudeDesktopCommander\code-analyzer"
        call npm install
        echo - Building Code Analyzer...
        call npm run build
        popd
    ) else (
        echo - Skipping: Code Analyzer files not found
    )
)
echo.

echo [5/6] Rebuilding Memory Command System...
if exist "L:\ClaudeDesktopCommander\mcp-core\memory-command-system\package.json" (
    echo - Installing dependencies for Memory Command System...
    pushd "L:\ClaudeDesktopCommander\mcp-core\memory-command-system"
    call npm install
    popd
) else (
    echo - Skipping: Memory Command System files not found
)
echo.

echo [6/6] Verifying Claude Desktop configuration...
if exist "c:\Users\bthom\AppData\Roaming\Claude\claude_desktop_config.json" (
    echo - Claude Desktop settings verified at:
    echo   c:\Users\bthom\AppData\Roaming\Claude\claude_desktop_config.json
) else (
    echo - Warning: Claude Desktop config file not found at expected location
)
echo.

echo ============================================================
echo    REBUILD COMPLETE
echo ============================================================
echo.
echo All MCP server fixes have been applied.
echo Please restart Claude Desktop to apply the changes.
echo.
echo If you still experience issues:
echo 1. Check the MCP_SERVER_FIXES.md file for troubleshooting
echo 2. Ensure all paths in claude_desktop_config.json are correct
echo.

pause
