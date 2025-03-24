/**
 * Command Router for the Memory Command System
 * Routes parsed commands to their appropriate handlers
 */

const { parseCommand } = require('./commandParser');

/**
 * Route a command to the appropriate handler
 * @param {string} input - The raw command string
 * @param {Object} handlers - Object containing handler functions for each command type
 * @returns {Promise<Object>} The result of the command execution
 */
async function routeCommand(input, handlers) {
  const command = parseCommand(input);
  
  // Check if the command is valid
  if (command.error) {
    return { success: false, error: command.error };
  }

  // Check if we have a handler for this command type
  if (!handlers[command.type]) {
    return { 
      success: false, 
      error: `Unknown command type: ${command.type}` 
    };
  }

  try {
    // Execute the appropriate handler
    return await handlers[command.type](command);
  } catch (error) {
    console.error(`Error executing command ${command.type}:`, error);
    return {
      success: false,
      error: `Error executing command: ${error.message}`
    };
  }
}

module.exports = {
  routeCommand
};
