@echo off
cls
echo ============================================================
echo    MCP SERVER FIXES LAUNCHER
echo ============================================================
echo.
echo This utility helps you fix JSON parsing errors by rebuilding
echo necessary components and containers.
echo.
echo WARNING: Make sure Claude Desktop is closed for accurate rebuilding!
echo.

:menu
echo Please select a component to rebuild:
echo.
echo [1] Rebuild Memory Docker Container (fixes JSON parsing errors)
echo [2] Rebuild Local Memory Command System
echo [3] Test Memory System
echo [4] Rebuild Code Analyzer
echo [5] Rebuild Ollama Server
echo [6] Exit
echo.
set /p choice="Enter choice (1-6): "

if "%choice%"=="1" goto rebuild_memory_container
if "%choice%"=="2" goto rebuild_memory_local
if "%choice%"=="3" goto test_memory
if "%choice%"=="4" goto rebuild_code_analyzer
if "%choice%"=="5" goto rebuild_ollama
if "%choice%"=="6" goto end

echo Invalid choice. Please try again.
goto menu

:rebuild_memory_container
echo.
echo Rebuilding Memory Docker Container...
call rebuild-memory-container.bat
goto menu

:rebuild_memory_local
echo.
echo Rebuilding local Memory Command System...
cd L:\ClaudeDesktopCommander\mcp-core\memory-command-system
call npm install
cd L:\ClaudeDesktopCommander
echo Memory Command System rebuilt.
echo.
pause
goto menu

:test_memory
echo.
echo Testing Memory System...
call test-memory-system.bat
goto menu

:rebuild_code_analyzer
echo.
echo Rebuilding Code Analyzer...
call test-code-analyzer.bat
goto menu

:rebuild_ollama
echo.
echo Rebuilding Ollama Server...
call test-ollama-server.bat
goto menu

:end
echo.
echo ============================================================
echo    FIXES LAUNCHER COMPLETED
echo ============================================================
echo.
echo Once all components have been rebuilt successfully, restart
echo Claude Desktop to apply all fixes.
echo.
pause
