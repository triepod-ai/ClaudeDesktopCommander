@echo off
echo Verifying Ollama OpenAI API Wrapper Setup
echo --------------------------------

:: Check if Docker is running
echo Checking if Docker is running... 
docker info >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo FAILED
    echo Please start Docker and try again.
    exit /b 1
) else (
    echo OK
)

:: Check if Ollama container is running
echo Checking if Ollama container is running... 
docker ps --filter "name=custom-ollama" --format "{{.Names}}" | findstr "custom-ollama" >nul
if %ERRORLEVEL% NEQ 0 (
    echo NOT RUNNING
    echo The Ollama container is not running. Use 'run-ollama-api.bat' to start it.
) else (
    echo OK
)

:: Check if API wrapper container is running
echo Checking if API wrapper container is running... 
docker ps --filter "name=ollama-api-wrapper" --format "{{.Names}}" | findstr "ollama-api-wrapper" >nul
if %ERRORLEVEL% NEQ 0 (
    echo NOT RUNNING
    echo The API wrapper container is not running. Use 'run-ollama-api.bat' to start it.
) else (
    echo OK
)

:: Check if API is responding
echo Checking if API is responding... 
curl -s http://localhost:8020/health | findstr "status" >nul
if %ERRORLEVEL% NEQ 0 (
    echo NOT RESPONDING
    echo The API is not responding. Check container logs for details.
) else (
    echo OK
)

:: Check available models
echo Checking available models... 
for /f "tokens=*" %%a in ('curl -s http://localhost:8020/v1/models') do set MODELS=%%a
echo %MODELS% | findstr "data" >nul
if %ERRORLEVEL% NEQ 0 (
    echo No models found or API error
    echo Try pulling models with: docker exec -it custom-ollama ollama pull llama2
) else (
    echo Found models - see response below:
    curl -s http://localhost:8020/v1/models
)

echo --------------------------------
echo Verification complete
