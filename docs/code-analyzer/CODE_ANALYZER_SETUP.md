# Enhanced Code Analyzer Setup Guide

This document provides instructions for setting up and using the enhanced code analyzer plugin for Claude Desktop Commander.

## Prerequisites

The enhanced code analyzer requires the following services to be running:

1. **Qdrant Vector Database**: A vector database running at http://127.0.0.1:6333
2. **Local Tensor LLM**: A locally hosted LLM service running at http://localhost:8020

## Installation Steps

### 1. Install Required Dependencies

```bash
# Navigate to the code-analyzer directory
cd code-analyzer

# Install dependencies
npm install

# Rebuild the application
npm run build
```

### 2. Configure Qdrant Vector Database

If you don't have Qdrant running yet, you can start it using Docker:

```bash
docker pull qdrant/qdrant
docker run -p 6333:6333 -p 6334:6334 -v qdrant_storage:/qdrant/storage qdrant/qdrant
```

### 3. Ensure Tensor LLM Service is Running

Make sure your local Tensor LLM service is running at http://localhost:8020.

## Usage

The enhanced code analyzer provides two main functions:

1. **Analyze Codebase**: Scans a directory, analyzes code using the LLM, and stores the results in the vector database.
2. **Query Codebase**: Uses natural language to search for relevant code patterns and structures in the analyzed codebase.

### Example Usage with Claude

To analyze a codebase:

```
Please analyze the codebase at C:\my-project using the code_analyzer tool.
```

To query the analyzed codebase:

```
Search the code for implementation of authentication middleware.
```

## Configuration Options

You can modify the code analyzer configuration in `src/config.ts`:

- **Scanner Configuration**: Adjust scanning depth, file patterns, max file size, etc.
- **LLM Configuration**: Change the LLM server URL, temperature, max tokens, etc.
- **Vector DB Configuration**: Set Qdrant URL, collection name, vector dimensions, etc.

Example configuration:

```javascript
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
    embeddingsUrl: 'http://localhost:8020/embeddings',
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
```

## Troubleshooting

### Connection Issues

- **Qdrant Connection Error**: Ensure Qdrant is running at http://127.0.0.1:6333
- **LLM Service Error**: Check if the Tensor LLM service is running at http://localhost:8020

### Analysis Errors

- **Large Files**: The analyzer may skip very large files (>1MB by default)
- **Binary Files**: Binary files are automatically excluded from analysis
- **LLM Timeouts**: If the LLM service is busy, retry the analysis command

## Future Enhancements

Planned future enhancements include:

1. Improved code structure recognition
2. Language-specific parsing for more accurate analysis
3. Dependency graph generation
4. Advanced query capabilities with code examples
5. Integration with other code analysis tools
