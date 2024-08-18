import { Chat, ImageFile } from '@/src/types/chat';
import { OptionType } from '@/src/types/common';

/**
 * Deletes a chat with the given chatId.
 * @param chatId - The ID of the chat to delete.
 * @returns A promise that resolves to the result of the deletion.
 */
export const deleteChat = async (token: string, chatId: string) => {
  if (!token) return null;
  try {
    const res = await fetch(`/api/chats/${chatId}/chat`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      throw new Error(`Error: ${res.statusText}`);
    }

    const result = await res.json();

    return result;
  } catch (error) {
    console.error('Failed to delete chat:', error);
    return null;
  }
};

/**
 * Updates the title of a chat with the given chatId.
 * @param chatId - The ID of the chat to update.
 * @param newTitle - The new title for the chat.
 * @returns A promise that resolves to the result of the update.
 */
export const editChatTitle = async (
  token: string,
  chatId: string,
  newTitle: string
) => {
  if (!token) return null;
  try {
    const res = await fetch(`/api/chats/${chatId}/chat`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ title: newTitle })
    });

    if (!res.ok) {
      throw new Error(`Error: ${res.statusText}`);
    }

    const result = await res.json();

    return result;
  } catch (error) {
    console.error('Failed to update chat title:', error);
    return null;
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
  token: string,
  chatId: number,
  userMessage: string,
  aiMessage: string,
  model: string,
  imageSrc: ImageFile[]
) => {
  if (!token) return null;
  try {
    const res = await fetch(`/api/chats/${chatId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        chatId,
        userMessage,
        aiMessage,
        model,
        imageSrc
      })
    });
    if (!res.ok) {
      throw new Error(`Error: ${res.statusText}`);
    }
    const chatMessage = await res.json();

    return chatMessage;
  } catch (e) {
    console.error("Chat message isn't saved on the database", e);
  }
};

/**
 * Fetch all chat messages for a specific chat.
 * @param chatId - The ID of the chat.
 * @returns A list of chat messages or an error message if the fetch failed.
 */
export const fetchChatMessages = async (token: string, chatId: number) => {
  if (!token) return null;

  try {
    const res = await fetch(`/api/chats/${chatId}/messages`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    if (!res) {
      console.error('Error on fetching chat messages');
      return null;
    }
    const chatMessages = await res.json();

    return chatMessages;
  } catch (e) {
    console.error('Error fetching chat messages', e);
    return null;
  }
};
