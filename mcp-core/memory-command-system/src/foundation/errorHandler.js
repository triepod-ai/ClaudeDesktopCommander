/**
 * Error handler utilities for the Memory Command System
 * Provides safe error serialization to prevent JSON parsing issues
 */

/**
 * Safely serialize errors for JSON responses
 * Prevents complex error objects from breaking JSON parsing
 * 
 * @param {Error} error - The error to serialize
 * @returns {Object} Safely serialized error object
 */
function safeSerializeError(error) {
  if (!error) {
    return { message: 'Unknown error', type: 'UnknownError' };
  }

  try {
    // Extract basic properties that are safe to serialize
    const safeError = {
      message: error.message || 'Unknown error',
      type: error.constructor?.name || error.name || 'Error'
    };

    // For ZodError, create a simplified version of the issues
    if ((error.name === 'ZodError' || error.constructor?.name === 'ZodError') && Array.isArray(error.errors || error.issues)) {
      const issues = error.errors || error.issues;
      safeError.validationIssues = issues.map(issue => ({
        path: Array.isArray(issue.path) ? issue.path.join('.') : (issue.path || ''),
        message: issue.message || 'Validation error'
      }));
    }

    // Handle Neo4j database errors
    if (error.code && typeof error.code === 'string' && error.code.startsWith('Neo')) {
      safeError.database = {
        code: error.code,
        // Safely extract only the message from database errors
        message: 'Database operation failed'
      };
    }

    // Handle circular references and nested errors
    if (error.cause && error.cause instanceof Error) {
      safeError.cause = safeSerializeError(error.cause);
    }

    return safeError;
  } catch (serializationError) {
    // If we hit an error during serialization, return a basic error object
    console.error('Error during error serialization:', serializationError);
    return {
      message: 'Error serialization failed',
      type: 'SerializationError',
      originalMessage: typeof error === 'string' ? error : 'Unknown error object'
    };
  }
}

/**
 * Create a safe error response object
 * @param {Error|string|any} error - The error to create a response for
 * @returns {Object} Safe error response object
 */
function createErrorResponse(error) {
  return {
    success: false,
    error: safeSerializeError(error)
  };
}

/**
 * Safe JSON stringify function that handles circular references
 * @param {any} obj - Object to stringify
 * @returns {string} JSON string
 */
function safeJsonStringify(obj) {
  try {
    const cache = new Set();
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (cache.has(value)) {
          return '[Circular Reference]';
        }
        cache.add(value);
      }
      return value;
    }, 2);
  } catch (e) {
    console.error('JSON stringify error:', e);
    return JSON.stringify({ 
      error: 'Failed to stringify object', 
      message: e.message 
    });
  }
}

module.exports = {
  safeSerializeError,
  createErrorResponse,
  safeJsonStringify
};
