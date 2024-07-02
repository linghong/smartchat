import type { NextApiRequest, NextApiResponse } from 'next';
import { manageServer } from '@/src/services/aws/manageRemoteServer';
import { manageEC2Instance } from '@/src/services/aws/manageRemoteInstance';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { instanceId, instanceIP, userName, pemPath, appName } = req.body;

  try {
    await manageEC2Instance(instanceId, 'stop');
    const serverResponse = await manageServer(
      instanceIP,
      userName,
      pemPath,
      appName,
      'stop'
    );
    res
      .status(200)
      .json({ message: 'Instance and app stopped', serverResponse });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
