import React, { createContext, useContext, useState, useEffect } from 'react';
import { Tool, ToolExecutionRequest, ToolExecutionResult } from '../types';
import { mcpService } from '../services/mcp/mcpService';

interface ToolsContextType {
  tools: Tool[];
  loading: boolean;
  error: string | null;
  commandResults: Record<string, any>;
  activeCommands: Record<string, number>;
  executeCommand: (toolName: string, parameters: Record<string, any>) => Promise<ToolExecutionResult>;
  terminateCommand: (pid: number) => Promise<void>;
  refreshTools: () => Promise<void>;
}

const ToolsContext = createContext<ToolsContextType | undefined>(undefined);

export const ToolsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [commandResults, setCommandResults] = useState<Record<string, any>>({});
  const [activeCommands, setActiveCommands] = useState<Record<string, number>>({});

  const refreshTools = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedTools = await mcpService.getTools();
      setTools(fetchedTools);
    } catch (err) {
      setError((err as Error).message);
      
      // For development, use mock tools
      const mockTools: Tool[] = [
        {
          name: 'execute_command',
          description: 'Execute a terminal command with timeout',
          category: 'Terminal',
          parameters: {
            command: {
              type: 'string',
              description: 'The command to execute',
              required: true
            },
            timeout_ms: {
              type: 'number',
              description: 'Timeout in milliseconds',
              required: false
            }
          }
        },
        {
          name: 'read_file',
          description: 'Read file contents',
          category: 'Filesystem',
          parameters: {
            path: {
              type: 'string',
              description: 'Path to the file',
              required: true
            }
          }
        },
        {
          name: 'write_file',
          description: 'Write contents to a file',
          category: 'Filesystem',
          parameters: {
            path: {
              type: 'string',
              description: 'Path to the file',
              required: true
            },
            content: {
              type: 'string',
              description: 'Content to write',
              required: true
            }
          }
        }
      ];
      setTools(mockTools);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshTools();
  }, []);

  const executeCommand = async (toolName: string, parameters: Record<string, any>): Promise<ToolExecutionResult> => {
    setLoading(true);
    setError(null);
    
    try {
      const request: ToolExecutionRequest = {
        toolName,
        parameters
      };
      
      const result = await mcpService.executeCommand(request);
      
      // If the result contains a PID, store it for background commands
      if (result.result && result.result.pid) {
        setActiveCommands(prev => ({
          ...prev,
          [toolName]: result.result.pid
        }));
      }
      
      // Store the result in our state
      setCommandResults(prev => ({
        ...prev,
        [toolName]: result.result
      }));
      
      return result;
    } catch (err) {
      const errorMsg = (err as Error).message;
      setError(errorMsg);
      
      // For development, return a mock result
      const mockResult: ToolExecutionResult = {
        status: 'error',
        error: errorMsg,
      };
      
      return mockResult;
    } finally {
      setLoading(false);
    }
  };

  const terminateCommand = async (pid: number) => {
    try {
      await mcpService.terminateCommand(pid);
      
      // Remove from active commands
      setActiveCommands(prev => {
        const newActiveCommands = { ...prev };
        Object.keys(newActiveCommands).forEach(key => {
          if (newActiveCommands[key] === pid) {
            delete newActiveCommands[key];
          }
        });
        return newActiveCommands;
      });
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const value = {
    tools,
    loading,
    error,
    commandResults,
    activeCommands,
    executeCommand,
    terminateCommand,
    refreshTools
  };

  return (
    <ToolsContext.Provider value={value}>
      {children}
    </ToolsContext.Provider>
  );
};

export const useToolsContext = () => {
  const context = useContext(ToolsContext);
  if (context === undefined) {
    throw new Error('useToolsContext must be used within a ToolsProvider');
  }
  return context;
};
