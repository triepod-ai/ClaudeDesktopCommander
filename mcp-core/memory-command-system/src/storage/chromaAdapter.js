/**
 * Chroma DB Adapter for the Memory Command System
 * Handles vector storage and semantic search
 */

const { ChromaClient } = require('chromadb');

class ChromaAdapter {
  constructor(config = {}) {
    this.client = new ChromaClient(config.url || 'http://localhost:8000');
    this.collectionName = config.collectionName || 'memory_commands';
    this.collection = null;
    this.initialized = false;
    this.available = false;
  }

  /**
   * Initialize the connection to Chroma DB
   */
  async initialize() {
    try {
      // Check if collection exists, create if not
      const collections = await this.client.listCollections();
      const collectionExists = collections.some(c => c.name === this.collectionName);
      
      if (collectionExists) {
        this.collection = await this.client.getCollection(this.collectionName);
      } else {
        this.collection = await this.client.createCollection(this.collectionName);
      }
      
      this.initialized = true;
      this.available = true;
      console.log(`ChromaAdapter initialized with collection: ${this.collectionName}`);
      return true;
    } catch (error) {
      console.error('Failed to initialize ChromaAdapter:', error);
      this.available = false;
      // Don't throw, just log the error
      return false;
    }
  }

  /**
   * Add a document to the Chroma DB
   * @param {Object} document - Document object to store
   * @param {string} document.id - Unique ID for the document
   * @param {string} document.content - Content to store
   * @param {Object} document.metadata - Metadata for the document
   */
  async addDocument({ id, content, metadata }) {
    if (!this.available) {
      return { success: false, error: 'Chroma DB service unavailable' };
    }

    if (!this.initialized) {
      const initResult = await this.initialize();
      if (!initResult) {
        return { success: false, error: 'Chroma DB service unavailable' };
      }
    }

    try {
      await this.collection.add(
        [id],
        null, // We'll let Chroma generate embeddings
        [content],
        [metadata]
      );
      
      return { success: true, id };
    } catch (error) {
      console.error('Error adding document to Chroma:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Query Chroma DB by similarity
   * @param {string} query - The query text
   * @param {number} limit - Maximum number of results to return
   */
  async queryBySimilarity(query, limit = 5) {
    if (!this.available) {
      return [];
    }

    if (!this.initialized) {
      const initResult = await this.initialize();
      if (!initResult) {
        return [];
      }
    }

    try {
      const results = await this.collection.query(
        query,
        limit
      );
      
      // Handle results based on Chroma response structure
      const ids = results.ids?.[0] || [];
      const documents = results.documents?.[0] || [];
      const metadatas = results.metadatas?.[0] || [];
      const distances = results.distances?.[0] || [];
      
      return ids.map((id, index) => ({
        id,
        content: documents[index] || '',
        metadata: metadatas[index] || {},
        score: distances[index] || 0
      }));
    } catch (error) {
      console.error('Error querying Chroma by similarity:', error);
      return [];
    }
  }

  /**
   * Query Chroma DB by metadata
   * @param {Object} metadata - Metadata to filter by
   * @param {number} limit - Maximum number of results to return
   */
  async queryByMetadata(metadata, limit = 10) {
    if (!this.available) {
      return [];
    }

    if (!this.initialized) {
      const initResult = await this.initialize();
      if (!initResult) {
        return [];
      }
    }

    try {
      const results = await this.collection.get({
        where: metadata,
        limit
      });
      
      // Handle results based on Chroma response structure
      const ids = results.ids || [];
      const documents = results.documents || [];
      const metadatas = results.metadatas || [];
      
      return ids.map((id, index) => ({
        id,
        content: documents[index] || '',
        metadata: metadatas[index] || {}
      }));
    } catch (error) {
      console.error('Error querying Chroma by metadata:', error);
      return [];
    }
  }
}

module.exports = ChromaAdapter;
