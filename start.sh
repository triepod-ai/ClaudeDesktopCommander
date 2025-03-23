#!/bin/bash

echo "Starting OpenAI-compatible API wrapper for Ollama..."

# Activate virtual environment
source venv/bin/activate

# Check if Ollama is running
echo "Checking if Ollama is running..."
if ! curl -s http://localhost:11434/api/version > /dev/null; then
    echo "Ollama is not running! Please start Ollama and try again."
    exit 1
fi

# Start the server
echo "Starting API server on http://localhost:8020..."
python server.py
