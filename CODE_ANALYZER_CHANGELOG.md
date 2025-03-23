# Enhanced Code Analyzer - Changelog

## Version 1.0.0 (Initial Implementation)

### Added
- Enhanced directory scanner with improved depth control and language detection
- Intelligent code chunking system for large files
- LLM-powered code analysis using local Tensor LLM
- Vector database integration with Qdrant for semantic storage and retrieval
- Natural language query interface for interacting with analyzed codebases
- Comprehensive documentation and setup guides

### New Components
- **Scanner Module**: 
  - `file-scanner.ts`: Enhanced directory traversal
  - `chunker.ts`: Intelligent code chunking
  
- **Analysis Module**:
  - `llm-analyzer.ts`: Integration with Tensor LLM

- **Storage Module**:
  - `embedding.ts`: Vector embedding generation
  - `vector-db.ts`: Qdrant database integration
  
- **Claude Interface**:
  - `query-handler.ts`: Natural language query processing

- **Controller and Main Module**:
  - `controller.ts`: Main controller for code analyzer
  - `index.ts`: MCP tool definitions

### Dependencies Added
- `@qdrant/js-client-rest`: Vector database client
- `node-fetch`: HTTP client for LLM API calls
- `fs-extra`: Enhanced filesystem operations
- `crypto`: For generating unique chunk IDs

### Documentation
- Added `CODE_ANALYZER_SETUP.md` with detailed setup instructions
- Updated `MCP_TOOLS_INVENTORY.md` to include new code analysis tools
- Updated `README.md` to highlight code analysis capabilities
- Updated `DOCUMENTATION.md` with technical details about the code analyzer

### Helper Scripts
- `setup-code-analyzer.bat`: Windows installation script
- `setup-code-analyzer.sh`: Linux/macOS installation script

## Prerequisites
- Qdrant vector database running at http://127.0.0.1:6333
- Tensor LLM service running at http://localhost:8020

## New MCP Tools
- `code_analyzer`: Analyzes a codebase to extract key information about structure, dependencies, and APIs
- `query_codebase`: Queries the analyzed codebase using natural language
