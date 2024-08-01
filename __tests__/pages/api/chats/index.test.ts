import { NextApiRequest, NextApiResponse } from 'next';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import handler from '@/src/pages/api/chats/index';
import { getAppDataSource, Chat, User, ChatMessage, ChatImage } from '@/src/db';

// Mock the db dependencies
jest.mock('@/src/db', () => ({
  getAppDataSource: jest.fn(),
  Chat: jest.fn(),
  User: jest.fn()
}));

describe('Chat API Handler', () => {
  let mockReq: Partial<NextApiRequest>;
  let mockRes: Partial<NextApiResponse>;
  let mockDataSource: jest.Mocked<DataSource>;
  let mockUserRepository: jest.Mocked<Repository<User>>;
  let mockChatRepository: jest.Mocked<Repository<Chat>>;
  let mockQueryBuilder: jest.Mocked<SelectQueryBuilder<Chat>>;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    mockReq = {};
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

    mockDataSource = {
      getRepository: jest.fn()
    } as unknown as jest.Mocked<DataSource>;

    mockUserRepository = {
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn()
    } as unknown as jest.Mocked<Repository<User>>;

    mockChatRepository = {
      create: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      findOne: jest.fn()
    } as unknown as jest.Mocked<Repository<Chat>>;

    (getAppDataSource as jest.Mock).mockResolvedValue(mockDataSource);
    mockDataSource.getRepository.mockImplementation(entity => {
      if (entity === User) return mockUserRepository;
      if (entity === Chat) return mockChatRepository;
      return {} as any;
    });

    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should create a new chat on POST request', async () => {
    mockReq.method = 'POST';
    mockReq.body = { title: 'Test Chat', metadata: { key: 'value' } };
    const mockUser: User = { id: 1, username: 'local', chats: [] };
    mockUserRepository.findOneBy.mockResolvedValue(mockUser);
    const mockChat: Chat = {
      id: 1,
      title: 'Test Chat',
      userId: 1,
      metadata: { key: 'value' },
      createdAt: new Date(),
      messages: [],
      user: mockUser
    };
    mockChatRepository.create.mockReturnValue(mockChat);
    mockChatRepository.save.mockResolvedValue(mockChat);

    await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1,
        title: 'Test Chat',
        userId: 1,
        metadata: { key: 'value' }
      })
    );
  });

  it('should return 400 if title is missing in POST request', async () => {
    mockReq.method = 'POST';
    mockReq.body = {};
    const mockUser: User = { id: 1, username: 'local', chats: [] };
    mockUserRepository.findOneBy.mockResolvedValue(mockUser);

    await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Missing title' });
  });

  it('should fetch chats on GET request', async () => {
    mockReq.method = 'GET';
    const mockUser: User = { id: 1, username: 'local', chats: [] };
    mockUserRepository.findOneBy.mockResolvedValue(mockUser);
    const mockChats: Partial<Chat>[] = [
      { id: 1, title: 'Chat 1', createdAt: new Date() },
      { id: 2, title: 'Chat 2', createdAt: new Date() }
    ];
    mockQueryBuilder.getMany.mockResolvedValue(mockChats as Chat[]);

    await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: 1, title: 'Chat 1' }),
        expect.objectContaining({ id: 2, title: 'Chat 2' })
      ])
    );
  });

  it('should create a new user if not exists', async () => {
    mockReq.method = 'GET';
    mockUserRepository.findOneBy.mockResolvedValue(null);
    const mockUser: User = { id: 1, username: 'local', chats: [] };
    mockUserRepository.create.mockReturnValue(mockUser);
    mockUserRepository.save.mockResolvedValue(mockUser);
    mockQueryBuilder.getMany.mockResolvedValue([]);

    await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

    expect(mockUserRepository.create).toHaveBeenCalledWith({
      username: 'local'
    });
    expect(mockUserRepository.save).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('should return 405 for unsupported methods', async () => {
    mockReq.method = 'HEAD';

    await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

    expect(mockRes.setHeader).toHaveBeenCalledWith('Allow', ['GET', 'POST']);
    expect(mockRes.status).toHaveBeenCalledWith(405);
    expect(mockRes.end).toHaveBeenCalledWith('Method HEAD Not Allowed');
  });

  it('should return 500 if AppDataSource is null', async () => {
    (getAppDataSource as jest.Mock).mockResolvedValue(null);

    await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'AppDataSource is null'
    });
  });

  it('should handle errors and return 500', async () => {
    mockReq.method = 'GET';
    const error = new Error('Database error');
    mockUserRepository.findOneBy.mockRejectedValue(error);

    await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error during Chat table creation',
      error
    );
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Internal server error'
    });
  });
  it('should return 405 for unsupported methods', async () => {
    mockReq.method = 'HEAD';

    await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

    expect(mockRes.setHeader).toHaveBeenCalledWith('Allow', ['GET', 'POST']);
    expect(mockRes.status).toHaveBeenCalledWith(405);
    expect(mockRes.end).toHaveBeenCalledWith('Method HEAD Not Allowed');
  });
});
