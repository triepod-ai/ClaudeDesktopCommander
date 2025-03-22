import React, { createContext, useContext, useState } from 'react';
import { Document, SearchResult } from '../types';
import { ragService } from '../services/rag/ragService';

interface RagContextType {
  documents: Document[];
  searchResults: SearchResult[];
  loading: boolean;
  error: string | null;
  uploadDocument: (file: File) => Promise<void>;
  searchDocuments: (query: string) => Promise<SearchResult[]>;
  getAnswer: (question: string, useContext?: boolean) => Promise<string>;
  deleteDocument: (id: string) => Promise<void>;
}

const RagContext = createContext<RagContextType | undefined>(undefined);

export const RagProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const uploadDocument = async (file: File) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await ragService.uploadDocument(file);
      
      // Add the new document to our local state
      if (result && result.id) {
        const newDocument: Document = {
          id: result.id,
          title: file.name,
          content: '', // We don't store the full content
          metadata: {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            uploadedAt: Date.now()
          },
          createdAt: Date.now()
        };
        
        setDocuments(prev => [...prev, newDocument]);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const searchDocuments = async (query: string): Promise<SearchResult[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const results = await ragService.searchDocuments(query);
      setSearchResults(results);
      return results;
    } catch (err) {
      setError((err as Error).message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getAnswer = async (question: string, useContext = true): Promise<string> => {
    setLoading(true);
    setError(null);
    
    try {
      let context: any[] = [];
      
      // If useContext is true, use the search results as context
      if (useContext && searchResults.length > 0) {
        context = searchResults.map(result => ({
          content: result.document.content,
          source: result.document.title,
        }));
      }
      
      const answer = await ragService.getAnswer(question, context);
      return answer;
    } catch (err) {
      setError((err as Error).message);
      return `Error: ${(err as Error).message}`;
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await ragService.deleteDocument(id);
      setDocuments(prev => prev.filter(doc => doc.id !== id));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    documents,
    searchResults,
    loading,
    error,
    uploadDocument,
    searchDocuments,
    getAnswer,
    deleteDocument
  };

  return (
    <RagContext.Provider value={value}>
      {children}
    </RagContext.Provider>
  );
};

export const useRagContext = () => {
  const context = useContext(RagContext);
  if (context === undefined) {
    throw new Error('useRagContext must be used within a RagProvider');
  }
  return context;
};
