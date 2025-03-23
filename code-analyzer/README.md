# Code Analyzer Component

This component provides advanced code analysis capabilities for the Claude Desktop Commander.

## Features

- File scanning with configurable depth and patterns
- Code chunking for large files
- Integration with local LLM for semantic code analysis
- Vector database storage for efficient retrieval
- Natural language querying of codebase

## Directory Structure

- `src/`: TypeScript source files
- `scripts/`: Utility scripts

## Prerequisites

- **Qdrant Vector Database**: Running at http://127.0.0.1:6333
- **Local Tensor LLM**: Running at http://localhost:8020

## Building

```bash
# Install dependencies
npm install

# Build the project
npm run build
```

## Running

```bash
# Start the code analyzer
npm start
```

## Configuration

The code analyzer can be configured in `src/config.ts` with the following options:

- Scanner settings (depth, patterns, chunk size)
- LLM settings (URL, temperature, tokens)
- Vector database settings (URL, collection, dimensions)

## Usage

The code analyzer provides two main tools:

1. **code_analyzer**: Analyzes a codebase
   ```
   Parameters:
   - directory: Path to analyze
   - maxDepth: Maximum directory depth to scan
   - filePatterns: File patterns to include
   - includeChunks: Whether to include chunked content
   - includeSummary: Whether to include a summary
   ```

2. **query_codebase**: Queries the analyzed codebase
   ```
   Parameters:
   - query: Natural language query about the codebase
   - limit: Maximum number of results to return
   ```

## Documentation

For more detailed information, see the [Code Analyzer Setup](../CODE_ANALYZER_SETUP.md) guide.
