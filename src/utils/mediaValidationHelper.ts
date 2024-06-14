import { ImageFile } from '@/src/types/chat'

export const isSupportedImage = (model: string, image: ImageFile) => {
  let error: string[] = []
  const { size, name, mimeType } = image

  switch (model) {
    case 'gpt-4o' || 'gpt-4-turbo':
      // OpenAI requires image size < 20MB
      if (size >= 20 * 1024 * 1024) {
        error.push(`the size of Image ${name} must be less than 20MB.`)
      }

      // OpenAI requires image short side < 768px and long side < 2000px. However, images exceeding these dimensions still seem to function correctly.
      /*const shortSide = Math.min(width, height)
      const longSide = Math.max(width, height)
      if (shortSide >= 768 || longSide >= 2000) {
        error.push('The Image dimensions are invalid. The short side must be less than 768px, and the long side must be less than 2000px.')
      }*/

      //validate openAI image type requirement
      const validOpenAIImageType = [
        'image/png',
        'image/jpg',
        'image/jpeg',
        'image/gif',
        'image/webp',
      ]
      if (!validOpenAIImageType.includes(mimeType))
        error.push(
          'Only .png, .jpeg, .jpg, .webp, and non-animated .gif. is supported by OpenAI.',
        )
      break

    case 'gemini-1.5-pro' || 'gemini-1.5-flash':
      //Gemini requires size < 2GB, but for security purpose, we will only set next.js to allow for 20MB
      //change next.js setting if large size is desired
      if (size >= 20 * 1024 * 1024) {
        error.push(`The size of Image ${name} must be less tan 2GB.`)
      }

      //validate gemini image type requirement
      const validGeminiImageType = [
        'image/png',
        'image/jpeg',
        'image/webp',
        'image/heic',
        'image/heif',
      ]
      if (!validGeminiImageType.includes(mimeType)) {
        error.push(
          'Only .png, .jpeg, .webp,.heic and .heif is supported by Gemini.',
        )
      }
      break

    default:
      error.push('Unsupported model or invalid parameters')
      break
  }

  return error
}
