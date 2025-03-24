/**
 * Command Parser for the Memory Command System
 * Parses input strings into structured command objects
 */

/**
 * Parse a command string into a structured command object
 * @param {string} input - The raw command string
 * @returns {Object} The parsed command object
 */
function parseCommand(input) {
  if (!input || typeof input !== 'string') {
    return { type: 'unknown', error: 'Invalid input' };
  }

  const trimmedInput = input.trim();
  
  // Check if input is a command (starts with /)
  if (!trimmedInput.startsWith('/')) {
    return { type: 'text', content: trimmedInput };
  }

  // Extract command parts
  const parts = trimmedInput.split(' ');
  const commandType = parts[0].substring(1).toLowerCase(); // Remove the / and convert to lowercase
  
  switch (commandType) {
    case 'remember':
      return parseRememberCommand(parts);
    case 'recall':
      return parseRecallCommand(parts);
    case 'analyze':
      return parseAnalyzeCommand(parts);
    case 'plan':
      return parsePlanCommand(parts);
    case 'list':
      return parseListCommand(parts);
    default:
      return { type: 'unknown', command: commandType };
  }
}

/**
 * Parse a /remember command
 * Format: /remember [category] [content]
 */
function parseRememberCommand(parts) {
  if (parts.length < 3) {
    return { 
      type: 'remember', 
      error: 'Invalid format. Use: /remember [category] [content]' 
    };
  }

  const category = parts[1];
  const content = parts.slice(2).join(' ');

  return {
    type: 'remember',
    category,
    content
  };
}

/**
 * Parse a /recall command
 * Format: /recall [query]
 */
function parseRecallCommand(parts) {
  if (parts.length < 2) {
    return { 
      type: 'recall', 
      error: 'Invalid format. Use: /recall [query]' 
    };
  }

  const query = parts.slice(1).join(' ');

  return {
    type: 'recall',
    query
  };
}

/**
 * Parse an /analyze command
 * Format: /analyze [target] [goal]
 */
function parseAnalyzeCommand(parts) {
  if (parts.length < 3) {
    return { 
      type: 'analyze', 
      error: 'Invalid format. Use: /analyze [target] [goal]' 
    };
  }

  const target = parts[1];
  const goal = parts.slice(2).join(' ');

  return {
    type: 'analyze',
    target,
    goal
  };
}

/**
 * Parse a /plan command
 * Format: /plan [goal] [target]
 */
function parsePlanCommand(parts) {
  if (parts.length < 3) {
    return { 
      type: 'plan', 
      error: 'Invalid format. Use: /plan [goal] [target]' 
    };
  }

  const goal = parts[1];
  const target = parts.slice(2).join(' ');

  return {
    type: 'plan',
    goal,
    target
  };
}

/**
 * Parse a /list command
 * Format: /list [type]
 */
function parseListCommand(parts) {
  if (parts.length < 2) {
    return { 
      type: 'list', 
      error: 'Invalid format. Use: /list [type]' 
    };
  }

  const listType = parts[1];

  return {
    type: 'list',
    listType
  };
}

module.exports = {
  parseCommand
};
