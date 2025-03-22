import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, Conversation, LlmModel, ModelParameters } from '../types';
import { llmService } from '../services/llm/llmService';
import { useModelContext } from './ModelContext';

interface ChatContextType {
  currentConversation: Conversation | null;
  conversations: Conversation[];
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string, model?: LlmModel, params?: ModelParameters) => Promise<void>;
  createNewConversation: () => void;
  loadConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { selectedModel, modelParams } = useModelContext();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize with a new conversation if none exists
  useEffect(() => {
    if (conversations.length === 0) {
      createNewConversation();
    }
  }, []);

  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: uuidv4(),
      title: 'New Conversation',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversation(newConversation);
  };

  const loadConversation = (id: string) => {
    const conversation = conversations.find(conv => conv.id === id);
    if (conversation) {
      setCurrentConversation(conversation);
    }
  };

  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== id));
    
    if (currentConversation?.id === id) {
      // If we're deleting the current conversation, switch to another one or create new
      if (conversations.length > 1) {
        const nextConversation = conversations.find(conv => conv.id !== id);
        setCurrentConversation(nextConversation || null);
      } else {
        createNewConversation();
      }
    }
  };

  const sendMessage = async (content: string, model = selectedModel, params = modelParams) => {
    if (!currentConversation) return;
    if (!model) return;
    
    setIsLoading(true);
    setError(null);
    
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };
    
    // Update conversation with user message
    const updatedMessages = [...currentConversation.messages, userMessage];
    const updatedConversation = {
      ...currentConversation,
      messages: updatedMessages,
      updatedAt: Date.now(),
    };
    
    setCurrentConversation(updatedConversation);
    updateConversationInList(updatedConversation);
    
    try {
      // Send message to LLM service
      const response = await llmService.getChatCompletion(
        model.id,
        updatedMessages,
        params
      );
      
      // Create assistant message from response
      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: response.choices[0].message.content,
        timestamp: Date.now(),
      };
      
      // Update conversation with assistant response
      const finalMessages = [...updatedMessages, assistantMessage];
      const finalConversation = {
        ...updatedConversation,
        messages: finalMessages,
        updatedAt: Date.now(),
        // Update title if this is the first exchange
        title: updatedMessages.length <= 1 ? 
          content.substring(0, 30) + (content.length > 30 ? '...' : '') : 
          updatedConversation.title,
      };
      
      setCurrentConversation(finalConversation);
      updateConversationInList(finalConversation);
    } catch (err) {
      setError((err as Error).message);
      
      // For development, create a mock response
      const mockAssistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: 'I understand your request. However, since we\'re in development mode, this is a simulated response. In production, I would provide a meaningful response to your query.',
        timestamp: Date.now(),
      };
      
      const finalMessages = [...updatedMessages, mockAssistantMessage];
      const finalConversation = {
        ...updatedConversation,
        messages: finalMessages,
        updatedAt: Date.now(),
        title: updatedMessages.length <= 1 ? 
          content.substring(0, 30) + (content.length > 30 ? '...' : '') : 
          updatedConversation.title,
      };
      
      setCurrentConversation(finalConversation);
      updateConversationInList(finalConversation);
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateConversationInList = (conversation: Conversation) => {
    setConversations(prev => 
      prev.map(conv => conv.id === conversation.id ? conversation : conv)
    );
  };
  
  const value = {
    currentConversation,
    conversations,
    messages: currentConversation?.messages || [],
    isLoading,
    error,
    sendMessage,
    createNewConversation,
    loadConversation,
    deleteConversation,
  };
  
  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};
