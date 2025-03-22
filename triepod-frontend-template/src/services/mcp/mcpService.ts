import { Tool, ToolExecutionRequest, ToolExecutionResult } from '../../types';
import { mcpApiClient, apiHelpers } from '../api/apiClient';

/**
 * Service for interacting with the MCP server
 */
export const mcpService = {
  /**
   * Get a list of available tools
   */
  getTools: async (): Promise<Tool[]> => {
    try {
      const response = await mcpApiClient.get('/tools');
      return response.data;
    } catch (error) {
      throw apiHelpers.handleError(error);
    }
  },

  /**
   * Execute a command on the MCP server
   */
  executeCommand: async (request: ToolExecutionRequest): Promise<ToolExecutionResult> => {
    try {
      const { toolName, parameters } = request;
      const response = await mcpApiClient.post(`/${toolName}`, parameters);
      
      return {
        status: 'success',
        result: response.data,
      };
    } catch (error) {
      throw apiHelpers.handleError(error);
    }
  },

  /**
   * Read output from a running command
   */
  readOutput: async (pid: number): Promise<string> => {
    try {
      const response = await mcpApiClient.post('/read_output', { pid });
      return response.data.output;
    } catch (error) {
      throw apiHelpers.handleError(error);
    }
  },

  /**
   * Terminate a running command
   */
  terminateCommand: async (pid: number): Promise<void> => {
    try {
      await mcpApiClient.post('/force_terminate', { pid });
    } catch (error) {
      throw apiHelpers.handleError(error);
    }
  },

  /**
   * Read file contents
   */
  readFile: async (path: string): Promise<string> => {
    try {
      const response = await mcpApiClient.post('/read_file', { path });
      return response.data.content;
    } catch (error) {
      throw apiHelpers.handleError(error);
    }
  },

  /**
   * Write file contents
   */
  writeFile: async (path: string, content: string): Promise<void> => {
    try {
      await mcpApiClient.post('/write_file', { path, content });
    } catch (error) {
      throw apiHelpers.handleError(error);
    }
  },

  /**
   * List directory contents
   */
  listDirectory: async (path: string): Promise<string[]> => {
    try {
      const response = await mcpApiClient.post('/list_directory', { path });
      return response.data.entries;
    } catch (error) {
      throw apiHelpers.handleError(error);
    }
  },

  /**
   * Search files with pattern
   */
  searchFiles: async (path: string, pattern: string): Promise<string[]> => {
    try {
      const response = await mcpApiClient.post('/search_files', { path, pattern });
      return response.data.matches;
    } catch (error) {
      throw apiHelpers.handleError(error);
    }
  },
  
  /**
   * Edit a file with search/replace block
   */
  editBlock: async (blockContent: string): Promise<void> => {
    try {
      await mcpApiClient.post('/edit_block', { blockContent });
    } catch (error) {
      throw apiHelpers.handleError(error);
    }
  },
};
