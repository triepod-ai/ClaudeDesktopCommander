@echo off
echo Starting Ollama and API wrapper...

:: Create the network if it doesn't exist
docker network inspect llm-network >nul 2>&1 || docker network create llm-network

:: Start Ollama container
echo Starting Ollama container...
docker run -d --rm ^
  --name custom-ollama ^
  --gpus all ^
  -p 11434:11434 ^
  -v "%cd%\models\ollama:/root/.ollama" ^
  --network llm-network ^
  ollama/ollama

:: Build the API wrapper image
echo Building API wrapper image...
docker build -t ollama-api:custom -f Dockerfile .

:: Run the API wrapper container
echo Running API wrapper container...
docker run -d --rm ^
  --name ollama-api-wrapper ^
  -p 8020:8020 ^
  -e OLLAMA_API=http://custom-ollama:11434 ^
  -e DEFAULT_MODEL=llama2 ^
  -e EMBEDDING_MODEL=nomic-embed-text ^
  --network llm-network ^
  ollama-api:custom

echo.
echo Ollama API setup complete!
echo API endpoint: http://localhost:8020
echo.
echo To pull models: docker exec -it custom-ollama ollama pull llama2
echo To pull embedding model: docker exec -it custom-ollama ollama pull nomic-embed-text
echo.
echo To check container status: docker ps --filter "name=custom-ollama|ollama-api-wrapper"
echo To view logs: docker logs ollama-api-wrapper
echo To stop containers: docker stop custom-ollama ollama-api-wrapper
