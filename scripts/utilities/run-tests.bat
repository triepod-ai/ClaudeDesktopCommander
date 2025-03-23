@echo off
echo ===================================================
echo Claude Desktop Commander MCP Integration Test Suite
echo ===================================================
echo.

REM Check if Claude Desktop config exists
echo Checking Claude Desktop configuration...
if exist "%APPDATA%\Claude\claude_desktop_config.json" (
    echo [OK] Claude Desktop config found
) else (
    echo [ERROR] Claude Desktop config not found
    exit /b 1
)

REM Check if the batch script exists
echo Checking batch script...
if exist "L:\ClaudeDesktopCommander\run-desktop-commander.bat" (
    echo [OK] Desktop Commander batch script found
) else (
    echo [ERROR] Desktop Commander batch script not found
    exit /b 1
)

REM Create test data if it doesn't exist
echo Creating test data...
if not exist "L:\ClaudeDesktopCommander\test\test-data" (
    mkdir "L:\ClaudeDesktopCommander\test\test-data"
)
echo This is a test file.> "L:\ClaudeDesktopCommander\test\test-data\test-file.txt"
echo It has multiple lines.>> "L:\ClaudeDesktopCommander\test\test-data\test-file.txt"
echo This line will be modified.>> "L:\ClaudeDesktopCommander\test\test-data\test-file.txt"

REM Create test JavaScript file if it doesn't exist
echo Creating test JavaScript file...
echo // Sample JavaScript file for edit testing > "L:\ClaudeDesktopCommander\test\test-data\edit-test.js"
echo function testFunction() { >> "L:\ClaudeDesktopCommander\test\test-data\edit-test.js"
echo   console.log("Original message"); >> "L:\ClaudeDesktopCommander\test\test-data\edit-test.js"
echo   return true; >> "L:\ClaudeDesktopCommander\test\test-data\edit-test.js"
echo } >> "L:\ClaudeDesktopCommander\test\test-data\edit-test.js"
echo. >> "L:\ClaudeDesktopCommander\test\test-data\edit-test.js"
echo const config = { >> "L:\ClaudeDesktopCommander\test\test-data\edit-test.js"
echo   enabled: false, >> "L:\ClaudeDesktopCommander\test\test-data\edit-test.js"
echo   timeout: 5000, >> "L:\ClaudeDesktopCommander\test\test-data\edit-test.js"
echo   retries: 3 >> "L:\ClaudeDesktopCommander\test\test-data\edit-test.js"
echo }; >> "L:\ClaudeDesktopCommander\test\test-data\edit-test.js"
echo. >> "L:\ClaudeDesktopCommander\test\test-data\edit-test.js"
echo export { testFunction, config }; >> "L:\ClaudeDesktopCommander\test\test-data\edit-test.js"

echo [OK] Test data created successfully

REM Display test instructions
echo.
echo ===================================================
echo Test Instructions
echo ===================================================
echo.
echo 1. Restart Claude Desktop to load the updated configuration
echo 2. Test the following commands in Claude Desktop:
echo.
echo   A. Terminal Command Test:
echo      "Execute the command 'dir' and show me the results"
echo.
echo   B. File Operation Test:
echo      "Read the content of this file: L:\ClaudeDesktopCommander\test\test-data\test-file.txt"
echo.
echo   C. Search & Replace Test:
echo      "In the file L:\ClaudeDesktopCommander\test\test-data\edit-test.js, change 'Original message' to 'Updated message'"
echo.
echo   D. Process Management Test:
echo      "List all running processes on my system"
echo.
echo 3. Refer to TESTING_GUIDE.md for more detailed testing steps
echo.
echo ===================================================

echo.
echo Integration test setup complete.
echo.

pause
