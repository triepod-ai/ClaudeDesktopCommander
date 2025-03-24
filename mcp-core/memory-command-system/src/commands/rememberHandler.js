/**
 * Handler for /remember command
 */

const { v4: uuidv4 } = require('uuid');
const natural = require('natural');
const tokenizer = new natural.WordTokenizer();

/**
 * Extract tags from content using NLP
 * @param {string} content - The content to extract tags from
 * @returns {string[]} Array of extracted tags
 */
function extractTags(content) {
  // Simple implementation: extract unique nouns and verbs as tags
  const words = tokenizer.tokenize(content.toLowerCase());
  
  // Remove duplicates and short words
  return [...new Set(words)]
    .filter(word => word.length > 3)
    .slice(0, 10); // Limit to 10 tags
}

/**
 * Check if content is structured (simple heuristic)
 * @param {string} content - The content to check
 * @returns {boolean} True if content appears to be structured
 */
function isStructured(content) {
  // Simple heuristic: check if content contains JSON, lists, or key-value pairs
  return (
    (content.includes('{') && content.includes('}')) ||
    (content.includes('[') && content.includes(']')) ||
    content.includes(':') ||
    content.includes('\n-')
  );
}

/**
 * Parse structured content into properties
 * @param {string} content - The structured content to parse
 * @returns {Object} Parsed properties
 */
function parseStructure(content) {
  // This is a simplified implementation
  // In a real system, this would have more sophisticated parsing
  
  const properties = {};
  
  // Try to parse as JSON
  try {
    return JSON.parse(content);
  } catch (e) {
    // Not valid JSON, continue with other parsing methods
  }
  
  // Look for key-value pairs (key: value)
  const lines = content.split('\n');
  for (const line of lines) {
    const match = line.match(/^([^:]+):\s*(.+)$/);
    if (match) {
      const [_, key, value] = match;
      properties[key.trim()] = value.trim();
    }
  }
  
  return properties;
}

/**
 * Handle the /remember command
 * @param {Object} command - The parsed command object
 * @param {Object} storage - Storage adapters
 * @returns {Promise<Object>} Result of the operation
 */
async function handleRemember(command, { chromaDB, knowledgeGraph }) {
  const { category, content } = command;
  
  // Generate a unique ID for this memory
  const id = uuidv4();
  const timestamp = new Date().toISOString();
  const tags = extractTags(content);
  
  // Store in Chroma
  await chromaDB.addDocument({
    id,
    content,
    metadata: { 
      category, 
      timestamp, 
      tags: tags.join(',') 
    }
  });
  
  // Store in Knowledge Graph if structured
  if (isStructured(content)) {
    const properties = parseStructure(content);
    
    await knowledgeGraph.addEntity({
      id,
      type: category,
      properties
    });
    
    // If we can identify relationships, add those too
    // This would be more sophisticated in a real implementation
  }
  
  return {
    success: true,
    message: `Remembered in category "${category}" with ID: ${id}`,
    id,
    tags
  };
}

module.exports = handleRemember;
