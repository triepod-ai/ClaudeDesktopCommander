# Ollama Wrapper Component

This component provides integration with Ollama's API for local LLM inference.

## Features

- Ollama API integration
- Local model management
- Inference API access
- Model configuration

## Directory Structure

- `src/`: JavaScript source files
- `models/`: Ollama model configurations

## Running

For Windows:
```bash
run-ollama-api.bat
```

For Linux/macOS:
```bash
./run-ollama-api.sh
```

## Prerequisites

- [Ollama](https://ollama.ai/) installed and running on your machine

## Configuration

The Ollama wrapper can be configured through environment variables or a configuration file:

- `OLLAMA_HOST`: Hostname for the Ollama API (default: localhost)
- `OLLAMA_PORT`: Port for the Ollama API (default: 11434)
- `OLLAMA_TIMEOUT`: Request timeout in milliseconds (default: 30000)

## Available Models

The wrapper is compatible with all models supported by Ollama, including:

- Llama 2
- Mistral
- Phi-2
- Gemma
- And many others

## Linux Service Installation

A systemd service file `ollama-api-wrapper.service` is provided for Linux users who want to run the wrapper as a background service.

To install:

1. Copy the service file to systemd:
   ```bash
   sudo cp ollama-api-wrapper.service /etc/systemd/system/
   ```

2. Edit the service file to point to your installation:
   ```bash
   sudo nano /etc/systemd/system/ollama-api-wrapper.service
   ```

3. Enable and start the service:
   ```bash
   sudo systemctl enable ollama-api-wrapper
   sudo systemctl start ollama-api-wrapper
   ```

4. Check the status:
   ```bash
   sudo systemctl status ollama-api-wrapper
   ```
