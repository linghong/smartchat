import { NextApiRequest, NextApiResponse } from 'next'
import screenshot from 'screenshot-desktop'
import Jimp from 'jimp'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
    return
  }

  try {
    // Capture screenshot
    const screenshotBuffer = await screenshot()

    // Process image with Jimp
    const image = await Jimp.read(screenshotBuffer)

    // Resize image if needed (optional)
    image.resize(1024, Jimp.AUTO)

    // Convert to PNG buffer
    const pngBuffer = await image.getBufferAsync(Jimp.MIME_PNG)

    // Convert to base64
    const base64Data = pngBuffer.toString('base64')
    const dataUrl = `data:image/png;base64,${base64Data}`

    res.status(200).json({
      message: 'Screenshot captured and processed',
      base64Image: dataUrl,
      size: pngBuffer.length,
      name: `screenshot_${Date.now()}.png`,
      mimeType: 'image/png'
    })
  } catch (error) {
    console.error('Error capturing or processing screen:', error)
    res
      .status(500)
      .json({
        message: 'Error capturing or processing screen',
        error: (error as Error).message
      })
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb'
    }
  }
}
