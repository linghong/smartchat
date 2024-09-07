import { Chat, AIConfig } from '@/src/types/chat';
import { OptionType } from '@/src/types/common';

/**
 * Create a new chat with the given title and metadata.
 * @param aiConfig - The title of the chat.
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
