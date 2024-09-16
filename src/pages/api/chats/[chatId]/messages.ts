import { NextApiRequest, NextApiResponse } from 'next';

import { getAppDataSource, ChatMessage, ChatFile } from '@/src/db';
import { withAuth } from '@/src/middleware/auth';

const handler = withAuth(async (req: NextApiRequest, res: NextApiResponse) => {
  const dataSource = await getAppDataSource();
  if (!dataSource)
    return res.status(500).json({ message: 'AppDataSource is null' });

  const chatMessageRepository = dataSource.getRepository(ChatMessage);
  const chatFileRepository = dataSource.getRepository(ChatFile);

  if (req.method === 'POST') {
    const { userMessage, aiMessage, assistant, chatId, fileSrc } = req.body;

    if (!userMessage || !aiMessage || !assistant || !chatId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
      const chatMessage = chatMessageRepository.create({
        userMessage,
        aiMessage,
        assistant,
        chat: { id: chatId }
      });
      await chatMessageRepository.save(chatMessage);

      if (fileSrc && Array.isArray(fileSrc)) {
        const chatFiles = fileSrc.map(fileData =>
          chatFileRepository.create({
            fileData,
            type: fileData.type,
            chatMessage: chatMessage,
            messageId: chatMessage.id
          })
        );
        await chatFileRepository.save(chatFiles);
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
        relations: ['files'],
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
});

export default handler;
