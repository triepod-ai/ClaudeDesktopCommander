# MCP Tools Inventory

This document provides a comprehensive inventory of all tools available through the Model Context Protocol (MCP) servers integrated with Claude.

## Overview

Currently, we have 16 MCP servers successfully integrated, providing a wide range of capabilities:

1. **desktop-commander**: File operations and command execution
2. **LLM API Servers**: claude, openai, grok, groq, mistral, perplexity, togetherai, huggingface
3. **Data Storage Servers**: pinecone, supabase, redis
4. **External API Servers**: github, google-maps, braveapi
5. **Filesystem Server**: filesystem

## Desktop Commander Tools

The Desktop Commander server provides powerful tools for terminal command execution, file operations, and process management.

### Terminal Tools

#### execute_command
- **Description**: Run commands with configurable timeout
- **Server**: desktop-commander
- **Prerequisites**: None
- **Example**:
  ```
  Use the execute_command tool to list files in the current directory
  ```

#### read_output
- **Description**: Get output from long-running commands
- **Server**: desktop-commander
- **Prerequisites**: Active command session ID
- **Example**:
  ```
  Use the read_output tool to check progress of the build with session ID 12345
  ```

#### force_terminate
- **Description**: Stop running command sessions
- **Server**: desktop-commander
- **Prerequisites**: Active command session ID
- **Example**:
  ```
  Use the force_terminate tool to stop the server running with session ID 12345
  ```

#### list_sessions
- **Description**: View active command sessions
- **Server**: desktop-commander
- **Prerequisites**: None
- **Example**:
  ```
  Use the list_sessions tool to see all running commands
  ```

#### list_processes
- **Description**: View system processes
- **Server**: desktop-commander
- **Prerequisites**: None
- **Example**:
  ```
  Use the list_processes tool to see all running system processes
  ```

#### kill_process
- **Description**: Terminate processes by PID
- **Server**: desktop-commander
- **Prerequisites**: Process ID
- **Example**:
  ```
  Use the kill_process tool to terminate the process with PID 1234
  ```

#### block_command/unblock_command
- **Description**: Manage command blacklist
- **Server**: desktop-commander
- **Prerequisites**: None
- **Example**:
  ```
  Use the block_command tool to add 'rm -rf' to the blacklist
  ```

### Filesystem Tools

#### read_file
- **Description**: Read file contents
- **Server**: desktop-commander, filesystem
- **Prerequisites**: Valid file path
- **Example**:
  ```
  Use the read_file tool to see the contents of config.json
  ```

#### write_file
- **Description**: Write or replace file contents
- **Server**: desktop-commander, filesystem
- **Prerequisites**: Valid file path
- **Example**:
  ```
  Use the write_file tool to create a new index.html file
  ```

#### create_directory
- **Description**: Create a new directory
- **Server**: desktop-commander, filesystem
- **Prerequisites**: Valid path
- **Example**:
  ```
  Use the create_directory tool to create a new 'src' folder
  ```

#### list_directory
- **Description**: List directory contents
- **Server**: desktop-commander, filesystem
- **Prerequisites**: Valid directory path
- **Example**:
  ```
  Use the list_directory tool to see the contents of the project folder
  ```

#### move_file
- **Description**: Move or rename files
- **Server**: desktop-commander, filesystem
- **Prerequisites**: Valid source and destination paths
- **Example**:
  ```
  Use the move_file tool to rename main.js to index.js
  ```

#### search_files
- **Description**: Pattern-based file search
- **Server**: desktop-commander, filesystem
- **Prerequisites**: Valid directory path and search pattern
- **Example**:
  ```
  Use the search_files tool to find all TODO comments in the src directory
  ```

#### get_file_info
- **Description**: File metadata
- **Server**: desktop-commander, filesystem
- **Prerequisites**: Valid file path
- **Example**:
  ```
  Use the get_file_info tool to check the size and modification date of package.json
  ```

### Edit Tools

#### edit_block
- **Description**: Apply surgical text replacements
- **Server**: desktop-commander
- **Prerequisites**: Valid file path and search/replace blocks
- **Example**:
  ```
  Use the edit_block tool to change the API endpoint in config.js
  ```

## LLM API Tools

### Claude (claude)

#### generate_text
- **Description**: Generate text with Claude
- **Server**: claude
- **Prerequisites**: ANTHROPIC_API_KEY
- **Example**:
  ```
  Use the claude server's generate_text tool to create a product description
  ```

#### embed_text
- **Description**: Create text embeddings
- **Server**: claude
- **Prerequisites**: ANTHROPIC_API_KEY
- **Example**:
  ```
  Use the claude server's embed_text tool to create embeddings for semantic search
  ```

### OpenAI (openai)

#### completions
- **Description**: Generate text completions
- **Server**: openai
- **Prerequisites**: OPENAI_API_KEY
- **Example**:
  ```
  Use the openai server's completions tool to generate code examples
  ```

