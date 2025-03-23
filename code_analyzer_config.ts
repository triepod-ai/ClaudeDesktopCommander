// src/tools/code-analyzer/config.ts
export default {
  scanner: {
    maxDepth: 10,
    defaultIncludePatterns: ['**/*.js', '**/*.ts', '**/*.py', '**/*.java', '**/*.jsx', '**/*.tsx', '**/*.go', '**/*.rs'],
    defaultExcludePatterns: ['**/node_modules/**', '**/dist/**', '**/.git/**', '**/build/**', '**/__pycache__/**'],
    maxFileSize: 1000 * 1024, // 1MB
    chunkSize: 1000, // lines per chunk
    overlapSize: 50 // lines of overlap between chunks
  },
  llm: {
    url: 'http://localhost:8020',
    embeddingsUrl: 'http://localhost:8020/v1/embeddings',
    temperature: 0.1,
    maxTokens: 2000,
    retryAttempts: 3,
    retryDelay: 1000
  },
  vectorDb: {
    url: 'http://127.0.0.1:6333',
    collection: 'code_analysis',
    dimensions: 1536,
    distance: 'Cosine'
  }
};
