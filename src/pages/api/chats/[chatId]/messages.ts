import { NextApiRequest, NextApiResponse } from 'next';
import { getAppDataSource, ChatMessage, ChatImage } from '@/src/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const dataSource = await getAppDataSource();
    if (!dataSource)
      return res.status(500).json({ message: 'AppDataSource is null' });

    const { userMessage, aiMessage, chatId, imageUrls } = req.body;

    const chatMessageRepository = dataSource.getRepository(ChatMessage);
    const chatImageRepository = dataSource.getRepository(ChatImage);

    if (req.method === 'POST') {
      // save chat messages
      const chatMessage = chatMessageRepository.create({
        userMessage,
        aiMessage,
        chatId
      });
      await chatMessageRepository.save(chatMessage);

      // Save chat images
      if (imageUrls && Array.isArray(imageUrls)) {
        const images = imageUrls.map((url: string) => ({
          url,
          messageId: chatMessage.id
        }));
        await chatImageRepository.save(images);
      }

      res.status(201).json(chatMessage);
    } else if (req.method === 'GET') {
      //fetch chat messages
      const chatMessages = await chatMessageRepository
        .createQueryBuilder('chat_message')
        .select([
          'chat_message.id',
          'chat_message.userMessage',
          'chat_message.aiMessage'
        ])
        .where('chat_message.chatId = :chatId', { chatId })
        .orderBy('chat_message.createdAt', 'DESC')
        .getMany();

      res.status(201).json(chatMessages);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} not allowed`);
    }
  } catch (error) {
    console.error('Error during database operation', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
