/**
 * Extracts the message content by removing the tag and subject title.
 * the tag can vary in small models, such as gemma tages it as **{{{...}}}**, Mixtral sometimes tags it as{{{\ }}}}, etc.
 * @param message - The full message including the subject title in the tag.
 * @returns The message content without the tag.
 */
export const extractMessageContent = (message: string): string => {
  const regex =
    /\s*(\*\*\{\{\{.*?\}\}\}\*\*|\{\{\{\\?.*?\}\}\}+|\{\{.*?\}\}+)\s*$/;

  const extractedMessage = message.trim().replace(regex, '').trim();

  return extractedMessage;
};

/**
 * Extracts the subject title from the message.
 * @param message - The full message including the subject title and tag.
 * @returns The subject title if found, otherwise 'New Chat'.
 */
export const extractSubjectTitle = (message: string): string => {
  if (message === '') return '';

  const regex =
    /(\*\*\{\{\{|\{\{\{\\?|\{\{)(?!.*(\*\*\{\{\{|\{\{\{\\?|\{\{))([^{}]*?)(\}\}\}\*\*|\}\}\}+|\}\}+)$/;

  const match = message.trim().match(regex);

  if (match) {
    const innerContent = match[3].trim();
    return innerContent !== '' ? innerContent : 'New Chat';
  }

  return 'New Chat';
};
