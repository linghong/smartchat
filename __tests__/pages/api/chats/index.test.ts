import { NextApiRequest, NextApiResponse } from 'next';
import { DataSource, Repository } from 'typeorm';
import handler from '@/src/pages/api/chats/index';
import { getAppDataSource, Chat, User } from '@/src/db';
import { withAuth } from '@/src/middleware/auth';
// Mock the db dependencies and middleware
jest.mock('@/src/db', () => ({
  getAppDataSource: jest.fn(),
  Chat: jest.fn(),
  User: jest.fn()
}));
jest.mock('@/src/middleware/auth', () => ({
  withAuth: jest.fn(handler => handler)
}));
describe('Chat API Handler', () => {
  let mockReq: Partial;
  let mockRes: Partial;
  let mockDataSource: jest.Mocked;
  let mockChatRepository: jest.Mocked;
  let mockQueryBuilder: any;
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
    };
    mockDataSource = {
      getRepository: jest.fn()
    } as unknown as jest.Mocked;
    mockChatRepository = {
      create: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder)
    } as unknown as jest.Mocked;
    (getAppDataSource as jest.Mock).mockResolvedValue(mockDataSource);
    mockDataSource.getRepository.mockReturnValue(mockChatRepository);
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });
  it('should create a new chat on POST request', async () => {
    mockReq.method = 'POST';
    mockReq.body = { title: 'Test Chat', metadata: { key: 'value' } };
    const mockChat = {
      id: 1,
      title: 'Test Chat',
      userId: 1,
      metadata: { key: 'value' },
      createdAt: new Date()
    };
    mockChatRepository.create.mockReturnValue(mockChat as Chat);
    mockChatRepository.save.mockResolvedValue(mockChat as Chat);
    await handler(mockReq as NextApiRequest, mockRes as NextApiResponse, 1);
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(mockChat);
  });
  it('should return 400 if title is missing in POST request', async () => {
    mockReq.method = 'POST';
    mockReq.body = {};
    await handler(mockReq as NextApiRequest, mockRes as NextApiResponse, 1);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Missing title' });
  });
  it('should fetch chats on GET request', async () => {
    mockReq.method = 'GET';
    const mockChats = [
      { id: 1, title: 'Chat 1', createdAt: new Date() },
      { id: 2, title: 'Chat 2', createdAt: new Date() }
    ];
    mockQueryBuilder.getMany.mockResolvedValue(mockChats);
    await handler(mockReq as NextApiRequest, mockRes as NextApiResponse, 1);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(mockChats);
  });
  it('should return 405 for unsupported methods', async () => {
    mockReq.method = 'PUT';
    await handler(mockReq as NextApiRequest, mockRes as NextApiResponse, 1);
    expect(mockRes.setHeader).toHaveBeenCalledWith('Allow', ['GET', 'POST']);
    expect(mockRes.status).toHaveBeenCalledWith(405);
    expect(mockRes.end).toHaveBeenCalledWith('Method PUT Not Allowed');
  });
  it('should return 500 if AppDataSource is null', async () => {
    (getAppDataSource as jest.Mock).mockResolvedValue(null);
    await handler(mockReq as NextApiRequest, mockRes as NextApiResponse, 1);
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Internal server error'
    });
  });
  it('should handle errors and return 500', async () => {
    mockReq.method = 'GET';
    const error = new Error('Database error');
    mockQueryBuilder.getMany.mockRejectedValue(error);
    await handler(mockReq as NextApiRequest, mockRes as NextApiResponse, 1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error during Chat operation',
      error
    );
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Internal server error'
    });
  });
});
