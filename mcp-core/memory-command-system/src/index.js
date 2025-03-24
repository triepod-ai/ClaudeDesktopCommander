/**
 * Memory Command System - MCP Server
 * A Model Context Protocol server for storing and retrieving information
 */

require('dotenv').config();
const { routeCommand } = require('./foundation/commandRouter');
const ChromaAdapter = require('./storage/chromaAdapter');
const KnowledgeGraphAdapter = require('./storage/knowledgeGraphAdapter');
const MemoryAdapter = require('./storage/memoryAdapter');

// Import compatibility layer
const { serializeForModuleBoundary, deserializeFromModuleBoundary } = require('./foundation/moduleCompatibility');

// Import command handlers
const handleRemember = require('./commands/rememberHandler');
const handleRecall = require('./commands/recallHandler');
const handleAnalyze = require('./commands/analyzeHandler');
const handlePlan = require('./commands/planHandler');
const handleList = require('./commands/listHandler');

// Import error handler
const { safeSerializeError, createErrorResponse, safeJsonStringify } = require('./foundation/errorHandler');

// Initialize storage adapters
const chromaDB = null; // Disable ChromaDB for now

// Try to use Neo4j adapter, fall back to in-memory adapter
let knowledgeGraph;
try {
  knowledgeGraph = new KnowledgeGraphAdapter({
    uri: process.env.NEO4J_URI || 'neo4j://localhost:7687',
    user: process.env.NEO4J_USER || 'neo4j',
    password: process.env.NEO4J_PASSWORD || 'password'
  });
} catch (error) {
  console.log('Error initializing Neo4j adapter, falling back to memory adapter', error);
  knowledgeGraph = new MemoryAdapter();
}

// Initialize command handlers
const commandHandlers = {
  remember: (command) => handleRemember(command, { chromaDB, knowledgeGraph }),
  recall: (command) => handleRecall(command, { chromaDB, knowledgeGraph }),
  analyze: (command) => handleAnalyze(command, { chromaDB, knowledgeGraph }),
  plan: (command) => handlePlan(command, { chromaDB, knowledgeGraph }),
  list: (command) => handleList(command, { chromaDB, knowledgeGraph }),
  text: (command) => ({
    success: true,
    message: 'Not a command. Use /help to see available commands.'
  }),
  unknown: (command) => ({
    success: false,
    error: `Unknown command: ${command.command || 'invalid input'}`
  })
};

/**
 * Process user input and route to appropriate handler
 * @param {string} input - User input to process
 * @returns {Promise<Object>} Command result
 */
async function processInput(input) {
  try {
    return await routeCommand(input, commandHandlers);
  } catch (error) {
    console.error('Error processing input:', error);
    return {
      success: false,
      error: `Error processing input: ${error.message}`
    };
  }
}

// MCP Server functions
const mcpFunctions = {
  // Remember function
  "remember": async (params) => {
    // Deserialize parameters to ensure they're clean
    const safeParams = deserializeFromModuleBoundary(params);
    const { category, content, tags } = safeParams;
    
    const command = { 
      command: 'remember', 
      category, 
      content, 
      tags: tags || []
    };
    
    const result = await handleRemember(command, { chromaDB, knowledgeGraph });
    // Serialize result for safe cross-boundary communication
    return serializeForModuleBoundary(result);
  },
  
  // Recall function
  "recall": async (params) => {
    // Deserialize parameters to ensure they're clean
    const safeParams = deserializeFromModuleBoundary(params);
    const { query, category } = safeParams;
    
    const command = { 
      command: 'recall', 
      query, 
      category
    };
    
    const result = await handleRecall(command, { chromaDB, knowledgeGraph });
    // Serialize result for safe cross-boundary communication
    return serializeForModuleBoundary(result);
  },
  
  // Analyze function
  "analyze": async (params) => {
    // Deserialize parameters to ensure they're clean
    const safeParams = deserializeFromModuleBoundary(params);
    const { target, goal } = safeParams;
    
    const command = { 
      command: 'analyze', 
      target, 
      goal
    };
    
    const result = await handleAnalyze(command, { chromaDB, knowledgeGraph });
    // Serialize result for safe cross-boundary communication
    return serializeForModuleBoundary(result);
  },
  
  // Plan function
  "plan": async (params) => {
    // Deserialize parameters to ensure they're clean
    const safeParams = deserializeFromModuleBoundary(params);
    const { goal, context } = safeParams;
    
    const command = { 
      command: 'plan', 
      goal, 
      context
    };
    
    const result = await handlePlan(command, { chromaDB, knowledgeGraph });
    // Serialize result for safe cross-boundary communication
    return serializeForModuleBoundary(result);
  },
  
  // List function
  "list": async (params) => {
    // Deserialize parameters to ensure they're clean
    const safeParams = deserializeFromModuleBoundary(params);
    const { type, filter } = safeParams;
    
    const command = { 
      command: 'list', 
      type, 
      filter
    };
    
    const result = await handleList(command, { chromaDB, knowledgeGraph });
    // Serialize result for safe cross-boundary communication
    return serializeForModuleBoundary(result);
  }
};

