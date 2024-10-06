import fetchMock from 'jest-fetch-mock';
import {
  updateChats,
  fetchChats
} from '@/src/utils/dataClient/sqliteChatApiClient';

fetchMock.enableMocks();

const token = 'fake-token';
const tags = ['tag1', 'tag2'];

beforeEach(() => {
  fetchMock.resetMocks();
  console.error = jest.fn();
});

describe('sqliteChatApiClient', () => {
  describe('updateChats', () => {
    it('should create a new chat successfully', async () => {
      const mockChat = { id: 1, title: 'Test Chat' };
      fetchMock.mockResponseOnce(JSON.stringify(mockChat));

      const result = await updateChats(token, 'Test Chat', tags, {});
      expect(result).toEqual(mockChat);
      expect(fetchMock).toHaveBeenCalledWith('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: 'Test Chat',
          tags: ['tag1', 'tag2'],
          metadata: {}
        })
      });
    });

    it('should handle errors when creating a chat', async () => {
      fetchMock.mockRejectOnce(new Error('Network error'));

      const result = await updateChats(
        token,
        'Test Chat',
        ['tag1', 'tag2'],
        {}
      );
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        "Chat isn't created",
        expect.any(Error)
      );
    });

    it('should return null when no token is provided', async () => {
      const result = await updateChats('', 'Test Chat', ['tag1', 'tag2'], {});
      expect(result).toBeNull();
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe('fetchChats', () => {
    it('should fetch chats successfully', async () => {
      const mockChats = [
        { id: 1, title: 'Chat 1', tags: ['tag1', 'tag2'] },
        { id: 2, title: 'Chat 2', tags: [] }
      ];
      fetchMock.mockResponseOnce(JSON.stringify(mockChats));

      const result = await fetchChats(token);
      expect(result).toEqual([
        { label: 'Chat 1', value: '1', tags: ['tag1', 'tag2'] },
        { label: 'Chat 2', value: '2', tags: [] }
      ]);
      expect(fetchMock).toHaveBeenCalledWith('/api/chats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
    });

    it('should handle errors when fetching chats', async () => {
      fetchMock.mockRejectOnce(new Error('Network error'));

      const result = await fetchChats(token);
      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        'Failed to fetch chats: Network error'
      );
    });

    it('should return an empty array when no token is provided', async () => {
      const result = await fetchChats(null);
      expect(result).toEqual([]);
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });
});
