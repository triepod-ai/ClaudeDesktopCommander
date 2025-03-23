// src/tools/code-analyzer/storage/embedding.ts
import fetch from 'node-fetch';
import config from '../config.js';

export interface EmbeddingOptions {
  url?: string;
  dimensions?: number;
}

export async function generateEmbedding(
  text: string,
  options: EmbeddingOptions = {}
): Promise<number[]> {
  // Try different endpoints in order
  const endpoints = [
    '/v1/embeddings',
    '/embeddings',
    '/embedding',
    '/api/embeddings'
  ];
  
  const baseUrl = options.url || config.llm.embeddingsUrl.replace('/embeddings', '');
  
  for (const endpoint of endpoints) {
    try {
      const url = `${baseUrl}${endpoint}`;
      console.log(`Trying embedding endpoint: ${url}`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          input: text,
          model: 'local-model'
        })
      });
      
      if (!response.ok) {
        console.log(`Endpoint ${url} returned ${response.status}`);
        continue;
      }
      
      const result: any = await response.json();
      
      // Handle different response formats
      if (Array.isArray(result)) {
        return result;
      } else if (result.embedding && Array.isArray(result.embedding)) {
        return result.embedding;
      } else if (result.data && Array.isArray(result.data)) {
        return result.data;
      } else if (result.data && Array.isArray(result.data[0].embedding)) {
        return result.data[0].embedding;
      } else {
        console.log(`Unexpected embedding response format from ${url}:`, result);
        continue;
      }
    } catch (error) {
      console.error(`Error with embedding endpoint ${baseUrl}:`, error);
    }
  }
  
  // If we get here, all embedding attempts failed
  throw new Error(`Failed to generate embedding: Could not connect to embedding service at ${baseUrl}`);
}