#### chat
- **Description**: Chat completions
- **Server**: openai
- **Prerequisites**: OPENAI_API_KEY
- **Example**:
  ```
  Use the openai server's chat tool to have a conversational response
  ```

#### embeddings
- **Description**: Create text embeddings
- **Server**: openai
- **Prerequisites**: OPENAI_API_KEY
- **Example**:
  ```
  Use the openai server's embeddings tool to create vector representations of text
  ```

### Grok (grok)
- Similar to OpenAI tools but uses Grok's API
- **Prerequisites**: GROK_API_KEY

### Groq (groq)
- Fast inference for OpenAI-compatible models
- **Prerequisites**: GROQ_API_KEY

### Mistral (mistral)
- Mistral AI models with specialized capabilities
- **Prerequisites**: MISTRAL_API_KEY

### Perplexity (perplexity)
- Research and knowledge tools
- **Prerequisites**: PERPLEXITY_API_KEY

### TogetherAI (togetherai)
- Open source models hosted on Together
- **Prerequisites**: TOGETHERAI_API_KEY

### HuggingFace (huggingface)
- Access to thousands of open models
- **Prerequisites**: HF_API_KEY

## Data Storage Tools

### Pinecone (pinecone)

#### index_operations
- **Description**: Create/manage vector indices
- **Server**: pinecone
- **Prerequisites**: PINECONE_API_KEY, PINECONE_ENVIRONMENT
- **Example**:
  ```
  Use the pinecone server's index_operations tool to create a new vector index
  ```

#### vector_operations
- **Description**: Store/query vectors
- **Server**: pinecone
- **Prerequisites**: PINECONE_API_KEY, PINECONE_ENVIRONMENT
- **Example**:
  ```
  Use the pinecone server's vector_operations tool to query similar documents
  ```

### Supabase (supabase)

#### query
- **Description**: Run SQL queries
- **Server**: supabase
- **Prerequisites**: SUPABASE_URL, SUPABASE_KEY
- **Example**:
  ```
  Use the supabase server's query tool to retrieve user data
  ```

#### insert
- **Description**: Insert data
- **Server**: supabase
- **Prerequisites**: SUPABASE_URL, SUPABASE_KEY
- **Example**:
  ```
  Use the supabase server's insert tool to add a new record
  ```

### Redis (redis)

#### key_value_operations
- **Description**: Basic key-value operations
- **Server**: redis
- **Prerequisites**: REDIS_URL
- **Example**:
  ```
  Use the redis server's key_value_operations tool to store a session token
  ```

#### list_operations
- **Description**: Operations on lists
- **Server**: redis
- **Prerequisites**: REDIS_URL
- **Example**:
  ```
  Use the redis server's list_operations tool to add items to a queue
  ```

## External API Tools

### GitHub (github)

#### repository_operations
- **Description**: Manage repositories
- **Server**: github
- **Prerequisites**: GITHUB_TOKEN
- **Example**:
  ```
  Use the github server's repository_operations tool to list repositories
  ```

#### issue_operations
- **Description**: Manage issues
- **Server**: github
- **Prerequisites**: GITHUB_TOKEN
- **Example**:
  ```
  Use the github server's issue_operations tool to create a new issue
  ```

### Google Maps (google-maps)

#### geocoding
- **Description**: Convert addresses to coordinates
- **Server**: google-maps
- **Prerequisites**: GOOGLE_MAPS_API_KEY
- **Example**:
  ```
  Use the google-maps server's geocoding tool to find the coordinates of an address
  ```

#### places
- **Description**: Search for places
- **Server**: google-maps
- **Prerequisites**: GOOGLE_MAPS_API_KEY
- **Example**:
  ```
  Use the google-maps server's places tool to find nearby restaurants
  ```

### Brave Search (braveapi)

#### search
- **Description**: Web search results
- **Server**: braveapi
- **Prerequisites**: BRAVE_API_KEY
- **Example**:
  ```
  Use the braveapi server's search tool to find information about renewable energy
  ```

## Usage Notes

1. **Environment Variables**: Most tools require API keys or environment variables. Ensure these are properly configured in your MCP configuration file.

2. **Tool Selection**: Choose the appropriate tool based on your task:
   - For file operations: Use desktop-commander or filesystem
   - For text generation: Use claude, openai, or other LLM servers
   - For data storage: Use pinecone, supabase, or redis
   - For external API access: Use github, google-maps, or braveapi

3. **Error Handling**: Check tool responses for errors and handle them appropriately. Most tools will return clear error messages if prerequisites are not met or operations fail.

4. **Rate Limits**: Be aware that many external APIs have rate limits. Consider implementing retry logic or throttling for high-volume operations.

## Adding New Tools

To add new tools, you need to:

1. Find or create an MCP server that provides the desired functionality
2. Install the server package (typically via npm)
3. Add the server configuration to your MCP config file
4. Restart your Claude client

When creating custom MCP servers, follow the Model Context Protocol specification and use the MCP SDK for easy integration.
