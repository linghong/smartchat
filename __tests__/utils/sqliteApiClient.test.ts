import fetchMock from 'jest-fetch-mock';
import {
  updateChats,
  fetchChats,
  updateChatMessages,
  fetchChatMessages
} from '@/src/utils/sqliteApiClient';

fetchMock.enableMocks();

beforeEach(() => {
  fetchMock.resetMocks();
});

describe('sqliteApiClient', () => {
  describe('updateChats', () => {
    it('should create a new chat successfully', async () => {
      const mockChat = { id: 1, title: 'Test Chat' };
      fetchMock.mockResponseOnce(JSON.stringify(mockChat));

      const result = await updateChats('Test Chat', {});
      expect(result).toEqual(mockChat);
      expect(fetchMock).toHaveBeenCalledWith('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Test Chat', metadata: {} })
      });
    });

    it('should handle errors when creating a chat', async () => {
      fetchMock.mockRejectOnce(new Error('Network error'));
      console.error = jest.fn();

      const result = await updateChats('Test Chat', {});
      expect(result).toBeUndefined();
      expect(console.error).toHaveBeenCalledWith(
        "Chat isn't created",
        expect.any(Error)
      );
    });
  });

  describe('fetchChats', () => {
    it('should fetch chats successfully', async () => {
      const mockChats = [
        { id: 1, title: 'Chat 1' },
        { id: 2, title: 'Chat 2' }
      ];
      fetchMock.mockResponseOnce(JSON.stringify(mockChats));

      const result = await fetchChats();
      expect(result).toEqual([
        { label: 'Chat 1', value: '1' },
        { label: 'Chat 2', value: '2' }
      ]);
      expect(fetchMock).toHaveBeenCalledWith('/api/chats');
    });

    it('should handle errors when fetching chats', async () => {
      fetchMock.mockRejectOnce(new Error('Network error'));
      console.error = jest.fn();

      const result = await fetchChats();
      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        'Failed to fetch chats: Network error'
      );
    });
  });

  describe('updateChatMessages', () => {
    it('should create a new chat message successfully', async () => {
      const mockChatMessage = {
        id: 1,
        userMessage: 'Hello',
        aiMessage: 'Hi there'
      };
      fetchMock.mockResponseOnce(JSON.stringify(mockChatMessage));

      const result = await updateChatMessages('Hello', 'Hi there', 1, []);
      expect(result).toEqual(mockChatMessage);
      expect(fetchMock).toHaveBeenCalledWith('/api/chats/1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: 1,
          userMessage: 'Hello',
          aiMessage: 'Hi there',
          imageSrc: []
        })
      });
    });

    it('should handle errors when creating a chat message', async () => {
      fetchMock.mockRejectOnce(new Error('Network error'));
      console.error = jest.fn();

      const result = await updateChatMessages('Hello', 'Hi there', 1, []);
      expect(result).toBeUndefined();
      expect(console.error).toHaveBeenCalledWith(
        "Chat message isn't saved on the database",
        expect.any(Error)
      );
    });
  });

  describe('fetchChatMessages', () => {
    it('should fetch chat messages successfully', async () => {
      const mockChatMessages = [
        { id: 1, userMessage: 'Hello', aiMessage: 'Hi there' },
        { id: 2, userMessage: 'How are you?', aiMessage: "I'm good, thanks!" }
      ];
      fetchMock.mockResponseOnce(JSON.stringify(mockChatMessages));

      const result = await fetchChatMessages('1');
      expect(result).toEqual(mockChatMessages);
      expect(fetchMock).toHaveBeenCalledWith('/api/chats/1/messages', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
    });

    it('should handle errors when fetching chat messages', async () => {
      fetchMock.mockRejectOnce(new Error('Network error'));
      console.error = jest.fn();

      const result = await fetchChatMessages('1');
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        'Error fetching chat messages',
        expect.any(Error)
      );
    });
  });
});
