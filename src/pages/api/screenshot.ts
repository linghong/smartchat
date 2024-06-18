import { NextApiRequest, NextApiResponse } from 'next'
import screenshot from 'screenshot-desktop'
import path from 'path'
import fs from 'fs/promises'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
    return
  }

  try {
    const imageName = `screenshot_${Date.now()}.png`
    const screenshotPath = path.join(process.cwd(), 'public', imageName)
    await screenshot({ filename: screenshotPath })

    const fileBuffer = await fs.readFile(screenshotPath)
    const base64Image = fileBuffer.toString('base64')
    const mimeType = 'image/png'

    res.status(200).json({
      message: 'Screenshot saved',
      base64Image: `data:${mimeType};base64,${base64Image}`,
      size: fileBuffer.length,
      name: imageName,
      mimeType: mimeType,
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
