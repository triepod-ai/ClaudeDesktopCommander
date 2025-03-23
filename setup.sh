#!/bin/bash

echo "Installing OpenAI-compatible API wrapper for Ollama..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Python 3 is not installed! Please install Python 3 and try again."
    exit 1
fi

# Create virtual environment
echo "Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install requirements
echo "Installing dependencies..."
pip install -r requirements.txt

echo "Installation complete!"
echo
echo "To start the server, run: ./start.sh"

# Make start.sh executable
chmod +x start.sh
