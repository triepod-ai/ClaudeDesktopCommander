# MCP Server JSON Parsing Error Fixes

This document explains the comprehensive set of fixes implemented to address JSON parsing errors and stability issues across multiple MCP servers.

## Key Issue: Docker Containers and JSON Parsing

The primary issue we discovered was related to how Docker containers are being used for the memory services:

1. **New Containers Per Request**: The Docker configuration was creating a new container instance for each memory operation
2. **JSON Serialization Errors**: Complex objects like Neo4j results and ZodError objects were breaking JSON serialization
3. **Circular References**: References between objects were causing serialization failures
4. **Module System Conflicts**: ES Modules vs CommonJS compatibility issues caused serialization problems

## Fix Strategy: Container Rebuilding Approach

We've implemented a Docker container rebuild strategy to address these issues:

### 1. Memory Container Rebuild
- **New Dockerfile**: Created a proper Dockerfile.memory with error handling improvements
- **Container Rebuild Script**: Added rebuild-memory-container.bat to rebuild the image
- **Volume Consistency**: Ensured the same volume mount points for compatibility
- **Error Serialization**: Integrated improved serialization of ZodError and Neo4j objects

### 2. Code Analyzer Improvements
- **Safe Wrapper Utilities**: Enhanced error handling for validation issues
- **Tool Handler Protection**: Added timeout protection and result validation
- **Complex Object Handling**: Improved serialization of complex objects

### 3. Ollama Server Fixes
- **Simplified Transport**: Removed problematic TransformStream implementation
- **Response Handling**: Eliminated streaming-related issues
- **ES Module Support**: Updated configuration for proper ES module compatibility

### 4. Environment Variable Standardization
- **Node Options**: Added memory limits and header size parameters
- **Error Flags**: Set unhandled rejection modes to improve error visibility
- **Safe Mode**: Added MCP_SAFE_MODE flag for safer operation

## How to Use the Fix Tools

We've created several tools to help apply and test these fixes:

### Main Fix Launcher
Run `fix-mcp-servers.bat` to access the main menu with the following options:
1. Rebuild Memory Docker Container (fixes JSON parsing errors)
2. Rebuild Local Memory Command System
3. Test Memory System
4. Rebuild Code Analyzer
5. Rebuild Ollama Server

### Individual Component Tools
- **rebuild-memory-container.bat**: Rebuilds the Docker container for memory services
- **test-memory-system.bat**: Tests the memory system in isolation
- **test-code-analyzer.bat**: Tests the code analyzer in isolation
- **test-ollama-server.bat**: Tests the Ollama server in isolation

## Steps to Fix JSON Parsing Errors

1. **Close Claude Desktop**: Ensure Claude Desktop is completely closed
2. **Run the Fix Launcher**: Execute `fix-mcp-servers.bat`
3. **Select Option 1**: Rebuild the Memory Docker Container first
4. **Test Other Components**: Use the other options to test or rebuild specific components
5. **Restart Claude Desktop**: After fixing components, restart Claude Desktop

## Troubleshooting

If you continue to experience JSON parsing errors:

1. Check Docker logs for specific error messages:
   ```
   docker logs $(docker ps -q --filter "ancestor=mcp/memory")
   ```

2. Verify the Claude Desktop config settings:
   ```json
   "memory": {
     "command": "docker",
     "args": ["run", "-i", "-v", "claude-memory:/app/dist", "--rm", "mcp/memory"],
     "env": {
       "MCP_SAFE_MODE": "true"
     }
   }
   ```

3. Ensure the Docker container was rebuilt successfully:
   ```
   docker images | findstr "mcp/memory"
   ```

4. If container rebuilding fails, try the local memory command system rebuild as an alternative
