#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Default Ollama API endpoint
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
const DEFAULT_TIMEOUT = 60000; // 60 seconds default timeout

interface OllamaGenerateResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

// Helper function to format error messages
const formatError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};

class OllamaServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'ollama',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'serve',
          description: 'Start Ollama server',
          inputSchema: {
            type: 'object',
            properties: {},
            additionalProperties: false,
          },
        },
        {
          name: 'create',
          description: 'Create a model from a Modelfile',
          inputSchema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Name for the model',
              },
              modelfile: {
                type: 'string',
                description: 'Path to Modelfile',
              },
            },
            required: ['name', 'modelfile'],
            additionalProperties: false,
          },
        },
        {
          name: 'show',
          description: 'Show information for a model',
          inputSchema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Name of the model',
              },
            },
            required: ['name'],
            additionalProperties: false,
          },
        },
        {
          name: 'run',
          description: 'Run a model',
          inputSchema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Name of the model',
              },
              prompt: {
                type: 'string',
                description: 'Prompt to send to the model',
              },
              timeout: {
                type: 'number',
                description: 'Timeout in milliseconds (default: 60000)',
                minimum: 1000,
              },
            },
            required: ['name', 'prompt'],
            additionalProperties: false,
          },
        },
        {
          name: 'pull',
          description: 'Pull a model from a registry',
          inputSchema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Name of the model to pull',
              },
            },
            required: ['name'],
            additionalProperties: false,
          },
        },
        {
          name: 'push',
          description: 'Push a model to a registry',
          inputSchema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Name of the model to push',
              },
            },
            required: ['name'],
            additionalProperties: false,
          },
        },
        {
          name: 'list',
          description: 'List models',
          inputSchema: {
            type: 'object',
            properties: {},
            additionalProperties: false,
          },
        },
        {
          name: 'cp',
          description: 'Copy a model',
          inputSchema: {
            type: 'object',
            properties: {
              source: {
                type: 'string',
                description: 'Source model name',
              },
              destination: {
                type: 'string',
                description: 'Destination model name',
              },
            },
            required: ['source', 'destination'],
            additionalProperties: false,
          },
        },
        {
          name: 'rm',
          description: 'Remove a model',
          inputSchema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Name of the model to remove',
              },
            },
            required: ['name'],
            additionalProperties: false,
          },
        },
        {
          name: 'chat_completion',
          description: 'OpenAI-compatible chat completion API',
          inputSchema: {
            type: 'object',
            properties: {
              model: {
                type: 'string',
                description: 'Name of the Ollama model to use',
              },
              messages: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    role: {
                      type: 'string',
                      enum: ['system', 'user', 'assistant'],
                    },
                    content: {
                      type: 'string',
                    },
                  },
                  required: ['role', 'content'],
                },
                description: 'Array of messages in the conversation',
              },
              temperature: {
                type: 'number',
                description: 'Sampling temperature (0-2)',
                minimum: 0,
                maximum: 2,
              },
              timeout: {
                type: 'number',
                description: 'Timeout in milliseconds (default: 60000)',
                minimum: 1000,
              },
            },
            required: ['model', 'messages'],
            additionalProperties: false,
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        switch (request.params.name) {
          case 'serve':
            return await this.handleServe();
          case 'create':
            return await this.handleCreate(request.params.arguments);
          case 'show':
            return await this.handleShow(request.params.arguments);
          case 'run':
            return await this.handleRun(request.params.arguments);
          case 'pull':
            return await this.handlePull(request.params.arguments);
          case 'push':
            return await this.handlePush(request.params.arguments);
          case 'list':
            return await this.handleList();
          case 'cp':
            return await this.handleCopy(request.params.arguments);
          case 'rm':
            return await this.handleRemove(request.params.arguments);
          case 'chat_completion':
            return await this.handleChatCompletion(request.params.arguments);
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${request.params.name}`
            );
        }
      } catch (error) {
        if (error instanceof McpError) throw error;
        throw new McpError(
          ErrorCode.InternalError,
          `Error executing ${request.params.name}: ${formatError(error)}`
        );
      }
    });
  }

  private async handleServe() {
    try {
      const { stdout, stderr } = await execAsync('ollama serve');
      return {
        content: [
          {
            type: 'text',
            text: stdout || stderr,
          },
        ],
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to start Ollama server: ${formatError(error)}`);
    }
  }

  private async handleCreate(args: any) {
    try {
      const { stdout, stderr } = await execAsync(`ollama create ${args.name} -f ${args.modelfile}`);
      return {
        content: [
          {
            type: 'text',
            text: stdout || stderr,
          },
        ],
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to create model: ${formatError(error)}`);
    }
  }

  private async handleShow(args: any) {
    try {
      const { stdout, stderr } = await execAsync(`ollama show ${args.name}`);
      return {
        content: [
          {
            type: 'text',
            text: stdout || stderr,
          },
        ],
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to show model info: ${formatError(error)}`);
    }
  }

  private async handleRun(args: any) {
    try {
      // Use non-streaming mode for simplicity and compatibility
      const response = await axios.post(
        `${OLLAMA_HOST}/api/generate`,
        {
          model: args.name,
          prompt: args.prompt,
          stream: false,
        },
        {
          timeout: args.timeout || DEFAULT_TIMEOUT,
        }
      );

      return {
        content: [
          {
            type: 'text',
            text: response.data.response,
          },
        ],
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new McpError(
          ErrorCode.InternalError,
          `Ollama API error: ${error.response?.data?.error || error.message}`
        );
      }
      throw new McpError(ErrorCode.InternalError, `Failed to run model: ${formatError(error)}`);
    }
  }

  private async handlePull(args: any) {
    try {
      const { stdout, stderr } = await execAsync(`ollama pull ${args.name}`);
      return {
        content: [
          {
            type: 'text',
            text: stdout || stderr,
          },
        ],
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to pull model: ${formatError(error)}`);
    }
  }

  private async handlePush(args: any) {
    try {
      const { stdout, stderr } = await execAsync(`ollama push ${args.name}`);
      return {
        content: [
          {
            type: 'text',
            text: stdout || stderr,
          },
        ],
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to push model: ${formatError(error)}`);
    }
  }

  private async handleList() {
    try {
      const { stdout, stderr } = await execAsync('ollama list');
      return {
        content: [
          {
            type: 'text',
            text: stdout || stderr,
          },
        ],
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to list models: ${formatError(error)}`);
    }
  }

  private async handleCopy(args: any) {
    try {
      const { stdout, stderr } = await execAsync(`ollama cp ${args.source} ${args.destination}`);
      return {
        content: [
          {
            type: 'text',
            text: stdout || stderr,
          },
        ],
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to copy model: ${formatError(error)}`);
    }
  }

  private async handleRemove(args: any) {
    try {
      const { stdout, stderr } = await execAsync(`ollama rm ${args.name}`);
      return {
        content: [
          {
            type: 'text',
            text: stdout || stderr,
          },
        ],
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to remove model: ${formatError(error)}`);
    }
  }

  private async handleChatCompletion(args: any) {
    try {
      // Convert chat messages to a single prompt
      const prompt = args.messages
        .map((msg: any) => {
          switch (msg.role) {
            case 'system':
              return `System: ${msg.content}\n`;
            case 'user':
              return `User: ${msg.content}\n`;
            case 'assistant':
              return `Assistant: ${msg.content}\n`;
            default:
              return '';
          }
        })
        .join('');

      // Make request to Ollama API with configurable timeout and raw mode
      const response = await axios.post<OllamaGenerateResponse>(
        `${OLLAMA_HOST}/api/generate`,
        {
          model: args.model,
          prompt,
          stream: false,
          temperature: args.temperature,
          raw: true, // Add raw mode for more direct responses
        },
        {
          timeout: args.timeout || DEFAULT_TIMEOUT,
        }
      );

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              id: 'chatcmpl-' + Date.now(),
              object: 'chat.completion',
              created: Math.floor(Date.now() / 1000),
              model: args.model,
              choices: [
                {
                  index: 0,
                  message: {
                    role: 'assistant',
                    content: response.data.response,
                  },
                  finish_reason: 'stop',
                },
              ],
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new McpError(
          ErrorCode.InternalError,
          `Ollama API error: ${error.response?.data?.error || error.message}`
        );
      }
      throw new McpError(ErrorCode.InternalError, `Unexpected error: ${formatError(error)}`);
    }
  }

  async run() {
    // Create stdio transport only - removing problematic SSE transport
    const stdioTransport = new StdioServerTransport();
    
    // Connect stdio transport
    await this.server.connect(stdioTransport);
    
    console.error('Ollama MCP server running on stdio');
  }
}

const server = new OllamaServer();
server.run().catch(console.error);
