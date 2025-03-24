@echo off
cls
echo ============================================================
echo    MCP SERVER FIXES TEST LAUNCHER
echo ============================================================
echo.
echo This utility helps you test each fixed component individually
echo before running the complete rebuild.
echo.
echo WARNING: Make sure Claude Desktop is closed for accurate testing!
echo.

:menu
echo Please select a component to test:
echo.
echo [1] Test Memory Command System
echo [2] Test Code Analyzer
echo [3] Test Ollama Server
echo [4] Test All Components (Run Complete Rebuild)
echo [5] Exit
echo.
set /p choice="Enter choice (1-5): "

if "%choice%"=="1" goto test_memory
if "%choice%"=="2" goto test_code_analyzer
if "%choice%"=="3" goto test_ollama
if "%choice%"=="4" goto test_all
if "%choice%"=="5" goto end

echo Invalid choice. Please try again.
goto menu

:test_memory
echo.
echo Testing Memory Command System...
call test-memory-system.bat
goto menu

:test_code_analyzer
echo.
echo Testing Code Analyzer...
call test-code-analyzer.bat
goto menu

:test_ollama
echo.
echo Testing Ollama Server...
call test-ollama-server.bat
goto menu

:test_all
echo.
echo Running complete rebuild...
call rebuild-mcp-servers.bat
goto menu

:end
echo.
echo ============================================================
echo    TEST LAUNCHER COMPLETED
echo ============================================================
echo.
echo Once all components have been tested successfully, restart
echo Claude Desktop to apply all fixes.
echo.
pause
