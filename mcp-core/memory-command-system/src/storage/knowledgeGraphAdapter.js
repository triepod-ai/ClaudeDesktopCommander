/**
 * Knowledge Graph Adapter for the Memory Command System
 * Handles structured relationships between entities
 */

const neo4j = require('neo4j-driver');

class KnowledgeGraphAdapter {
  constructor(config = {}) {
    this.uri = config.uri || 'neo4j://localhost:7687';
    this.user = config.user || 'neo4j';
    this.password = config.password || 'password';
    this.driver = null;
    this.initialized = false;
    this.available = false;
  }

  /**
   * Initialize the connection to Neo4j
   */
  async initialize() {
    try {
      this.driver = neo4j.driver(
        this.uri,
        neo4j.auth.basic(this.user, this.password)
      );
      
      // Test the connection
      const session = this.driver.session();
      try {
        await session.run('RETURN 1');
        this.initialized = true;
        this.available = true;
        console.log('KnowledgeGraphAdapter initialized successfully');
        return true;
      } finally {
        await session.close();
      }
    } catch (error) {
      console.error('Failed to initialize KnowledgeGraphAdapter:', error);
      this.available = false;
      // Don't throw, just log the error
      return false;
    }
  }

  /**
   * Close the Neo4j connection
   */
  async close() {
    if (this.driver) {
      await this.driver.close();
      this.initialized = false;
      this.available = false;
    }
  }

  /**
   * Add an entity to the Knowledge Graph
   * @param {Object} entity - Entity to add
   * @param {string} entity.id - Unique ID for the entity
   * @param {string} entity.type - Type of entity
   * @param {Object} entity.properties - Properties of the entity
   */
  async addEntity({ id, type, properties }) {
    if (!this.available) {
      return { success: false, error: 'Knowledge Graph service unavailable' };
    }

    if (!this.initialized) {
      const initResult = await this.initialize();
      if (!initResult) {
        return { success: false, error: 'Knowledge Graph service unavailable' };
      }
    }

    const session = this.driver.session();
    try {
      const params = {
        id,
        type,
        ...properties
      };
      
      const result = await session.run(
        `CREATE (e:Entity:${type} {id: $id, type: $type}) 
         SET e += $properties
         RETURN e`,
        { id, type, properties }
      );
      
      return {
        success: true,
        id,
        created: result.summary.counters.updates().nodesCreated > 0
      };
    } catch (error) {
      console.error('Error adding entity to Knowledge Graph:', error);
      return { success: false, error: error.message };
    } finally {
      await session.close();
    }
  }

  /**
   * Add a relationship between entities
   * @param {string} sourceId - ID of the source entity
   * @param {string} targetId - ID of the target entity
   * @param {string} relationshipType - Type of relationship
   * @param {Object} properties - Properties of the relationship
   */
  async addRelationship(sourceId, targetId, relationshipType, properties = {}) {
    if (!this.available) {
      return { success: false, error: 'Knowledge Graph service unavailable' };
    }

    if (!this.initialized) {
      const initResult = await this.initialize();
      if (!initResult) {
        return { success: false, error: 'Knowledge Graph service unavailable' };
      }
    }

    const session = this.driver.session();
    try {
      const result = await session.run(
        `MATCH (source:Entity {id: $sourceId})
         MATCH (target:Entity {id: $targetId})
         CREATE (source)-[r:${relationshipType} $properties]->(target)
         RETURN r`,
        { sourceId, targetId, properties }
      );
      
      return {
        success: true,
        created: result.summary.counters.updates().relationshipsCreated > 0
      };
    } catch (error) {
      console.error('Error adding relationship to Knowledge Graph:', error);
      return { success: false, error: error.message };
    } finally {
      await session.close();
    }
  }

  /**
   * Query entities by type
   * @param {string} type - Entity type to query
   */
  async queryEntitiesByType(type) {
    if (!this.available) {
      return [];
    }

    if (!this.initialized) {
      const initResult = await this.initialize();
      if (!initResult) {
        return [];
      }
    }

    const session = this.driver.session();
    try {
      const result = await session.run(
        `MATCH (e:Entity:${type})
         RETURN e`,
        { type }
      );
      
      return result.records.map(record => {
        const entity = record.get('e').properties;
        return {
          id: entity.id,
          type: entity.type,
          properties: Object.fromEntries(
            Object.entries(entity).filter(([key]) => !['id', 'type'].includes(key))
          )
        };
      });
    } catch (error) {
      console.error('Error querying entities by type:', error);
      return [];
    } finally {
      await session.close();
    }
  }

  /**
   * Query relationships for an entity
   * @param {string} entityId - ID of the entity
   * @param {string} relationshipType - Optional relationship type filter
   */
  async queryRelationships(entityId, relationshipType = null) {
    if (!this.available) {
      return [];
    }

    if (!this.initialized) {
      const initResult = await this.initialize();
      if (!initResult) {
        return [];
      }
    }

    const session = this.driver.session();
    try {
      let query;
      let params = { entityId };
      
      if (relationshipType) {
        query = `
          MATCH (e:Entity {id: $entityId})-[r:${relationshipType}]->(target:Entity)
          RETURN e, r, target
          UNION
          MATCH (source:Entity)-[r:${relationshipType}]->(e:Entity {id: $entityId})
          RETURN source, r, e as target
        `;
      } else {
        query = `
          MATCH (e:Entity {id: $entityId})-[r]->(target:Entity)
          RETURN e, r, target
          UNION
          MATCH (source:Entity)-[r]->(e:Entity {id: $entityId})
          RETURN source, r, e as target
        `;
      }
      
      const result = await session.run(query, params);
      
      return result.records.map(record => {
        const source = record.get('source').properties;
        const relationship = record.get('r');
        const target = record.get('target').properties;
        
        return {
          source: {
            id: source.id,
            type: source.type
          },
          relationship: {
            type: relationship.type,
            properties: relationship.properties
          },
          target: {
            id: target.id,
            type: target.type
          }
        };
      });
    } catch (error) {
      console.error('Error querying relationships:', error);
      return [];
    } finally {
      await session.close();
    }
  }
}

module.exports = KnowledgeGraphAdapter;
