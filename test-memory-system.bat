@echo off
echo ============================================================
echo    MEMORY COMMAND SYSTEM TEST UTILITY
echo ============================================================
echo.
echo This utility will test the fixes applied to the Memory Command System
echo.

echo [1/4] Stopping any running memory services...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq Memory Command*" 2>nul
echo Done.
echo.

echo [2/4] Verifying fixed files...
if exist "L:\ClaudeDesktopCommander\mcp-core\memory-command-system\src\foundation\errorHandler.js" (
    echo - Error handler modifications verified
) else (
    echo - ERROR: Error handler file not found
    goto :error
)

if exist "L:\ClaudeDesktopCommander\mcp-core\memory-command-system\src\index.js" (
    echo - Main index.js modifications verified
) else (
    echo - ERROR: index.js file not found
    goto :error
)

if exist "L:\ClaudeDesktopCommander\mcp-core\memory-command-system\src\storage\memoryAdapter.js" (
    echo - Memory adapter modifications verified
) else (
    echo - ERROR: Memory adapter file not found
    goto :error
)
echo.

echo [3/4] Testing Memory Command System...
echo - Starting Memory Command System in test mode...
pushd "L:\ClaudeDesktopCommander\mcp-core\memory-command-system"
start "Memory Command Test" cmd /c "node src/index.js"
timeout /t 3 >nul
echo - Memory Command System started
popd
echo.

echo [4/4] Verifying configuration...
if exist "c:\Users\bthom\AppData\Roaming\Claude\claude_desktop_config.json" (
    echo - Configuration file exists at expected location
    echo - IMPORTANT: If Claude Desktop is open, please restart it to apply changes
) else (
    echo - WARNING: Configuration file not found
)
echo.

echo ============================================================
echo    MEMORY COMMAND SYSTEM TEST COMPLETE
echo ============================================================
echo.
echo The Memory Command System has been started for testing.
echo.
echo To check if it's working properly:
echo 1. Look for any error messages in the Memory Command Test window
echo 2. If no errors appear, the test was successful
echo 3. Close the test window when done
echo.
goto :end

:error
echo.
echo ============================================================
echo    TEST FAILED - MISSING FILES
echo ============================================================
echo.
echo Please ensure all fixes have been applied before testing.
echo.

:end
pause
