import { Chat, ImageFile } from '@/src/types/chat';
import { OptionType } from '@/src/types/common';

/**
 * Create a new chat with the given title and metadata.
 * @param chatTitle - The title of the chat.
 * @param metadata - Additional metadata for the chat.
 * @returns The created chat or an error message if the creation failed.
 */
export const updateChats = async (chatTitle: string, metadata: any) => {
  try {
    const res = await fetch('/api/chats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: chatTitle,
        metadata
      })
    });
    if (!res) {
      console.log('Error on post data to Chats table');
    }
    const chat = await res.json();

    return chat;
  } catch (e) {
    console.error("Chat isn't created", e);
  }
};

/**
 * Fetch all chats and return them as an array of OptionType.
 * @returns A Promise that resolves to an array of OptionType representing the chats.
 */
export const fetchChats = async (): Promise<OptionType[]> => {
  try {
    const response = await fetch('/api/chats');
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    const data = await response.json();
    const chats = data.map((d: Chat, i: number) => ({
      label: d.title,
      value: d.id.toString()
    }));
    return chats;
  } catch (error: any) {
    console.error(`Failed to fetch chats: ${error.message}`);
    return [];
  }
};

/**
 * Create a new chat message with the given details.
 * @param userMessage - The message from the user.
 * @param aiMessage - The message from the AI.
 * @param chatId - The ID of the chat to which the message belongs.
 * @returns The created chat message or an error message if the creation failed.
 */
export const updateChatMessages = async (
  userMessage: string,
  aiMessage: string,
  chatId: number,
  imageUrls: string[]
) => {
  try {
    const res = await fetch(`/api/chats/${chatId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chatId,
        userMessage,
        aiMessage,
        imageUrls
      })
    });
    if (!res) {
      console.log('Error on post message to ChatMessage table');
    }
    const chatMessage = await res.json();

    return chatMessage;
  } catch (e) {
    console.error("Chat message isn't saved on the database", e);
  }
};
