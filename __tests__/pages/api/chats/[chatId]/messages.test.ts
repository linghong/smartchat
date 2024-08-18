import { NextApiRequest, NextApiResponse } from 'next';
import { getAppDataSource, ChatMessage, ChatImage } from '@/src/db';
import handler from '@/src/pages/api/chats/[chatId]/messages';

jest.mock('@/src/db');
jest.mock('@/src/middleware/auth', () => ({
  withAuth: handler => handler
}));

describe('Messages API Handler', () => {
  let mockReq: Partial<NextApiRequest>;
  let mockRes: Partial<NextApiResponse>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockEnd: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnThis();
    mockEnd = jest.fn();
    mockRes = {
      json: mockJson,
      status: mockStatus,
      setHeader: jest.fn(),
      end: mockEnd
    };
    (getAppDataSource as jest.Mock).mockResolvedValue({
      getRepository: jest.fn().mockReturnValue({
        create: jest.fn().mockReturnValue({ id: 123 }), // Mock an id for the created message
        save: jest.fn().mockResolvedValue({ id: 123 }), // Mock an id for the saved message
        find: jest.fn().mockResolvedValue([])
      })
    });
  });

  describe('POST method', () => {
    beforeEach(() => {
      mockReq = {
        method: 'POST',
        body: {
          userMessage: 'Hello',
          aiMessage: 'Hi there!',
          model: 'gpt-3.5-turbo',
          chatId: 1
        }
      };
    });

    it('should create a new message successfully', async () => {
      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          messageId: 123 // Now we expect a specific messageId
        })
      );
    });

    it('should handle missing required fields', async () => {
      mockReq.body = {};
      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Missing required fields'
      });
    });

    it('should handle image creation when imageSrc is provided', async () => {
      mockReq.body.imageSrc = ['image1.jpg', 'image2.jpg'];
      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          messageId: 123
        })
      );
    });
  });

  describe('GET method', () => {
    beforeEach(() => {
      mockReq = {
        method: 'GET',
        query: { chatId: '1' }
      };
    });

    it('should fetch messages successfully', async () => {
      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalled();
    });

    it('should handle invalid chatId', async () => {
      mockReq.query = {};
      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Invalid chatId'
      });
    });
  });

  describe('Unsupported method', () => {
    it('should return 405 for unsupported methods', async () => {
      mockReq = { method: 'PUT' };
      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(mockStatus).toHaveBeenCalledWith(405);
      expect(mockEnd).toHaveBeenCalledWith('Method PUT not allowed');
    });
  });
});
