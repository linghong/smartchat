import { AIConfig } from '@/src/types/chat';

/**
 * Create a new AIConfig with the given data.
 * @param token - the JWT token.
 * @param aiConfig - the aiConfig data.
 * @param selectedNamespaceValue - selected Pinecone RAG namespace.
 * @returns The created AI config or an error message if the creation failed.
 */
export const postAIConfig = async (
  token: string,
  aiConfig: AIConfig,
  selectedNamespaceValue: string
) => {
  if (!token) return [];

  try {
    const response = await fetch('/api/aiconfig', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        ...aiConfig,
        metadata: { namespace: selectedNamespaceValue }
      })
    });
    if (!response.ok) {
      throw new Error(`Failed to save AI Config: ${response.statusText}`);
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error saving AI Config:', error);
    return 'Error saving AI Config';
  }
};

/**
 * fetch aiConfig data.
 * @param  token- The JWT token.
 * @returns All AI config or an error message if fetch failed.
 */
export const getAIConfigs = async (token: string) => {
  if (!token) return [];
  try {
    const response = await fetch('/api/aiconfig', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch AI Configs: ${response.statusText}`);
    }
    const result = await response.json();
    return result as AIConfig[]; // Assuming the API returns an array of AIConfig objects
  } catch (error) {
    console.error('Error fetching AI Configs:', error);
    return [];
  }
};
