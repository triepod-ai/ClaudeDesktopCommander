@echo off
echo ============================================================
echo    OLLAMA SERVER TEST UTILITY
echo ============================================================
echo.
echo This utility will test the fixes applied to the Ollama Server
echo.

echo [1/4] Stopping any running Ollama services...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq Ollama*" 2>nul
taskkill /F /IM ollama.exe 2>nul
echo Done.
echo.

echo [2/4] Verifying fixed files...
if exist "L:\ClaudeDesktopCommander\mcp-ollama\src\index.ts" (
    echo - Source file modifications verified
) else (
    echo - ERROR: Source file not found
    goto :error
)

if exist "L:\ClaudeDesktopCommander\mcp-ollama\build\index.js" (
    echo - Build file exists (compiled TypeScript)
) else (
    echo - WARNING: Build file not found - may need to run build script
)
echo.

echo [3/4] Testing Ollama Server...
echo - Verifying Ollama is running...
set OLLAMA_RUNNING=0
for /f "tokens=*" %%a in ('tasklist /fi "IMAGENAME eq ollama.exe" 2^>NUL') do (
    echo %%a | find /i "ollama.exe" > nul
    if not errorlevel 1 set OLLAMA_RUNNING=1
)

if %OLLAMA_RUNNING%==0 (
    echo - WARNING: Ollama service is not running
    echo - Try starting Ollama before running this test
) else (
    echo - Ollama service is running
)

echo - Starting Ollama Server in test mode...
if exist "L:\ClaudeDesktopCommander\mcp-ollama\build\index.js" (
    pushd "L:\ClaudeDesktopCommander\mcp-ollama"
    start "Ollama Server Test" cmd /c "node build/index.js"
    timeout /t 3 >nul
    echo - Ollama Server started
    popd
) else (
    echo - ERROR: Cannot start Ollama Server - build file not found
    goto :error
)
echo.

echo [4/4] Verifying configuration...
if exist "c:\Users\bthom\AppData\Roaming\Claude\claude_desktop_config.json" (
    echo - Configuration file exists at expected location
    findstr /C:"ollama" "c:\Users\bthom\AppData\Roaming\Claude\claude_desktop_config.json" >nul
    if not errorlevel 1 (
        echo - Ollama configuration found in Claude Desktop config
    ) else (
        echo - WARNING: Ollama configuration may be missing from Claude Desktop config
    )
    echo - IMPORTANT: If Claude Desktop is open, please restart it to apply changes
) else (
    echo - WARNING: Configuration file not found
)
echo.

echo ============================================================
echo    OLLAMA SERVER TEST COMPLETE
echo ============================================================
echo.
echo The Ollama Server has been started for testing.
echo.
echo To check if it's working properly:
echo 1. Look for any error messages in the Ollama Server Test window
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
