import { Message, LlmModel, ModelParameters } from '../../types';
import { llmApiClient, apiHelpers } from '../api/apiClient';

/**
 * Service for interacting with the custom LLM framework API
 */
export const llmService = {
  /**
   * Get a list of available models
   */
  getAvailableModels: async (): Promise<LlmModel[]> => {
    try {
      const response = await llmApiClient.get('/models');
      return response.data.data.map((model: any) => ({
        id: model.id,
        name: model.id.split('/').pop().replace(/-/g, ' '),
        provider: model.owned_by,
        contextLength: 4096, // Default, would come from API in production
        backend: model.backend || 'default',
        description: model.description,
      }));
    } catch (error) {
      throw apiHelpers.handleError(error);
    }
  },

  /**
   * Get a chat completion from the selected model
   */
  getChatCompletion: async (
    modelId: string,
    messages: Message[],
    params: ModelParameters
  ) => {
    try {
      // Convert our message format to OpenAI format
      const formattedMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await llmApiClient.post('/chat/completions', {
        model: modelId,
        messages: formattedMessages,
        temperature: params.temperature,
        top_p: params.topP,
        max_tokens: params.maxTokens,
        stop: params.stop,
        presence_penalty: params.presencePenalty,
        frequency_penalty: params.frequencyPenalty,
        stream: false,
      });

      return response.data;
    } catch (error) {
      throw apiHelpers.handleError(error);
    }
  },

  /**
   * Update model settings
   */
  updateModelSettings: async (modelConfig: any) => {
    try {
      const response = await llmApiClient.post('/config/models/default', modelConfig);
      return response.data;
    } catch (error) {
      throw apiHelpers.handleError(error);
    }
  },

  /**
   * Set the active backend
   */
  setActiveBackend: async (backend: string) => {
    try {
      const response = await llmApiClient.post(`/config/backends/active/${backend}`);
      return response.data;
    } catch (error) {
      throw apiHelpers.handleError(error);
    }
  },

  /**
   * Get hardware optimization settings
   */
  getHardwareConfig: async () => {
    try {
      const response = await llmApiClient.get('/hardware/config');
      return response.data;
    } catch (error) {
      throw apiHelpers.handleError(error);
    }
  },

  /**
   * Update hardware optimization settings
   */
  updateHardwareConfig: async (config: any) => {
    try {
      const response = await llmApiClient.put('/hardware/config', { config });
      return response.data;
    } catch (error) {
      throw apiHelpers.handleError(error);
    }
  },
};
