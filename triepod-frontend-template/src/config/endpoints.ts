/**
 * API endpoint configuration
 * These can be overridden by environment variables or user settings
 */

export const loadEndpoints = () => {
  // Use environment variables if available
  const llmEndpoint = process.env.REACT_APP_LLM_API_ENDPOINT || 'http://localhost:8000/v1';
  const mcpEndpoint = process.env.REACT_APP_MCP_API_ENDPOINT || 'http://localhost:3000';
  const ragEndpoint = process.env.REACT_APP_RAG_API_ENDPOINT || 'http://localhost:8080';
  
  // Check for settings in localStorage (user configured)
  if (typeof window !== 'undefined') {
    const storedSettings = window.localStorage.getItem('app-settings');
    if (storedSettings) {
      try {
        const settings = JSON.parse(storedSettings);
        if (settings.apiEndpoints) {
          return {
            llm: settings.apiEndpoints.llm || llmEndpoint,
            mcp: settings.apiEndpoints.mcp || mcpEndpoint,
            rag: settings.apiEndpoints.rag || ragEndpoint,
          };
        }
      } catch (error) {
        console.warn('Error parsing stored settings:', error);
      }
    }
  }
  
  // Return default/env var endpoints
  return {
    llm: llmEndpoint,
    mcp: mcpEndpoint,
    rag: ragEndpoint,
  };
};

export const apiEndpoints = loadEndpoints();

export default apiEndpoints;
