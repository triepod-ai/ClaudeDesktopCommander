#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Verifying Ollama OpenAI API Wrapper Setup${NC}"
echo "--------------------------------"

# Check if Docker is running
echo -n "Checking if Docker is running... "
if docker info >/dev/null 2>&1; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}FAILED${NC}"
    echo "Please start Docker and try again."
    exit 1
fi

# Check if Ollama container is running
echo -n "Checking if Ollama container is running... "
if docker ps --filter "name=custom-ollama" --format '{{.Names}}' | grep -q "custom-ollama"; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}NOT RUNNING${NC}"
    echo "The Ollama container is not running. Use 'run-ollama-api.bat' to start it."
fi

# Check if API wrapper container is running
echo -n "Checking if API wrapper container is running... "
if docker ps --filter "name=ollama-api-wrapper" --format '{{.Names}}' | grep -q "ollama-api-wrapper"; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}NOT RUNNING${NC}"
    echo "The API wrapper container is not running. Use 'run-ollama-api.bat' to start it."
fi

# Check if API is responding
echo -n "Checking if API is responding... "
if curl -s http://localhost:8020/health | grep -q "status"; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}NOT RESPONDING${NC}"
    echo "The API is not responding. Check container logs for details."
fi

# Check available models
echo "Checking available models... "
MODELS=$(curl -s http://localhost:8020/v1/models)
if [[ $MODELS == *"data"* ]]; then
    echo -e "${GREEN}Found models:${NC}"
    echo $MODELS | grep -o '"id":"[^"]*"' | cut -d'"' -f4 | while read -r model; do
        echo "  - $model"
    done
else
    echo -e "${RED}No models found or API error${NC}"
    echo "Try pulling models with: docker exec -it custom-ollama ollama pull llama2"
fi

echo "--------------------------------"
echo -e "${YELLOW}Verification complete${NC}"
