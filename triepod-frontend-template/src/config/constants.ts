/**
 * Application constants
 */

// Local storage keys
export const STORAGE_KEYS = {
  SETTINGS: 'triepod-settings',
  CONVERSATIONS: 'triepod-conversations',
  ACTIVE_CONVERSATION: 'triepod-active-conversation',
  USER_PREFERENCES: 'triepod-user-preferences',
};

// Default model parameters
export const DEFAULT_MODEL_PARAMS = {
  temperature: 0.7,
  topP: 1.0,
  maxTokens: 1000,
  presencePenalty: 0,
  frequencyPenalty: 0,
};

// Default models by provider
export const DEFAULT_MODELS = {
  openai: 'gpt-3.5-turbo',
  anthropic: 'claude-instant-1',
  local: 'meta-llama-3-8b-instruct',
};

// Maximum context lengths by model (in tokens)
export const MODEL_CONTEXT_LENGTHS: Record<string, number> = {
  'gpt-3.5-turbo': 4096,
  'gpt-4': 8192,
  'claude-instant-1': 100000,
  'claude-2': 100000,
  'meta-llama-3-8b-instruct': 4096,
  'llama2-13b': 4096,
};

// Tool categories for organization
export const TOOL_CATEGORIES = [
  'Terminal',
  'Filesystem',
  'Edit',
  'Search',
  'Database',
  'Network',
  'Utility',
];

// Response type indicators
export const RESPONSE_TYPES = {
  TEXT: 'text',
  CODE: 'code',
  IMAGE: 'image',
  FILE: 'file',
  ERROR: 'error',
};

// UI theme settings
export const UI_THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

// Default pagination limits
export const PAGINATION = {
  CONVERSATIONS: 20,
  MESSAGES: 50,
  DOCUMENTS: 10,
  RESULTS: 10,
};

// Search settings
export const SEARCH_SETTINGS = {
  MIN_QUERY_LENGTH: 3,
  DEBOUNCE_MS: 300,
  MAX_RESULTS: 10,
};
