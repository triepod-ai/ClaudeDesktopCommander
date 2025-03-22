import { SearchResult } from '../../types';
import { ragApiClient, apiHelpers } from '../api/apiClient';

/**
 * Service for interacting with the RAG agent API
 */
export const ragService = {
  /**
   * Upload a document for indexing
   */
  uploadDocument: async (file: File): Promise<any> => {
    try {
      const formData = new FormData();
      formData.append('document', file);
      
      const response = await ragApiClient.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      throw apiHelpers.handleError(error);
    }
  },

  /**
   * Search documents with a query
   */
  searchDocuments: async (query: string): Promise<SearchResult[]> => {
    try {
      const response = await ragApiClient.post('/search', { query });
      return response.data.results;
    } catch (error) {
      throw apiHelpers.handleError(error);
    }
  },

  /**
   * Get an answer based on a question and optional context
   */
  getAnswer: async (question: string, context: any[] = []): Promise<string> => {
    try {
      const response = await ragApiClient.post('/ask', {
        question,
        context,
      });
      
      return response.data.answer;
    } catch (error) {
      throw apiHelpers.handleError(error);
    }
  },

  /**
   * Delete a document from the index
   */
  deleteDocument: async (id: string): Promise<void> => {
    try {
      await ragApiClient.delete(`/document/${id}`);
    } catch (error) {
      throw apiHelpers.handleError(error);
    }
  },

  /**
   * Get document details by ID
   */
  getDocument: async (id: string): Promise<any> => {
    try {
      const response = await ragApiClient.get(`/document/${id}`);
      return response.data;
    } catch (error) {
      throw apiHelpers.handleError(error);
    }
  },
};
