import {
  extractMessageContent,
  extractSubjectTitle
} from '@/src/utils/chatMessageHelper';

describe('extractMessageContent', () => {
  it('should remove <meta> tags and subject title from the message', () => {
    const message = 'This is a test message {{{Subject Title}}}';
    const result = extractMessageContent(message);
    expect(result).toBe('This is a test message');
  });

  it('should return the original message if there are no <meta> tags', () => {
    const message = 'This is a test message';
    const result = extractMessageContent(message);
    expect(result).toBe(message);
  });

  it('should handle messages with leading and trailing whitespace', () => {
    const message = '   This is a test message {{{Subject Title}}}   ';
    const result = extractMessageContent(message);
    expect(result).toBe('This is a test message');
  });

  it('should handle empty messages', () => {
    const message = '';
    const result = extractMessageContent(message);
    expect(result).toBe('');
  });
});

describe('extractSubjectTitle', () => {
  it('should extract the subject title from the message', () => {
    const message = 'This is a test message {{{Subject Title}}}';
    const result = extractSubjectTitle(message);
    expect(result).toBe('Subject Title');
  });

  it('should return a string with text "New Chat" if there are no <meta> tags', () => {
    const message = 'This is a test message';
    const result = extractSubjectTitle(message);
    expect(result).toBe('New Chat');
  });

  it('should handle messages with leading and trailing whitespace', () => {
    const message = '   This is a test message {{{Subject Title}}}   ';
    const result = extractSubjectTitle(message);
    expect(result).toBe('Subject Title');
  });

  it('should return a string with "New Chat" text if the tags are empty', () => {
    const message = 'This is a test message {{{}}}';
    const result = extractSubjectTitle(message);
    expect(result).toBe('');
  });

  it('should handle empty messages', () => {
    const message = '';
    const result = extractSubjectTitle(message);
    expect(result).toBe('New Chat');
  });
});
