import 'reflect-metadata';
import { NextApiRequest, NextApiResponse } from 'next';
import {
  DataSource,
  EntityNotFoundError,
  ConnectionIsNotSetError,
  EntityMetadataNotFoundError
} from 'typeorm';

import { getAppDataSource, Chat, User, ChatMessage, ChatImage } from '@/src/db';
import { withAuth } from '@/src/middleware/auth';

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
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Delete all images associated with the chat's messages
    if (chat.messages) {
      for (const message of chat.messages) {
        if (message.images) {
          await transactionalEntityManager.delete(ChatImage, {
            messageId: message.id
          });
        }
      }
    }

    // Delete all messages associated with the chat
    await transactionalEntityManager.delete(ChatMessage, { chatId: chat.id });

    // Finally, delete the chat itself
    await transactionalEntityManager.delete(Chat, { id: chat.id });
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
    return res.status(400).json({ error: 'Title is required' });
  }

  if (typeof title !== 'string' || title.length < 1 || title.length > 255) {
    return res
      .status(400)
      .json({ error: 'Title must be a string between 1 and 255 characters' });
  }

  // First, find the chat
  const chat = await chatRepository.findOne({ where: { id: chatIdNum } });

  if (!chat) {
    return res.status(404).json({ error: 'Chat not found' });
  }

  // Update the chat title
  chat.title = title;
  await chatRepository.save(chat);

  res.status(200).json({ message: 'Chat title updated successfully' });
};

const handler = withAuth(async (req: NextApiRequest, res: NextApiResponse) => {
  // validation
  const { chatId } = req.query;
  const chatIdNum = Number(chatId);
  if (isNaN(chatIdNum)) {
    return res.status(400).json({ error: 'Invalid chat ID' });
  }

  try {
    const dataSource = await getAppDataSource();

    if (!dataSource)
      return res.status(500).json({ error: 'Internal server error' });

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
      res.status(404).json({ error: 'Chat not found' });
    } else if (error instanceof ConnectionIsNotSetError) {
      res.status(500).json({ error: 'Database connection error' });
    } else if (error instanceof EntityMetadataNotFoundError) {
      res.status(500).json({ error: 'Entity metadata error' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

export default handler;
