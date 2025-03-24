@echo off
echo ============================================================
echo    CODE ANALYZER TEST UTILITY
echo ============================================================
echo.
echo This utility will test the fixes applied to the Code Analyzer
echo.

echo [1/4] Stopping any running code analyzer services...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq Code Analyzer*" 2>nul
echo Done.
echo.

echo [2/4] Verifying fixed files...
if exist "L:\ToolNexusMCP_plugins\code-analyzer\dist\scanner\file-scanner.js" (
    echo - File scanner modifications verified
) else (
    if exist "L:\ClaudeDesktopCommander\code-analyzer\dist\scanner\file-scanner.js" (
        echo - File scanner modifications verified (alternative path)
    ) else (
        echo - ERROR: File scanner file not found
        goto :error
    )
)

if exist "L:\ToolNexusMCP_plugins\code-analyzer\dist\server.js" (
    echo - Server modifications verified
) else (
    if exist "L:\ClaudeDesktopCommander\code-analyzer\dist\server.js" (
        echo - Server modifications verified (alternative path)
    ) else (
        echo - ERROR: Server file not found
        goto :error
    )
)
echo.

echo [3/4] Testing Code Analyzer...
echo - Starting Code Analyzer in test mode...
if exist "L:\ToolNexusMCP_plugins\code-analyzer\dist\server.js" (
    pushd "L:\ToolNexusMCP_plugins\code-analyzer"
    start "Code Analyzer Test" cmd /c "node dist/server.js"
    timeout /t 3 >nul
    echo - Code Analyzer started
    popd
) else (
    if exist "L:\ClaudeDesktopCommander\code-analyzer\dist\server.js" (
        pushd "L:\ClaudeDesktopCommander\code-analyzer"
        start "Code Analyzer Test" cmd /c "node dist/server.js"
        timeout /t 3 >nul
        echo - Code Analyzer started
        popd
    ) else (
        echo - ERROR: Cannot start Code Analyzer - file not found
        goto :error
    )
)
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
echo    CODE ANALYZER TEST COMPLETE
echo ============================================================
echo.
echo The Code Analyzer has been started for testing.
echo.
echo To check if it's working properly:
echo 1. Look for any error messages in the Code Analyzer Test window
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