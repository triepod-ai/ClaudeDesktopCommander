import React, { createContext, useContext, useState, useEffect } from 'react';
import { LlmModel, ModelParameters } from '../types';
import { llmService } from '../services/llm/llmService';

interface ModelContextType {
  models: LlmModel[];
  selectedModel: LlmModel | null;
  modelParams: ModelParameters;
  loading: boolean;
  error: string | null;
  setSelectedModel: (model: LlmModel) => void;
  setModelParams: (params: Partial<ModelParameters>) => void;
  refreshModels: () => Promise<void>;
}

const defaultParams: ModelParameters = {
  temperature: 0.7,
  topP: 1.0,
  maxTokens: 1000,
  presencePenalty: 0,
  frequencyPenalty: 0,
};

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export const ModelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [models, setModels] = useState<LlmModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<LlmModel | null>(null);
  const [modelParams, setModelParamsState] = useState<ModelParameters>(defaultParams);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refreshModels = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedModels = await llmService.getAvailableModels();
      setModels(fetchedModels);
      
      // Set the first model as selected if none is selected
      if (!selectedModel && fetchedModels.length > 0) {
        setSelectedModel(fetchedModels[0]);
      }
    } catch (err) {
      setError((err as Error).message);
      // For development, create some dummy models
      const dummyModels: LlmModel[] = [
        {
          id: 'meta-llama-3-8b-instruct',
          name: 'Llama 3 8B Instruct',
          provider: 'Meta',
          contextLength: 4096,
          backend: 'vllm'
        },
        {
          id: 'llama2-13b',
          name: 'Llama 2 13B',
          provider: 'Meta',
          contextLength: 4096,
          backend: 'tensorrt-llm'
        }
      ];
      setModels(dummyModels);
      if (!selectedModel) {
        setSelectedModel(dummyModels[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshModels();
  }, []);

  const setModelParams = (params: Partial<ModelParameters>) => {
    setModelParamsState(prev => ({ ...prev, ...params }));
  };

  const value = {
    models,
    selectedModel,
    modelParams,
    loading,
    error,
    setSelectedModel,
    setModelParams,
    refreshModels
  };

  return (
    <ModelContext.Provider value={value}>
      {children}
    </ModelContext.Provider>
  );
};

export const useModelContext = () => {
  const context = useContext(ModelContext);
  if (context === undefined) {
    throw new Error('useModelContext must be used within a ModelProvider');
  }
  return context;
};
