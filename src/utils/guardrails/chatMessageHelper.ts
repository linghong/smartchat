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
  '\\}\\}</strong></p>',
  '\\}\\}\\}\\.', // New pattern to match }}}. directly
  '\\}\\}\\}'
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
  const innerContent = match ? match[3].trim() : '';

  return innerContent !== '' ? innerContent : extractFirstSentence(message);
};

function extractFirstSentence(text: string, maxLength: number = 50) {
  // Remove code blocks
  let processedText = text.replace(/<pre><code>[\s\S]*?<\/code><\/pre>/g, '');

  // Split by new lines to get the first line
  let lines = processedText.split('\n');

  // Regular expression to match the first sentence
  const sentenceEndRegex = /[!?;](?:\s|$)/;

  // Find the first sentence
  let firstSentence = lines[0].split('. ')[0].split(sentenceEndRegex)[0].trim();

  // Remove text inside parentheses
  firstSentence = firstSentence.replace(/\s*\([^)]*\)/g, '');

  // If the sentence is shorter than maxLength, return it as is
  if (firstSentence.length <= maxLength) {
    return firstSentence.trim();
  }

  // Try to break the sentence at appropriate points
  const breakPoints = [
    ': ',
    ' which ',
    ' who ',
    ' what ',
    ' where ',
    ' if ',
    ' when ',
    ' while ',
    ' as if '
  ];

  for (let point of breakPoints) {
    let index = firstSentence.indexOf(point);
    if (index > 0 && index < maxLength) {
      return firstSentence.slice(0, index).trim();
    }
  }
  // If no good break point is found, truncate it and add ellipsis
  return firstSentence.slice(0, maxLength);
}
