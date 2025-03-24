/**
 * Handler for /list command
 */

/**
 * Aggregate results with counts
 * @param {Array} results - The results to aggregate
 * @returns {Object} Aggregated results with counts
 */
function aggregateResults(results) {
  const aggregated = {
    total: results.length,
    byCategory: {},
    byDate: {}
  };
  
  // Aggregate by category
  results.forEach(result => {
    const category = result.metadata?.category || 'uncategorized';
    if (!aggregated.byCategory[category]) {
      aggregated.byCategory[category] = [];
    }
    aggregated.byCategory[category].push(result);
  });
  
  // Aggregate by date (simplified to just the date part)
  results.forEach(result => {
    if (result.metadata?.timestamp) {
      const date = result.metadata.timestamp.split('T')[0];
      if (!aggregated.byDate[date]) {
        aggregated.byDate[date] = [];
      }
      aggregated.byDate[date].push(result);
    }
  });
  
  return aggregated;
}

/**
 * Format hierarchical view if relationships exist
 * @param {Object} aggregated - The aggregated results
 * @param {Object} knowledgeGraph - Knowledge Graph adapter
 * @returns {Promise<Object>} Hierarchical view
 */
async function formatHierarchicalView(aggregated, knowledgeGraph) {
  const hierarchical = { ...aggregated };
  const categoryHierarchy = {};
  
  // For each category, check if it has relationships
  for (const category in aggregated.byCategory) {
    const items = aggregated.byCategory[category];
    categoryHierarchy[category] = {
      count: items.length,
      items: []
    };
    
    // Check for relationships between items in this category
    for (const item of items) {
      const itemWithRelations = {
        id: item.id,
        content: item.content.substring(0, 50) + (item.content.length > 50 ? '...' : ''),
        timestamp: item.metadata?.timestamp,
        related: []
      };
      
      try {
        // Get relationships for this item from Knowledge Graph
        const relationships = await knowledgeGraph.queryRelationships(item.id);
        
        if (relationships && relationships.length > 0) {
          itemWithRelations.related = relationships.map(rel => ({
            type: rel.relationship.type,
            entity: rel.target.id === item.id ? rel.source.id : rel.target.id
          }));
        }
      } catch (error) {
        console.warn(`Could not get relationships for item ${item.id}:`, error);
      }
      
      categoryHierarchy[category].items.push(itemWithRelations);
    }
  }
  
  hierarchical.hierarchy = categoryHierarchy;
  return hierarchical;
}

/**
 * Handle the /list command
 * @param {Object} command - The parsed command object
 * @param {Object} storage - Storage adapters
 * @returns {Promise<Object>} Result of the operation
 */
async function handleList(command, { chromaDB, knowledgeGraph }) {
  const { listType } = command;
  
  try {
    let results;
    
    if (listType === 'all') {
      // List all items
      results = await chromaDB.queryByMetadata({}, 100);
    } else {
      // List items of a specific type
      results = await chromaDB.queryByMetadata({ category: listType }, 100);
    }
    
    // Aggregate results with counts
    const aggregated = aggregateResults(results);
    
    // Format hierarchical view if relationships exist
    const formatted = await formatHierarchicalView(aggregated, knowledgeGraph);
    
    return {
      success: true,
      type: listType,
      count: results.length,
      results: formatted
    };
  } catch (error) {
    console.error('Error listing items:', error);
    return {
      success: false,
      error: `Error listing items: ${error.message}`
    };
  }
}

module.exports = handleList;
