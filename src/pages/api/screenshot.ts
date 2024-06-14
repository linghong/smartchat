import { NextApiRequest, NextApiResponse } from 'next'
import screenshot from 'screenshot-desktop'
import path from 'path'
import fs from 'fs/promises';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
    return
  }

  try {
    const imageName = `screenshot_${Date.now()}.png`
    const screenshotPath = path.join(process.cwd(), 'public', imageName)
    await screenshot({ filename: screenshotPath })
    const fileStats = await fs.stat(screenshotPath);

    res.status(200).json({
      message: 'Screenshot saved', 
      imgPath: `/${imageName}`,
      fileSize: fileStats.size,
      fileName: imageName,
      mimeType: 'image/png' 
    })
  } catch (error) {
    console.error('Error capturing screen:', error)
    res.status(500).json({ message: 'Error capturing screen' })
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb',
    },
  },
}