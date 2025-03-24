/**
 * Module compatibility layer for Memory Command System
 * Bridges ES Modules and CommonJS interfaces
 */

// Safe serialization for cross-module boundary communication
function serializeForModuleBoundary(data) {
  try {
    // First convert to JSON to strip any non-serializable properties
    const jsonString = JSON.stringify(data, (key, value) => {
      // Handle special cases of non-serializable objects
      if (value instanceof Error) {
        return {
          message: value.message,
          name: value.name,
          stack: value.stack,
          __type: 'Error'
        };
      }
      
      // Handle circular references
      if (typeof value === 'object' && value !== null) {
        const seen = new WeakSet();
        if (seen.has(value)) {
          return '[Circular Reference]';
        }
        seen.add(value);
      }
      
      return value;
    });
    
    // Then parse back to get a clean object
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error serializing data for module boundary:', error);
    return { 
      error: 'Serialization error',
      message: error.message || 'Unknown error during serialization',
      originalData: typeof data === 'object' ? Object.keys(data) : typeof data
    };
  }
}

// Safe deserialization for cross-module boundary communication
function deserializeFromModuleBoundary(data) {
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error('Error deserializing data from module boundary:', error);
      return { 
        error: 'Deserialization error',
        message: error.message || 'Unknown error during deserialization',
        originalString: data.length > 100 ? data.substring(0, 100) + '...' : data
      };
    }
  }
  return data;
}

// Export as CommonJS module
module.exports = {
  serializeForModuleBoundary,
  deserializeFromModuleBoundary
};
