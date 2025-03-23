const fetch = require('node-fetch');

// Test endpoints
async function testApiEndpoints() {
  // Base URL
  const baseUrl = 'http://localhost:8020';
  
  console.log('Testing Ollama API wrapper compatibility...');
  
  // Test models endpoint
  try {
    console.log('\nTesting GET /v1/models...');
    const modelsResponse = await fetch(`${baseUrl}/v1/models`);
    console.log(`Status: ${modelsResponse.status}`);
    console.log('Response:', await modelsResponse.json());
  } catch (error) {
    console.error('Error testing models endpoint:', error);
  }
  
  // Test chat completions endpoint
  try {
    console.log('\nTesting POST /v1/chat/completions...');
    const chatResponse = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama2',
        messages: [
          { role: 'user', content: 'Write a hello world function in JavaScript' }
        ],
        temperature: 0.7,
        max_tokens: 100
      })
    });
    console.log(`Status: ${chatResponse.status}`);
    console.log('Response:', await chatResponse.json());
  } catch (error) {
    console.error('Error testing chat completions endpoint:', error);
  }
  
  // Test embeddings endpoint
  try {
    console.log('\nTesting POST /v1/embeddings...');
    const embeddingsResponse = await fetch(`${baseUrl}/v1/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'nomic-embed-text',
        input: 'Hello world'
      })
    });
    console.log(`Status: ${embeddingsResponse.status}`);
    const embeddingsData = await embeddingsResponse.json();
    console.log('Response structure:', {
      object: embeddingsData.object,
      model: embeddingsData.model,
      data_length: embeddingsData.data?.length,
      embedding_dimensions: embeddingsData.data?.[0]?.embedding?.length
    });
  } catch (error) {
    console.error('Error testing embeddings endpoint:', error);
  }
  
  // Test health endpoint
  try {
    console.log('\nTesting GET /health...');
    const healthResponse = await fetch(`${baseUrl}/health`);
    console.log(`Status: ${healthResponse.status}`);
    console.log('Response:', await healthResponse.json());
  } catch (error) {
    console.error('Error testing health endpoint:', error);
  }
}

testApiEndpoints();
