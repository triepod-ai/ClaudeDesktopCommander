from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional, Union
import logging
import requests
import os
import uuid
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="Ollama OpenAI-Compatible API",
              description="Ollama wrapper with OpenAI-compatible API")

# Ollama API endpoint
OLLAMA_API = os.environ.get("OLLAMA_API", "http://localhost:11434")
EMBEDDING_MODEL = os.environ.get("EMBEDDING_MODEL", "llama3.2")
DEFAULT_MODEL = os.environ.get("DEFAULT_MODEL", "llama3.2")

# Models
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatCompletionRequest(BaseModel):
    model: Optional[str] = None
    messages: List[ChatMessage]
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = 100

class EmbeddingRequest(BaseModel):
    model: Optional[str] = None
    input: Union[str, List[str]]

# Routes
@app.post("/v1/chat/completions")
async def chat_completions(request: ChatCompletionRequest):
    """Chat completions endpoint - forwards to Ollama generate."""
    try:
        # Format prompt from messages
        prompt = ""
        for msg in request.messages:
            if msg.role == "system":
                prompt += f"<s>[INST] <<SYS>>\n{msg.content}\n<</SYS>>\n\n"
            elif msg.role == "user":
                if prompt == "":
                    prompt += f"<s>[INST] {msg.content} [/INST]"
                else:
                    prompt += f"{msg.content} [/INST]"
            elif msg.role == "assistant":
                prompt += f" {msg.content} </s><s>[INST] "
        
        # Call Ollama API
        ollama_response = requests.post(
            f"{OLLAMA_API}/api/generate",
            json={
                "model": request.model or DEFAULT_MODEL,
                "prompt": prompt,
                "temperature": request.temperature or 0.7,
                "num_predict": request.max_tokens or 100,
            }
        )
        
        if ollama_response.status_code != 200:
            raise HTTPException(status_code=ollama_response.status_code, 
                               detail=f"Ollama API error: {ollama_response.text}")
            
        response_json = ollama_response.json()
        
        # Format OpenAI-compatible response
        completion_id = f"chatcmpl-{str(uuid.uuid4())}"
        created_time = int(time.time())
        
        return {
            "id": completion_id,
            "object": "chat.completion",
            "created": created_time,
            "model": request.model or DEFAULT_MODEL,
            "choices": [
                {
                    "index": 0,
                    "message": {
                        "role": "assistant",
                        "content": response_json.get("response", "")
                    },
                    "finish_reason": "stop"
                }
            ],
            "usage": {
                "prompt_tokens": response_json.get("prompt_eval_count", 0),
                "completion_tokens": response_json.get("eval_count", 0),
                "total_tokens": response_json.get("prompt_eval_count", 0) + response_json.get("eval_count", 0)
            }
        }
    except Exception as e:
        logger.error(f"Error in chat completions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/v1/embeddings")
async def embeddings(request: EmbeddingRequest):
    """Embeddings endpoint - forwards to Ollama embeddings."""
    try:
        # Format inputs
        inputs = [request.input] if isinstance(request.input, str) else request.input
        
        # Process each input and get embeddings
        data = []
        for i, text in enumerate(inputs):
            # Call Ollama API for embeddings
            ollama_response = requests.post(
                f"{OLLAMA_API}/api/embeddings",
                json={
                    "model": request.model or EMBEDDING_MODEL,
                    "prompt": text
                }
            )
            
            if ollama_response.status_code != 200:
                raise HTTPException(status_code=ollama_response.status_code, 
                                   detail=f"Ollama API error: {ollama_response.text}")
                
            response_json = ollama_response.json()
            
            data.append({
                "object": "embedding",
                "embedding": response_json.get("embedding", []),
                "index": i
            })
        
        return {
            "object": "list",
            "data": data,
            "model": request.model or EMBEDDING_MODEL,
            "usage": {
                "prompt_tokens": sum(len(text.split()) for text in inputs),
                "total_tokens": sum(len(text.split()) for text in inputs)
            }
        }
    except Exception as e:
        logger.error(f"Error in embeddings: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/v1/models")
async def list_models():
    """List models endpoint - gets available models from Ollama."""
    try:
        # Call Ollama API to list models
        ollama_response = requests.get(f"{OLLAMA_API}/api/tags")
        
        if ollama_response.status_code != 200:
            raise HTTPException(status_code=ollama_response.status_code, 
                               detail=f"Ollama API error: {ollama_response.text}")
            
        response_json = ollama_response.json()
        
        # Format OpenAI-compatible response
        models = []
        for model in response_json.get("models", []):
            models.append({
                "id": model.get("name"),
                "object": "model",
                "created": int(time.time()),
                "owned_by": "user"
            })
        
        return {
            "object": "list",
            "data": models
        }
    except Exception as e:
        logger.error(f"Error listing models: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    try:
        # Check Ollama API health
        ollama_response = requests.get(f"{OLLAMA_API}/api/version")
        
        if ollama_response.status_code != 200:
            return {"status": "error", "message": f"Ollama API error: {ollama_response.text}"}
            
        return {
            "status": "ok",
            "ollama_version": ollama_response.json().get("version")
        }
    except Exception as e:
        logger.error(f"Error in health check: {str(e)}")
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8020)