// MCP Protocol message handling
async function handleMCPMessage(message) {
  try {
    // Safely parse the incoming message using compatibility layer
    let parsed;
    try {
      // Use the module compatibility layer to deserialize safely
      parsed = deserializeFromModuleBoundary(message);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      // Safely return error information with sanitized message
      const errorInfo = serializeForModuleBoundary({
        type: "error",
        message: `Failed to parse message: ${parseError.message}`,
        original: message.length > 100 ? message.substring(0, 100) + '...' : message
      });
      return safeJsonStringify(errorInfo);
    }
    
    if (parsed.type === "function_call") {
      const { function_name, parameters } = parsed;
      
      // Validate function name
      if (!function_name || typeof function_name !== 'string') {
        const errorInfo = serializeForModuleBoundary({
          type: "error",
          message: "Invalid function call: missing or invalid function name"
        });
        return safeJsonStringify(errorInfo);
      }
      
      if (mcpFunctions[function_name]) {
        try {
          // Call the function with sanitized parameters
          const result = await mcpFunctions[function_name](parameters || {});
          
          // Prepare safe response
          const responseObj = serializeForModuleBoundary({
            type: "function_return",
            function_name,
            value: result
          });
          
          return safeJsonStringify(responseObj);
        } catch (error) {
          console.error(`Error executing function ${function_name}:`, error);
          
          // Safely serialize error and return
          const errorObj = serializeForModuleBoundary({
            type: "function_return",
            function_name,
            error: safeSerializeError(error)
          });
          
          return safeJsonStringify(errorObj);
        }
      } else {
        // Handle unknown function
        const errorObj = serializeForModuleBoundary({
          type: "function_return",
          function_name,
          error: { message: `Unknown function: ${function_name}`, type: 'NotFoundError' }
        });
        
        return safeJsonStringify(errorObj);
      }
    } else if (parsed.type === "discovery") {
      // For discovery, use a standard JSON.stringify since we know the schema is valid
      const response = {
        type: "discovery_response",
        functions: [
          {
            name: "remember",
            description: "Store information in memory with categorization and tags",
            parameters: {
              type: "object",
              properties: {
                category: {
                  type: "string",
                  description: "Category to store the information under"
                },
                content: {
                  type: "string",
                  description: "Content to remember"
                },
                tags: {
                  type: "array",
                  items: {
                    type: "string"
                  },
                  description: "Optional tags for the content"
                }
              },
              required: ["category", "content"]
            }
          },
          {
            name: "recall",
            description: "Retrieve information from memory",
            parameters: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "Query to search for"
                },
                category: {
                  type: "string",
                  description: "Optional category to limit search to"
                }
              },
              required: ["query"]
            }
          },
          {
            name: "analyze",
            description: "Analyze a file, directory, or text based on a goal",
            parameters: {
              type: "object",
              properties: {
                target: {
                  type: "string",
                  description: "Target to analyze (file path, directory path, or text)"
                },
                goal: {
                  type: "string",
                  description: "Goal of the analysis"
                }
              },
              required: ["target", "goal"]
            }
          },
          {
            name: "plan",
            description: "Generate a step-by-step plan for a goal",
            parameters: {
              type: "object",
              properties: {
                goal: {
                  type: "string",
                  description: "Goal to plan for"
                },
                context: {
                  type: "string",
                  description: "Optional context for planning"
                }
              },
              required: ["goal"]
            }
          },
          {
            name: "list",
            description: "List stored information by type",
            parameters: {
              type: "object",
              properties: {
                type: {
                  type: "string",
                  description: "Type of information to list (categories, tags, all)"
                },
                filter: {
                  type: "string",
                  description: "Optional filter to apply"
                }
              },
              required: ["type"]
            }
          }
        ]
      };
      
      // Use the compatibility layer to ensure safe serialization
      return safeJsonStringify(serializeForModuleBoundary(response));
    }
    
    // Default error for unhandled message types
    return safeJsonStringify(serializeForModuleBoundary({
      type: "error",
      message: `Unhandled message type: ${parsed.type || 'unknown'}`
    }));
  } catch (error) {
    console.error('Error processing MCP message:', error);
    return safeJsonStringify(serializeForModuleBoundary({
      type: "error",
      message: `Error processing message: ${error.message}`
    }));
  }
}

