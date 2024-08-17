import 'reflect-metadata';
import { NextApiRequest, NextApiResponse } from 'next';
import { DataSource } from 'typeorm';

import { getAppDataSource, Chat, User } from '@/src/db';
import { withAuth } from '@/src/middleware/auth';

const handlePostRequest = async (
  req: NextApiRequest,
  res: NextApiResponse,
  dataSource: DataSource,
  userId: number
) => {
  const { title, metadata } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Missing title' });
  }
  const chatRepository = dataSource.getRepository(Chat);
  const chat = chatRepository.create({
    title,
    userId,
    metadata
  });
  await chatRepository.save(chat);
  console.info('Chat created successfully:', chat);
  res.status(201).json(chat);
};

const handleGetRequest = async (
  req: NextApiRequest,
  res: NextApiResponse,
  dataSource: DataSource,
  userId: number
) => {
  const chatRepository = dataSource.getRepository(Chat);
  const chats = await chatRepository
    .createQueryBuilder('chat')
    .select(['chat.id', 'chat.title', 'chat.createdAt'])
    .where('chat.userId = :userId', { userId })
    .orderBy('chat.createdAt', 'DESC')
    .getMany();

  res.status(200).json(chats);
};

const handler = withAuth(
  async (req: NextApiRequest, res: NextApiResponse, userId: number) => {
    try {
      const dataSource = await getAppDataSource();
      if (!dataSource)
        return res.status(500).json({ error: 'Internal server error' });

      switch (req.method) {
        case 'POST':
          await handlePostRequest(req, res, dataSource, userId);
          break;
        case 'GET':
          await handleGetRequest(req, res, dataSource, userId);
          break;
        default:
          res.setHeader('Allow', ['GET', 'POST']);
          res.status(405).end(`Method ${req.method} Not Allowed`);
      }
    } catch (error) {
      console.error('Error during Chat operation', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default handler;
