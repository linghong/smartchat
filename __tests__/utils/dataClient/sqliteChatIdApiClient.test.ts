import fetchMock from 'jest-fetch-mock';
import {
  deleteChat,
  updateChat,
  updateChatMessages,
  fetchChatMessages
} from '@/src/utils/dataClient/sqliteChatIdApiClient';

fetchMock.enableMocks();

beforeEach(() => {
  fetchMock.resetMocks();
  console.error = jest.fn();
});

const mockToken = 'fake-token';

describe('sqliteChatIdApiClient', () => {
  describe('deleteChat', () => {
    it('should delete a chat successfully', async () => {
      const mockResult = { success: true };
      fetchMock.mockResponseOnce(JSON.stringify(mockResult));

      const result = await deleteChat(mockToken, '1');
      expect(result).toEqual(mockResult);
      expect(fetchMock).toHaveBeenCalledWith('/api/chats/1/chat', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mockToken}`
        }
      });
    });

    it('should handle errors when deleting a chat', async () => {
      fetchMock.mockRejectOnce(new Error('Network error'));

      const result = await deleteChat(mockToken, '1');
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        'Failed to delete chat:',
        expect.any(Error)
      );
    });

    it('should not make a request when no token is provided', async () => {
      const result = await deleteChat('', '1');
      expect(result).toBeNull();
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe('updateChat', () => {
    it('should update a chat successfully', async () => {
      const mockResult = { id: 1, title: 'New Title', tags: ['tag1', 'tag2'] };
      fetchMock.mockResponseOnce(JSON.stringify(mockResult));

      const updates = { title: 'New Title', tags: ['tag1', 'tag2'] };
      const result = await updateChat(mockToken, '1', updates);
      expect(result).toEqual(mockResult);
      expect(fetchMock).toHaveBeenCalledWith('/api/chats/1/chat', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mockToken}`
        },
        body: JSON.stringify(updates)
      });
    });

    it('should handle errors when updating a chat', async () => {
      fetchMock.mockRejectOnce(new Error('Network error'));

      const result = await updateChat(mockToken, '1', { title: 'New Title' });
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        'Failed to update chat:',
        expect.any(Error)
      );
    });

    it('should not make a request when no token is provided', async () => {
      const result = await updateChat('', '1', { title: 'New Title' });
      expect(result).toBeNull();
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe('updateChatMessages', () => {
    it('should create a new chat message successfully', async () => {
      const mockChatMessage = {
        id: 1,
        assistant: 'Default GPT-4',
        userMessage: 'Hello',
        aiMessage: 'Hi there'
      };
      fetchMock.mockResponseOnce(JSON.stringify(mockChatMessage));

      const result = await updateChatMessages(
        mockToken,
        1,
        'Hello',
        'Hi there',
        'Default GPT-4',
        []
      );
      expect(result).toEqual(mockChatMessage);
      expect(fetchMock).toHaveBeenCalledWith('/api/chats/1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mockToken}`
        },
        body: JSON.stringify({
          chatId: 1,
          userMessage: 'Hello',
          aiMessage: 'Hi there',
          assistant: 'Default GPT-4',
          fileSrc: []
        })
      });
    });

    it('should handle errors when creating a chat message', async () => {
      fetchMock.mockRejectOnce(new Error('Network error'));

      const result = await updateChatMessages(
        mockToken,
        1,
        'Hello',
        'Hi there',
        'GPT-4',
        []
      );
      expect(result).toBeUndefined();
      expect(console.error).toHaveBeenCalledWith(
        "Chat message isn't saved on the database",
        expect.any(Error)
      );
    });

    it('should not make a request when no token is provided', async () => {
      const result = await updateChatMessages(
        '',
        1,
        'Hello',
        'Hi there',
        'GPT-4',
        []
      );
      expect(result).toBeNull();
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe('fetchChatMessages', () => {
    it('should fetch chat messages successfully', async () => {
      const mockChatMessages = [
        { id: 1, userMessage: 'Hello', aiMessage: 'Hi there', model: 'GPT-4' },
        {
          id: 2,
          userMessage: 'How are you?',
          aiMessage: "I'm good, thanks!",
          model: 'GPT-4'
        }
      ];
      fetchMock.mockResponseOnce(JSON.stringify(mockChatMessages));

      const result = await fetchChatMessages(mockToken, 1);
      expect(result).toEqual(mockChatMessages);
      expect(fetchMock).toHaveBeenCalledWith('/api/chats/1/messages', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mockToken}`
        }
      });
    });

    it('should handle errors when fetching chat messages', async () => {
      fetchMock.mockRejectOnce(new Error('Network error'));

      const result = await fetchChatMessages(mockToken, 1);
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        'Error fetching chat messages',
        expect.any(Error)
      );
    });

    it('should not make a request when no token is provided', async () => {
      const result = await fetchChatMessages('', 1);
      expect(result).toBeNull();
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });
});
