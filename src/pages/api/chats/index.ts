import 'reflect-metadata';
import { NextApiRequest, NextApiResponse } from 'next';
import { DataSource } from 'typeorm';

import { getAppDataSource, Chat, User } from '@/src/db';

// Only one User for the local app.
// fixed user with username 'local' and the id automatically created by the database with 1
const LOCAL_USER_NAME = 'local';

const handlePostRequest = async (
  req: NextApiRequest,
  res: NextApiResponse,
  dataSource: DataSource,
  user: User
) => {
  const { title, metadata } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Missing title' });
  }
  const chatRepository = dataSource.getRepository(Chat);
  const chat = chatRepository.create({
    title,
    userId: user.id,
    metadata
  });
  await chatRepository.save(chat);

  res.status(201).json(chat);
};

const handleGetRequest = async (
  req: NextApiRequest,
  res: NextApiResponse,
  dataSource: DataSource,
  user: User
) => {
  const chatRepository = dataSource.getRepository(Chat);
  const chats = await chatRepository
    .createQueryBuilder('chat')
    .select(['chat.id', 'chat.title', 'chat.createdAt'])
    .where('chat.userId = :userId', { userId: user.id })
    .orderBy('chat.createdAt', 'DESC')
    .getMany();

  res.status(200).json(chats);
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const dataSource = await getAppDataSource();
    if (!dataSource)
      return res.status(500).json({ message: 'AppDataSource is null' });

    const userRepository = dataSource.getRepository(User);

    let user = await userRepository.findOneBy({ username: LOCAL_USER_NAME });

    if (!user) {
      user = userRepository.create({
        username: LOCAL_USER_NAME
      });
      await userRepository.save(user);
    }

    if (req.method === 'POST') {
      await handlePostRequest(req, res, dataSource, user);
    } else if (req.method === 'GET') {
      await handleGetRequest(req, res, dataSource, user);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error during Chat table creation', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export default handler;
