/**
 * Extracts the message content by removing the <meta> tags and subject title.
 * @param message - The full message including the subject title in <meta> tags.
 * @returns The message content without the <meta> tags.
 */
export const extractMessageContent = (message: string): string => {
  return message.replace(/\{\{\{.*\}\}\}$/, '').trim()
}

/**
 * Extracts the subject title from the message.
 * @param message - The full message including the subject title in <meta> tags.
 * @returns The subject title if found, otherwise an empty string.
 */
export const extractSubjectTitle = (message: string): string => {
  const match = message.match(/\{\{\{(.*)\}\}\}$/)
  return match ? match[1].trim() : ''
}