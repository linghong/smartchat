import 'reflect-metadata';
import { NextApiRequest, NextApiResponse } from 'next';
import {
  DataSource,
  EntityNotFoundError,
  ConnectionIsNotSetError,
  EntityMetadataNotFoundError
} from 'typeorm';

import { getAppDataSource, Chat, User, ChatMessage, ChatImage } from '@/src/db';

const handleDeleteRequest = async (
  res: NextApiResponse,
  dataSource: DataSource,
  chatIdNum: number
) => {
  // Start a transaction
  await dataSource.transaction(async transactionalEntityManager => {
    // Find the chat
    const chat = await transactionalEntityManager.findOne(Chat, {
      where: { id: chatIdNum },
      relations: ['messages', 'messages.images']
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Delete all images associated with the chat's messages
    for (const message of chat.messages) {
      if (message.images) {
        await transactionalEntityManager.remove(ChatImage, message.images);
      }
    }

    // Delete all messages associated with the chat
    await transactionalEntityManager.remove(ChatMessage, chat.messages);

    // Finally, delete the chat itself
    await transactionalEntityManager.remove(Chat, chat);
  });

  res
    .status(200)
    .json({ message: 'Chat and all associated data deleted successfully' });
};

const handlePutRequest = async (
  req: NextApiRequest,
  res: NextApiResponse,
  dataSource: DataSource,
  chatIdNum: number
) => {
  const { title } = req.body;
  const chatRepository = dataSource.getRepository(Chat);

  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  if (typeof title !== 'string' || title.length < 1 || title.length > 255) {
    return res
      .status(400)
      .json({ message: 'Title must be a string between 1 and 255 characters' });
  }

  // First, find the chat
  const chat = await chatRepository.findOne({ where: { id: chatIdNum } });

  if (!chat) {
    return res.status(404).json({ message: 'Chat not found' });
  }

  // Update the chat title
  chat.title = title;
  await chatRepository.save(chat);

  res.status(200).json({ message: 'Chat title updated successfully' });
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // validation
  const { chatId } = req.query;
  const chatIdNum = Number(chatId);
  if (isNaN(chatIdNum)) {
    return res.status(400).json({ message: 'Invalid chat ID' });
  }

  try {
    const dataSource = await getAppDataSource();

    if (!dataSource)
      return res.status(500).json({ message: 'AppDataSource is null' });

    switch (req.method) {
      case 'DELETE':
        await handleDeleteRequest(res, dataSource, chatIdNum);
        break;
      case 'PUT':
        await handlePutRequest(req, res, dataSource, chatIdNum);
        break;
      default:
        res.setHeader('Allow', ['DELETE', 'PUT']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error during Chat operation', error);
    if (error instanceof EntityNotFoundError) {
      res.status(404).json({ message: 'Chat not found' });
    } else if (error instanceof ConnectionIsNotSetError) {
      res.status(500).json({ message: 'Database connection error' });
    } else if (error instanceof EntityMetadataNotFoundError) {
      res.status(500).json({ message: 'Entity metadata error' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

export default handler;
