import 'reflect-metadata';
import { NextApiRequest, NextApiResponse } from 'next';
import { getAppDataSource, Chat, User } from '@/src/db';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Only one User for the local app. 
  // fixed user with username 'local' and the id automatically created by the database with 1
  const LOCAL_USER_NAME = 'local';

  try {
    const dataSource = await getAppDataSource();
    const userRepository = dataSource.getRepository(User);
    const chatRepository = dataSource.getRepository(Chat);

    if (req.method === 'POST') {

      // Ensure the user exists
      let user = await userRepository.findOneBy({ username: LOCAL_USER_NAME });
      if (!user) {
        user = userRepository.create({
          username: LOCAL_USER_NAME
        });
        await userRepository.save(user);
      }

      const { title, metadata } = req.body;

      if (!title) {
        return res.status(400).json({ message: 'Missing title' });
      }

      const chat = chatRepository.create({
        title,
        userId: user.id,
        metadata
      });

      await chatRepository.save(chat);

      res.status(201).json(chat);

    } else if (req.method === 'GET') {
      const chats = await chatRepository.find({
        where: { userId: 1 },
        order: { createdAt: 'DESC' }
      });
      res.status(200).json(chats);
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
