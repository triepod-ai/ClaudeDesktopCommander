/**
 * Handler for /recall command
 */

/**
 * Determine if query is category-based
 * @param {string} query - The query to check
 * @returns {boolean} True if query appears to be category-based
 */
function isCategoryQuery(query) {
  // Simple heuristic: if the query is a single word and doesn't contain
  // special characters, assume it's a category
  return (
    !query.includes(' ') && 
    !query.includes(':') && 
    !query.includes(',') &&
    query.length > 0
  );
}

/**
 * Enhance results with context from Knowledge Graph
 * @param {Array} results - Results from Chroma
 * @param {Object} knowledgeGraph - Knowledge Graph adapter
 * @returns {Promise<Array>} Enhanced results
 */
async function enhanceWithContext(results, knowledgeGraph) {
  const enhancedResults = [];
  
  for (const result of results) {
    const enhanced = { ...result };
    
    try {
      // Get relationships for this entity from Knowledge Graph
      const relationships = await knowledgeGraph.queryRelationships(result.id);
      
      if (relationships && relationships.length > 0) {
        enhanced.relationships = relationships;
      }
    } catch (error) {
      console.warn(`Could not enhance result ${result.id} with relationships:`, error);
    }
    
    enhancedResults.push(enhanced);
  }
  
  return enhancedResults;
}

/**
 * Format results for display
 * @param {Array} results - Results to format
 * @returns {Array} Formatted results
 */
function formatResults(results) {
  return results.map(result => {
    const formatted = {
      id: result.id,
      content: result.content,
      category: result.metadata?.category || 'uncategorized',
      timestamp: result.metadata?.timestamp,
      tags: result.metadata?.tags ? result.metadata.tags.split(',') : []
    };
    
    if (result.score !== undefined) {
      formatted.relevance = (1 - result.score) * 100; // Convert distance to relevance percentage
    }
    
    if (result.relationships) {
      formatted.relatedItems = result.relationships.map(rel => ({
        type: rel.relationship.type,
        entity: rel.target.id === result.id ? rel.source.id : rel.target.id
      }));
    }
    
    return formatted;
  });
}

/**
 * Handle the /recall command
 * @param {Object} command - The parsed command object
 * @param {Object} storage - Storage adapters
 * @returns {Promise<Object>} Result of the operation
 */
async function handleRecall(command, { chromaDB, knowledgeGraph }) {
  const { query } = command;
  let results;
  
  if (isCategoryQuery(query)) {
    // Category-based recall
    results = await chromaDB.queryByMetadata({
      category: query
    });
  } else {
    // Content-based recall
    results = await chromaDB.queryBySimilarity(query);
  }
  
  // Enhance with Knowledge Graph context
  const enhancedResults = await enhanceWithContext(results, knowledgeGraph);
  
  // Format results for display
  const formattedResults = formatResults(enhancedResults);
  
  return {
    success: true,
    count: formattedResults.length,
    results: formattedResults
  };
}

module.exports = handleRecall;
