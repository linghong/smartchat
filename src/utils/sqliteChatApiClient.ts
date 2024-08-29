import { Chat } from '@/src/types/chat';
import { OptionType } from '@/src/types/common';

/**
 * Create a new chat with the given title and metadata.
 * @param chatTitle - The title of the chat.
 * @param metadata - Additional metadata for the chat.
 * @returns The created chat or an error message if the creation failed.
 */
export const updateChats = async (
  token: string,
  chatTitle: string,
  metadata: any
) => {
  if (!token) return null;
  try {
    const res = await fetch('/api/chats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title: chatTitle,
        metadata
      })
    });

    if (!res.ok) {
      console.error('Error on post data to Chats table', res.statusText);
      return null;
    }
    const chat = await res.json();

    return chat;
  } catch (e) {
    console.error("Chat isn't created", e);
    return null;
  }
};

/**
 * Fetch all chats and return them as an array of OptionType.
 * @returns A Promise that resolves to an array of OptionType representing the chats.
 */
export const fetchChats = async (token: string): Promise<OptionType[]> => {
  if (!token) return [];
  try {
    const response = await fetch('/api/chats', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
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
