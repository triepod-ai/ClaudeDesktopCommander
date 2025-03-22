// Common Types
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  error?: string;
}

// Chat Types
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

// LLM Types
export interface LlmModel {
  id: string;
  name: string;
  provider: string;
  contextLength: number;
  description?: string;
  backend?: string;
}

export interface ModelParameters {
  temperature: number;
  topP: number;
  maxTokens: number;
  stop?: string[];
  presencePenalty?: number;
  frequencyPenalty?: number;
}

// MCP Tools Types
export interface Tool {
  name: string;
  description: string;
  category: string;
  parameters: Record<string, ToolParameter>;
}

export interface ToolParameter {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  required: boolean;
  default?: any;
}

export interface ToolExecutionRequest {
  toolName: string;
  parameters: Record<string, any>;
}

export interface ToolExecutionResult {
  status: 'success' | 'error';
  result?: any;
  error?: string;
}

// RAG Types
export interface Document {
  id: string;
  title: string;
  content: string;
  metadata: Record<string, any>;
  createdAt: number;
}

export interface SearchResult {
  document: Document;
  score: number;
  segments?: DocumentSegment[];
}

export interface DocumentSegment {
  id: string;
  documentId: string;
  content: string;
  metadata: Record<string, any>;
}

// Settings Types
export interface AppSettings {
  apiEndpoints: {
    llm: string;
    mcp: string;
    rag: string;
  };
  theme: 'light' | 'dark';
  defaultModel: string;
  defaultParameters: ModelParameters;
}
