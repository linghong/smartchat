import { NextApiRequest, NextApiResponse } from 'next';
import {
  DataSource,
  Repository,
  SelectQueryBuilder,
  EntityManager,
  EntityNotFoundError,
  ConnectionIsNotSetError,
  EntityMetadataNotFoundError
} from 'typeorm';

import handler from '@/src/pages/api/chats/[chatId]/chat';
import { getAppDataSource, Chat, ChatMessage, ChatFile } from '@/src/db';
import { withAuth } from '@/src/middleware/auth';

// Mock the db dependencies
jest.mock('@/src/db', () => ({
  getAppDataSource: jest.fn(),
  Chat: jest.fn(),
  ChatMessage: jest.fn(),
  ChatFile: jest.fn()
}));

jest.mock('@/src/middleware/auth', () => ({
  withAuth: jest.fn(handler => handler)
}));

describe('Chat API Handler', () => {
  let mockReq: Partial<NextApiRequest>;
  let mockRes: Partial<NextApiResponse>;
  let mockDataSource: jest.Mocked<DataSource>;
  let mockChatRepository: jest.Mocked<Repository<Chat>>;
  let mockChatMessageRepository: jest.Mocked<Repository<ChatMessage>>;
  let mockChatFileRepository: jest.Mocked<Repository<ChatFile>>;
  let mockQueryBuilder: jest.Mocked<SelectQueryBuilder<Chat>>;
  let mockEntityManager: jest.Mocked<EntityManager>;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    mockReq = {
      query: { chatId: '1' },
      method: 'GET',
      body: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
      end: jest.fn()
    };

    mockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn()
    } as unknown as jest.Mocked<SelectQueryBuilder<Chat>>;

    mockEntityManager = {
      findOne: jest.fn(),
      remove: jest.fn()
    } as unknown as jest.Mocked<EntityManager>;

    mockDataSource = {
      getRepository: jest.fn(),
      transaction: jest.fn(cb => cb(mockEntityManager)),
      createQueryRunner: jest.fn().mockReturnValue({
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
        manager: mockEntityManager
      })
    } as unknown as jest.Mocked<DataSource>;

    mockChatRepository = {
      create: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      findOne: jest.fn()
    } as unknown as jest.Mocked<Repository<Chat>>;

    mockChatMessageRepository = {
      remove: jest.fn()
    } as unknown as jest.Mocked<Repository<ChatMessage>>;

    mockChatFileRepository = {
      remove: jest.fn()
    } as unknown as jest.Mocked<Repository<ChatFile>>;

    (getAppDataSource as jest.Mock).mockResolvedValue(mockDataSource);
    mockDataSource.getRepository.mockImplementation(entity => {
      if (entity === Chat) return mockChatRepository;
      if (entity === ChatMessage) return mockChatMessageRepository;
      if (entity === ChatFile) return mockChatFileRepository;
      return {} as any;
    });

    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should return 405 for unsupported methods', async () => {
    mockReq.method = 'HEAD';

    await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

    expect(mockRes.setHeader).toHaveBeenCalledWith('Allow', ['DELETE', 'PUT']);
    expect(mockRes.status).toHaveBeenCalledWith(405);
    expect(mockRes.end).toHaveBeenCalledWith('Method HEAD Not Allowed');
  });

  it('should return 500 if AppDataSource is null', async () => {
    (getAppDataSource as jest.Mock).mockResolvedValue(null);

    await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Internal server error'
    });
  });

  it('should return 400 for invalid chat ID', async () => {
    mockReq.query = { chatId: 'invalid' };

    await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid chat ID' });
  });

  it('should handle Internal server errors and return 500', async () => {
    mockReq.method = 'DELETE';
    const error = new Error('Database error');
    mockDataSource.transaction.mockRejectedValue(error);

    await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error during Chat operation',
      error
    );
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Internal server error'
    });
  });

  describe('DELETE request', () => {
    beforeEach(() => {
      mockReq.method = 'DELETE';
      mockReq.query = { chatId: '1' };
    });

    it('should delete a chat and associated data on DELETE request', async () => {
      mockReq.method = 'DELETE';
      mockReq.query = { chatId: '1' };
      const mockChat = {
        id: 1,
        title: 'Test Chat',
        createdAt: new Date(),
        messages: [
          {
            id: 1,
            userMessage: 'User message 1',
            aiMessage: 'AI response 1',
            model: 'gpt-3.5-turbo',
            createdAt: new Date(),
            metadata: { key: 'value' },
            chat: {} as Chat,
            chatId: 1,
            files: [
              {
                id: 1,
                fileData: {
                  base64Content: 'base64string',
                  type: 'image/jpeg',
                  size: 1000,
                  name: 'image1.jpg'
                },
                chatMessage: {} as ChatMessage,
                messageId: 1
              },
              {
                id: 2,
                fileData: {
                  base64Content: 'base64string',
                  type: 'image/jpeg',
                  size: 1000,
                  name: 'image2.jpg'
                },
                chatMessage: {} as ChatMessage,
                messageId: 1
              }
            ]
          },
          {
            id: 2,
            userMessage: 'User message 2',
            aiMessage: 'AI response 2',
            model: 'gpt-3.5-turbo',
            createdAt: new Date(),
            metadata: { key: 'value' },
            chat: {} as Chat,
            chatId: 1,
            files: [
              {
                id: 3,
                fileData: {
                  base64Content: 'base64string',
                  type: 'image/jpeg',
                  size: 1000,
                  name: 'image3.jpg'
                },
                chatMessage: {} as ChatMessage,
                messageId: 2
              }
            ]
          }
        ]
      };
      mockEntityManager.findOne.mockResolvedValue(mockChat as Chat);
      mockEntityManager.delete = jest.fn().mockResolvedValue({ affected: 1 });

      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);
      expect(mockDataSource.transaction).toHaveBeenCalled();
      expect(mockEntityManager.findOne).toHaveBeenCalledWith(Chat, {
        where: { id: 1 },
        relations: ['messages', 'messages.files']
      });
      expect(mockEntityManager.delete).toHaveBeenCalledTimes(4); // once for each message's images, once for messages, once for chat
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Chat and all associated data deleted successfully'
      });
    });

    it('should return 404 if chat not found on DELETE request', async () => {
      mockEntityManager.findOne.mockResolvedValue(null);

      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Chat not found' });
    });

    it('should handle case when chat has no messages', async () => {
      const mockChat: Partial<Chat> = {
        id: 1,
        title: 'Test Chat',
        createdAt: new Date(),
        messages: []
      };

      mockEntityManager.findOne.mockResolvedValue(mockChat as Chat);
      mockEntityManager.delete = jest.fn().mockResolvedValue({ affected: 1 });

      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(mockEntityManager.delete).toHaveBeenCalledTimes(2); // Chat, ChatMessage
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should handle case when messages have no images', async () => {
      const mockChat: Partial<Chat> = {
        id: 1,
        title: 'Test Chat',
        createdAt: new Date(),
        messages: [
          {
            id: 1,
            userMessage: 'User message 1',
            aiMessage: 'AI response 1',
            assistant: 'gpt-3.5-turbo',
            createdAt: new Date(),
            chat: {} as Chat,
            chatId: 1,
            files: []
          }
        ]
      };

      mockEntityManager.findOne.mockResolvedValue(mockChat as Chat);
      mockEntityManager.delete = jest.fn().mockResolvedValue({ affected: 1 });

      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(mockEntityManager.delete).toHaveBeenCalledTimes(3); // Chat, ChatMessage ChatFile
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('PUT request', () => {
    beforeEach(() => {
      mockReq.method = 'PUT';
      mockReq.query = { chatId: '1' };
      // Reset mockChatRepository for each test
      mockChatRepository.findOne.mockReset();
      mockChatRepository.save.mockReset();
    });

    it('should update chat title on PUT request', async () => {
      mockReq.body = { title: 'Updated Chat Title' };
      const mockChat: Partial<Chat> = { id: 1, title: 'Old Chat Title' };
      mockChatRepository.findOne.mockResolvedValue(mockChat as Chat);

      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(mockChatRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 }
      });
      expect(mockChatRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Updated Chat Title' })
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Chat title updated successfully'
      });
    });

    it('should update chat tags on PUT request', async () => {
      mockReq.body = { tags: ['tag1', 'tag2'] };
      const mockChat: Partial<Chat> = { id: 1, tags: ['oldTag'] };
      mockChatRepository.findOne.mockResolvedValue(mockChat as Chat);

      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(mockChatRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 }
      });
      expect(mockChatRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ tags: ['tag1', 'tag2'] })
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Chat title updated successfully'
      });
    });

    it('should return 400 if neither title nor tags are provided in PUT request', async () => {
      mockReq.body = {};
      const mockChat = { id: 1 };
      mockChatRepository.findOne.mockResolvedValue(mockChat as Chat);

      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Title or tags must be provided'
      });
    });

    it('should return 400 if title is invalid in PUT request', async () => {
      mockReq.body = { title: '' };
      const mockChat = { id: 1 };
      mockChatRepository.findOne.mockResolvedValue(mockChat as Chat);

      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Title must be a string between 1 and 255 characters'
      });
    });

    it('should return 400 if tags are invalid in PUT request', async () => {
      mockReq.body = { tags: 'not an array' };
      const mockChat = { id: 1 };
      mockChatRepository.findOne.mockResolvedValue(mockChat as Chat);

      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Tags must be an array of strings'
      });
    });

    it('should return 400 for PUT with a wrong type title', async () => {
      mockReq.body = { title: 123 }; // Intentionally wrong type
      const mockChat = { id: 1 };
      mockChatRepository.findOne.mockResolvedValue(mockChat as Chat);

      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Title must be a string between 1 and 255 characters'
      });
    });

    it('should return 404 if chat not found on PUT request', async () => {
      mockReq.body = { title: 'Updated Chat Title' };
      mockChatRepository.findOne.mockResolvedValue(null);

      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Chat not found' });
    });
  });

  describe('Error handling', () => {
    it('should handle EntityNotFoundError', async () => {
      mockReq.method = 'DELETE';
      mockDataSource.transaction.mockRejectedValue(
        new EntityNotFoundError(Chat, 1)
      );

      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Chat not found' });
    });

    it('should handle ConnectionIsNotSetError', async () => {
      mockReq.method = 'DELETE';
      mockDataSource.transaction.mockRejectedValue(
        new ConnectionIsNotSetError('test')
      );

      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Database connection error'
      });
    });

    it('should handle EntityMetadataNotFoundError', async () => {
      mockReq.method = 'DELETE';
      mockDataSource.transaction.mockRejectedValue(
        new EntityMetadataNotFoundError('test')
      );

      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Entity metadata error'
      });
    });
  });
});
