// Define patterns for different tag styles
const standardTag = '\\{\\{\\{.*?\\}\\}\\}';
const doubleAsteriskTag = '\\*\\*\\{\\{\\{.*?\\}\\}\\}\\*\\*';
const backslashTag = '\\{\\{\\{\\\\?.*?\\}\\}\\}+';
const doubleOpenTag = '\\{\\{.*?\\}\\}+';
const htmlParagraphTag = '<br><p>\\{\\{\\{.*?\\}\\}\\}</p><br>';
const newHtmlStrongTag = '<p><strong>\\{\\{.*?\\}\\}</strong></p>';

// Combine patterns for extracting message content
const extractContentPatterns = [
  standardTag,
  doubleAsteriskTag,
  backslashTag,
  doubleOpenTag,
  htmlParagraphTag,
  newHtmlStrongTag
];

// Combine patterns for extracting subject title
const extractTitleOpeningPatterns = [
  '<br><p>\\{\\{\\{',
  '\\{\\{\\{',
  '\\*\\*\\{\\{\\{',
  '\\{\\{\\{\\\\?',
  '\\{\\{',
  '<p><strong>\\{\\{'
];

const extractTitleClosingPatterns = [
  '\\}\\}\\}</p><br>',
  '\\}\\}\\}\\*\\*',
  '\\}\\}\\}+',
  '\\}\\}+',
  '\\}\\}</strong></p>'
];

/**
 * Extracts the message content by removing the tag and subject title.
 * @param message - The full message including the subject title in the tag.
 * @returns The message content without the tag.
 */
export const extractMessageContent = (message: string): string => {
  const regex = new RegExp(`\\s*(${extractContentPatterns.join('|')})\\s*$`);
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

  const openingPattern = `(${extractTitleOpeningPatterns.join('|')})`;
  const closingPattern = `(${extractTitleClosingPatterns.join('|')})`;
  const regex = new RegExp(
    `${openingPattern}(?!.*${openingPattern})([^{}]*?)${closingPattern}$`
  );

  const match = message.trim().match(regex);

  if (match) {
    const innerContent = match[3].trim();
    return innerContent !== '' ? innerContent : 'New Chat';
  }

  return 'New Chat';
};
