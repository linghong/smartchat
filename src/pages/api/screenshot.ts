import { NextApiRequest, NextApiResponse } from 'next'
import screenshot from 'screenshot-desktop'
import path from 'path'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
    return
  }

  try {
    const screenshotPath = path.join(process.cwd(), 'public', 'screenshot.png')
    await screenshot({ filename: screenshotPath })
    res.status(200).json({ message: 'Screenshot saved', imgPath: '/screenshot.png' })
  } catch (error) {
    console.error('Error capturing screen:', error)
    res.status(500).json({ message: 'Error capturing screen' })
  }
}
