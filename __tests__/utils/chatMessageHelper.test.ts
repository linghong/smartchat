import {
  extractMessageContent,
  extractSubjectTitle
} from '@/src/utils/chatMessageHelper';

describe('extractMessageContent', () => {
  it('should remove {{{...}}} tags and subject title from the message', () => {
    const message = 'This is a test message. {{{Subject Title}}}';
    const result = extractMessageContent(message);
    expect(result).toBe('This is a test message.');
  });

  it('should remove **{{{...}}}** tags and subject title from the message', () => {
    const message = 'This is a test message. **{{{Subject Title}}}**';
    const result = extractMessageContent(message);
    expect(result).toBe('This is a test message.');
  });

  it('should remove {{...}} tags and subject title from the message', () => {
    const message = 'This is a "test" message. {{Subject Title}}';
    const result = extractMessageContent(message);
    expect(result).toBe('This is a "test" message.');
  });

  it('should remove {{}}} tags and subject title from the message', () => {
    const message = 'This is a test message! {{Subject Title}}}';
    const result = extractMessageContent(message);
    expect(result).toBe('This is a test message!');
  });

  it('should remove {{{}} tags and subject title from the message', () => {
    const message = 'This is a test message. {{{Subject Title}}';
    const result = extractMessageContent(message);
    expect(result).toBe('This is a test message.');
  });

  it('should remove {{{}}}} tags and subject title from the message', () => {
    const message = 'This is a test message... {{{Subject Title}}}}';
    const result = extractMessageContent(message);
    expect(result).toBe('This is a test message...');
  });

  it('should handle messages with whitespace around tags', () => {
    const message = 'This is a test message.   {{{Subject Title}}}   ';
    const result = extractMessageContent(message);
    expect(result).toBe('This is a test message.');
  });

  it('should return the original message if there are no tags', () => {
    const message = 'This is a test message.';
    const result = extractMessageContent(message);
    expect(result).toBe(message);
  });

  it('should handle empty messages', () => {
    const message = '';
    const result = extractMessageContent(message);
    expect(result).toBe('');
  });
  it('should remove {{{\\...}}} tags and subject title from the message', () => {
    const message = 'This is a test message. {{{ Subject Title}}}';
    const result = extractMessageContent(message);
    expect(result).toBe('This is a test message.');
  });

  it('should remove {{{\\...}}}} tags and subject title from the message', () => {
    const message = 'This is a test message. {{{ Subject Title}}}}';
    const result = extractMessageContent(message);
    expect(result).toBe('This is a test message.');
  });

  it('should handle messages with multiple tag formats', () => {
    const message = 'Test. {{First}} {{{Second}}} **{{{Fourth}}}**';
    const result = extractMessageContent(message);
    expect(result).toBe('Test. {{First}} {{{Second}}}');
  });
});

describe('extractSubjectTitle', () => {
  it('should extract the subject title from {{{...}}} tags', () => {
    const message = 'This is a test message. {{{Subject Title}}}';
    const result = extractSubjectTitle(message);
    expect(result).toBe('Subject Title');
  });

  it('should extract the subject title from **{{{...}}}** tags', () => {
    const message = 'This is a test message. **{{{Subject Title}}}**';
    const result = extractSubjectTitle(message);
    expect(result).toBe('Subject Title');
  });

  it('should extract the subject title from {{...}} tags', () => {
    const message = 'This is a test message. {{Subject Title}}';
    const result = extractSubjectTitle(message);
    expect(result).toBe('Subject Title');
  });

  it('should extract the subject title from {{}}} tags', () => {
    const message = 'This is a test message. {{Subject Title}}}';
    const result = extractSubjectTitle(message);
    expect(result).toBe('Subject Title');
  });

  it('should extract the subject title from {{{}} tags', () => {
    const message = 'This is a test message. {{{Subject Title}}';
    const result = extractSubjectTitle(message);
    expect(result).toBe('Subject Title');
  });

  it('should extract the subject title from {{{}}}} tags', () => {
    const message = 'Is this a test message? {{{Subject Title}}}}';
    const result = extractSubjectTitle(message);
    expect(result).toBe('Subject Title');
  });

  it('should handle messages with whitespace around tags', () => {
    const message = 'This is a test message.   {{{Subject Title}}}   ';
    const result = extractSubjectTitle(message);
    expect(result).toBe('Subject Title');
  });

  it('should return "New Chat" if there are no tags', () => {
    const message = 'This is a test message.';
    const result = extractSubjectTitle(message);
    expect(result).toBe('New Chat');
  });

  it('should return "New Chat" if the tags are empty', () => {
    const message = 'This is a test message... {{{}}}';
    const result = extractSubjectTitle(message);
    expect(result).toBe('New Chat');
  });

  it('should handle empty messages', () => {
    const message = '';
    const result = extractSubjectTitle(message);
    expect(result).toBe('');
  });

  it('should extract the subject title from tags at the end with whitespace', () => {
    const message = 'This is a test message! {{{Subject Title}}} ';
    const result = extractSubjectTitle(message);
    expect(result).toBe('Subject Title');
  });

  it('should handle multiple sets of tags and extract the last one', () => {
    const message =
      'This is a test {{{First Title}}} message {{{Second Title}}}';
    const result = extractSubjectTitle(message);
    expect(result).toBe('Second Title');
  });
  it('should extract the subject title from {{{\\...}}} tags', () => {
    const message = 'This is a test message. {{{ Subject Title}}}';
    const result = extractSubjectTitle(message);
    expect(result).toBe('Subject Title');
  });

  it('should extract the subject title from {{{\\...}}}} tags', () => {
    const message = 'This is a test message. {{{ Subject Title}}}}';
    const result = extractSubjectTitle(message);
    expect(result).toBe('Subject Title');
  });

  it('should handle messages with multiple tag formats and extract the last one', () => {
    const message =
      'Test. {{First}} {{{Second}}} {{{ Third}}} **{{{Fourth}}}**';
    const result = extractSubjectTitle(message);
    expect(result).toBe('Fourth');
  });

  it('should handle tags with special characters', () => {
    const message =
      'Test message. {{{ Title with spaces and symbols!@#$%^&*()_+}}}';
    const result = extractSubjectTitle(message);
    expect(result).toBe('Title with spaces and symbols!@#$%^&*()_+');
  });
});
