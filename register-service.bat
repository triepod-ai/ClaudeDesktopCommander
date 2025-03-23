@echo off
echo Registering Ollama API Wrapper as a Windows service...

:: Check if nssm is available
where nssm > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo NSSM (Non-Sucking Service Manager) is not installed or not in the PATH!
    echo Please install NSSM from https://nssm.cc/ and try again.
    exit /b 1
)

:: Get current directory
set CURRENT_DIR=%CD%

:: Register the service
echo Creating service "OllamaAPIWrapper"...
nssm install OllamaAPIWrapper "%CURRENT_DIR%\venv\Scripts\python.exe" "%CURRENT_DIR%\server.py"
nssm set OllamaAPIWrapper Description "OpenAI-compatible API wrapper for Ollama"
nssm set OllamaAPIWrapper DisplayName "Ollama API Wrapper"
nssm set OllamaAPIWrapper AppDirectory "%CURRENT_DIR%"
nssm set OllamaAPIWrapper AppEnvironmentExtra "OLLAMA_API=http://localhost:11434" "DEFAULT_MODEL=llama3.2" "EMBEDDING_MODEL=llama3.2"
nssm set OllamaAPIWrapper Start SERVICE_AUTO_START
nssm set OllamaAPIWrapper ObjectName LocalSystem
nssm set OllamaAPIWrapper AppStdout "%CURRENT_DIR%\logs\service.log"
nssm set OllamaAPIWrapper AppStderr "%CURRENT_DIR%\logs\service.err"

:: Create logs directory
if not exist logs mkdir logs

echo Service registered successfully!
echo.
echo To start the service:
echo   net start OllamaAPIWrapper
echo.
echo To stop the service:
echo   net stop OllamaAPIWrapper
echo.
echo To uninstall the service:
echo   nssm remove OllamaAPIWrapper