/**
 * Main application function
 */
async function main() {
  console.log('Memory Command System MCP Server starting...');
  console.log('Module compatibility layer loaded...');
  
  // Initialize storage adapters
  try {
    // Initialize Neo4j adapter since ChromaDB is disabled
    const graphResult = await knowledgeGraph.initialize();
    
    if (graphResult) {
      console.log('Neo4j storage system initialized successfully');
    } else {
      console.log('Neo4j failed to initialize, running in limited mode');
    }
  } catch (error) {
    console.error('Error initializing storage systems:', error);
    console.log('Running in limited mode (some features may not work)');
  }

  console.log('Memory Command MCP Server running on stdio');
  
  // Set up stdin/stdout for MCP communication
  process.stdin.setEncoding('utf8');
  
  let buffer = '';
  
  process.stdin.on('data', async (chunk) => {
    try {
      buffer += chunk;
      
      const messages = buffer.split('\n');
      buffer = messages.pop(); // Keep the last partial message in the buffer
      
      for (const message of messages) {
        if (message.trim()) {
          try {
            const response = await handleMCPMessage(message);
            process.stdout.write(response + '\n');
          } catch (messageError) {
            console.error('Error processing message:', messageError);
            const errorResponse = safeJsonStringify(serializeForModuleBoundary({
              type: "error",
              message: `Internal server error: ${messageError.message}`
            }));
            process.stdout.write(errorResponse + '\n');
          }
        }
      }
    } catch (streamError) {
      console.error('Stream processing error:', streamError);
      // Try to recover the stream
      buffer = '';
      const errorResponse = safeJsonStringify(serializeForModuleBoundary({
        type: "error",
        message: "Stream processing error, buffer has been reset"
      }));
      process.stdout.write(errorResponse + '\n');
    }
  });
  
  process.stdin.on('end', () => {
    console.log('MCP Server connection closed');
    process.exit(0);
  });
  
  // Handle uncaught exceptions to prevent crashes
  process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    try {
      const errorResponse = safeJsonStringify(serializeForModuleBoundary({
        type: "error",
        message: `Uncaught exception: ${error.message}`,
        stack: error.stack
      }));
      process.stdout.write(errorResponse + '\n');
    } catch (responseError) {
      console.error('Failed to send error response:', responseError);
    }
    // Do not exit process, try to keep running
  });
  
  // Send discovery response at startup
  const discoveryResponse = await handleMCPMessage(JSON.stringify({ type: "discovery" }));
  process.stdout.write(discoveryResponse + '\n');
}

// Run the application
main().catch(error => {
  console.error('Unhandled error in MCP Server:', error);
  process.exit(1);
});
