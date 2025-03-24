/**
 * In-memory fallback adapter for the Memory Command System
 * Used when Neo4j or other persistence layers are unavailable
 */

class MemoryAdapter {
  constructor() {
    this.entities = new Map();
    this.relationships = new Map();
    this.initialized = true;
    this.available = true;
  }

  /**
   * Initialize the in-memory storage
   */
  async initialize() {
    // Already initialized
    return true;
  }

  /**
   * Close the connection (no-op for in-memory)
   */
  async close() {
    // No-op for in-memory
  }

  /**
   * Add an entity to the in-memory storage
   * @param {Object} entity - Entity to add
   * @param {string} entity.id - Unique ID for the entity
   * @param {string} entity.type - Type of entity
   * @param {Object} entity.properties - Properties of the entity
   */
  async addEntity({ id, type, properties }) {
    if (!id) {
      return { success: false, error: 'Entity ID is required' };
    }

    this.entities.set(id, {
      id,
      type,
      properties: { ...properties }
    });

    return {
      success: true,
      id,
      created: true
    };
  }

  /**
   * Add a relationship between entities
   * @param {string} sourceId - ID of the source entity
   * @param {string} targetId - ID of the target entity
   * @param {string} relationshipType - Type of relationship
   * @param {Object} properties - Properties of the relationship
   */
  async addRelationship(sourceId, targetId, relationshipType, properties = {}) {
    if (!sourceId || !targetId) {
      return { success: false, error: 'Source and target IDs are required' };
    }

    const relationshipId = `${sourceId}-${relationshipType}-${targetId}`;
    
    this.relationships.set(relationshipId, {
      source: sourceId,
      target: targetId,
      type: relationshipType,
      properties: { ...properties }
    });

    return {
      success: true,
      created: true
    };
  }

  /**
   * Query entities by type
   * @param {string} type - Entity type to query
   */
  async queryEntitiesByType(type) {
    const results = [];
    
    for (const entity of this.entities.values()) {
      if (entity.type === type) {
        results.push({
          id: entity.id,
          type: entity.type,
          properties: entity.properties
        });
      }
    }

    return results;
  }

  /**
   * Query relationships for an entity
   * @param {string} entityId - ID of the entity
   * @param {string} relationshipType - Optional relationship type filter
   */
  async queryRelationships(entityId, relationshipType = null) {
    const results = [];
    
    for (const relationship of this.relationships.values()) {
      if (relationship.source === entityId || relationship.target === entityId) {
        if (!relationshipType || relationship.type === relationshipType) {
          const sourceEntity = this.entities.get(relationship.source);
          const targetEntity = this.entities.get(relationship.target);
          
          if (sourceEntity && targetEntity) {
            results.push({
              source: {
                id: sourceEntity.id,
                type: sourceEntity.type
              },
              relationship: {
                type: relationship.type,
                properties: relationship.properties
              },
              target: {
                id: targetEntity.id,
                type: targetEntity.type
              }
            });
          }
        }
      }
    }

    return results;
  }
}

module.exports = MemoryAdapter;
