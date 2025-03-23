@echo off
echo Starting OpenAI-compatible API wrapper for Ollama...

:: Activate virtual environment
call venv\Scripts\activate.bat

:: Check if Ollama is running
echo Checking if Ollama is running...
curl -s http://localhost:11434/api/version > nul
if %ERRORLEVEL% NEQ 0 (
    echo Ollama is not running! Please start Ollama and try again.
    exit /b 1
)

:: Start the server
echo Starting API server on http://localhost:8020...
python server.py
