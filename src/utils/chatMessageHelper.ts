/**
 * Extracts the message content by removing the tag and subject title.
 * the tag can be **{{{...}}}** for gemma or {{{...}}} for other AIs
 * @param message - The full message including the subject title in the tag.
 * @returns The message content without the tag.
 */
export const extractMessageContent = (message: string): string => {
  const regex = /\*\*\{\{\{.*\}\}\}\*\*$|(?<!\*\*)\{\{\{.*\}\}\}$/;
  return message.trim().replace(regex, '').trim();
};

/**
 * Extracts the subject title from the message.
 * @param message - The full message including the subject title and tag.
 * @returns The subject title if found, otherwise 'New Chat'.
 */
export const extractSubjectTitle = (message: string): string => {
  const regex = /\*\*\{\{\{(.*)\}\}\}\*\*$|(?<!\*\*)\{\{\{(.*)\}\}\}$/;
  const match = message.trim().match(regex);
  return match ? (match[1] || match[2]).trim() : 'New Chat';
};
