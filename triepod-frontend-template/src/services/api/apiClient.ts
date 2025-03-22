import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// Default API configuration
const defaultConfig: AxiosRequestConfig = {
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
};

// Create API clients for each backend
export const createApiClient = (baseURL: string, config: AxiosRequestConfig = {}): AxiosInstance => {
  const instance = axios.create({
    ...defaultConfig,
    ...config,
    baseURL,
  });

  // Request interceptor
  instance.interceptors.request.use(
    (config) => {
      // You can add auth tokens here
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      // Handle common errors
      if (error.response) {
        // Server responded with an error status
        console.error('Server Error:', error.response.status, error.response.data);
      } else if (error.request) {
        // Request was made but no response was received
        console.error('Network Error:', error.request);
      } else {
        // Error in setting up the request
        console.error('Request Error:', error.message);
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

// API configuration (load from environment or config)
const apiConfig = {
  llm: 'http://localhost:8000/v1', // Custom LLM Framework API
  mcp: 'http://localhost:3000',    // MCP Server API
  rag: 'http://localhost:8080',    // RAG Agent API
};

// Create API clients
export const llmApiClient = createApiClient(apiConfig.llm);
export const mcpApiClient = createApiClient(apiConfig.mcp);
export const ragApiClient = createApiClient(apiConfig.rag);

// Helper functions for common HTTP operations
export const apiHelpers = {
  handleError: (error: any): never => {
    let errorMessage = 'An unexpected error occurred';
    
    if (error.response && error.response.data) {
      errorMessage = error.response.data.error || error.response.data.message || errorMessage;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  },
};
