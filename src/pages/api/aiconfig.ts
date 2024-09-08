import 'reflect-metadata';
import { NextApiRequest, NextApiResponse } from 'next';
import { DataSource } from 'typeorm';

import { getAppDataSource, AIConfig } from '@/src/db';
import { withAuth } from '@/src/middleware/auth';

const handlePostRequest = async (
  req: NextApiRequest,
  res: NextApiResponse,
  dataSource: DataSource,
  userId: number
) => {
  const { name, role, model, topP, temperature, basePrompt, metadata } =
    req.body;

  if (!name) return res.status(400).json({ error: 'Missing AI name' });
  if (!model) return res.status(400).json({ error: 'Missing AI Model name' });

  const aiConfigRepository = dataSource.getRepository(AIConfig);

  const newAIConfig = aiConfigRepository.create({
    name,
    role,
    model,
    topP,
    temperature,
    userId,
    basePrompt,
    metadata
  });

  await aiConfigRepository.save(newAIConfig);

  res
    .status(201)
    .json({ message: 'AI Config saved successfully', config: newAIConfig });
};

const handleGetRequest = async (
  req: NextApiRequest,
  res: NextApiResponse,
  dataSource: DataSource,
  userId: number
) => {
  const aiConfigRespository = dataSource.getRepository(AIConfig);
  const aiconfigs: AIConfig[] = await aiConfigRespository
    .createQueryBuilder('aiconfig')
    .select([
      'aiconfig.name',
      'aiconfig.model',
      'aiconfig.topP',
      'aiconfig.temperature',
      'aiconfig.basePrompt',
      'aiConfig.role',
      'aiconfig.createdAt'
    ])
    .where('aiconfig.userId = :userId', { userId })
    .orderBy('aiconfig.createdAt', 'DESC')
    .getMany();
  res.status(200).json(aiconfigs);
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
          res.status(405).end({ error: `Method ${req.method} Not Allowed` });
      }
    } catch (error) {
      console.error('Error saving AI Config:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
);
export default handler;
