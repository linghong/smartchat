import { NextApiRequest, NextApiResponse } from 'next';
import { getAppDataSource, ChatMessage, ChatImage } from '@/src/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const dataSource = await getAppDataSource();
  if (!dataSource)
    return res.status(500).json({ message: 'AppDataSource is null' });

  const chatMessageRepository = dataSource.getRepository(ChatMessage);
  const chatImageRepository = dataSource.getRepository(ChatImage);

  if (req.method === 'POST') {
    const { userMessage, aiMessage, chatId, imageSrc } = req.body;

    if (!userMessage || !aiMessage || !chatId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
      const chatMessage = chatMessageRepository.create({
        userMessage,
        aiMessage,
        chat: { id: chatId }
      });
      await chatMessageRepository.save(chatMessage);

      if (imageSrc && Array.isArray(imageSrc)) {
        const chatImages = imageSrc.map(imageFile =>
          chatImageRepository.create({
            imageFile,
            chatMessage: chatMessage,
            messageId: chatMessage.id // Explicitly set the messageId
          })
        );
        await chatImageRepository.save(chatImages);
      }

      res.status(201).json({ success: true, messageId: chatMessage.id });
    } catch (error) {
      console.error('Error saving message:', error);
      res.status(500).json({ success: false, message: 'Error saving message' });
    }
  } else if (req.method === 'GET') {
    const { chatId } = req.query;

    if (!chatId || Array.isArray(chatId)) {
      return res.status(400).json({ message: 'Invalid chatId' });
    }
    try {
      const chatMessages = await chatMessageRepository.find({
        where: { chat: { id: parseInt(chatId) } },
        relations: ['images'],
        order: { createdAt: 'ASC' }
      });

      res.status(200).json(chatMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ message: 'Error fetching messages' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} not allowed`);
  }
}
