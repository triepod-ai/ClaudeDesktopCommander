import requests
import json
import time

# Base URL for the API server
BASE_URL = "http://localhost:8020"

def test_health():
    """Test the health endpoint."""
    print("\n=== Testing Health Endpoint ===")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 200

def test_models():
    """Test the models endpoint."""
    print("\n=== Testing Models Endpoint ===")
    response = requests.get(f"{BASE_URL}/v1/models")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 200

def test_chat_completions():
    """Test the chat completions endpoint."""
    print("\n=== Testing Chat Completions Endpoint ===")
    data = {
        "model": "llama3.2",
        "messages": [
            {"role": "user", "content": "Say hello in one short sentence."}
        ],
        "temperature": 0.7,
        "max_tokens": 50
    }
    
    start_time = time.time()
    response = requests.post(f"{BASE_URL}/v1/chat/completions", json=data)
    end_time = time.time()
    
    print(f"Status: {response.status_code}")
    print(f"Response time: {end_time - start_time:.2f} seconds")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 200

def test_embeddings():
    """Test the embeddings endpoint."""
    print("\n=== Testing Embeddings Endpoint ===")
    data = {
        "model": "llama3.2",
        "input": "This is a test."
    }
    
    start_time = time.time()
    response = requests.post(f"{BASE_URL}/v1/embeddings", json=data)
    end_time = time.time()
    
    print(f"Status: {response.status_code}")
    print(f"Response time: {end_time - start_time:.2f} seconds")
    
    if response.status_code == 200:
        json_data = response.json()
        vector_length = len(json_data["data"][0]["embedding"])
        print(f"Embedding vector length: {vector_length}")
        # Print just the first few dimensions
        print(f"First 5 dimensions: {json_data['data'][0]['embedding'][:5]}")
    else:
        print(f"Error: {response.text}")
    
    return response.status_code == 200

def run_all_tests():
    """Run all tests and report results."""
    tests = {
        "Health": test_health,
        "Models": test_models,
        "Chat Completions": test_chat_completions,
        "Embeddings": test_embeddings
    }
    
    results = {}
    
    print("Starting tests...\n")
    
    for name, test_func in tests.items():
        print(f"Running test: {name}")
        try:
            result = test_func()
            results[name] = "PASS" if result else "FAIL"
        except Exception as e:
            print(f"Error: {str(e)}")
            results[name] = "ERROR"
    
    print("\n=== Test Results ===")
    for name, result in results.items():
        print(f"{name}: {result}")
    
    all_passed = all(result == "PASS" for result in results.values())
    print(f"\nOverall: {'PASS' if all_passed else 'FAIL'}")

if __name__ == "__main__":
    run_all_tests()
