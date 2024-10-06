import {
  extractMessageContent,
  extractSubjectTitle
} from '@/src/utils/guardrails/chatMessageHelper';

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

  it('should remove <p><strong>{{...}}</strong></p> tags and subject title from the message', () => {
    const message =
      'This is a test message. <p><strong>{{Subject Title}}</strong></p>';
    const result = extractMessageContent(message);
    expect(result).toBe('This is a test message.');
  });

  it('should handle messages with multiple tag formats including the new HTML strong tag', () => {
    const message =
      'Test. {{First}} {{{Second}}} **{{{Third}}}** <p><strong>{{Fourth}}</strong></p>';
    const result = extractMessageContent(message);
    expect(result).toBe('Test. {{First}} {{{Second}}} **{{{Third}}}**');
  });

  it('should handle empty messages', () => {
    const message = '';
    const result = extractMessageContent(message);
    expect(result).toBe('');
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

  it('should extract the subject title from <br><p>{{{...}}}</p><br> tags', () => {
    const message =
      'This is a test message. <br><p>{{{Subject Title}}}</p><br>';
    const result = extractSubjectTitle(message);
    expect(result).toBe('Subject Title');
  });

  it('should extract the subject title from <p><strong>{{...}}</strong></p> tags', () => {
    const message =
      'This is a test message. <p><strong>{{Subject Title}}</strong></p>';
    const result = extractSubjectTitle(message);
    expect(result).toBe('Subject Title');
  });

  it('should handle messages with multiple tag formats including the new HTML strong tag and extract the last one', () => {
    const message =
      'Test. {{First}} {{{Second}}} {{{ Third}}} **{{{Fourth}}}** <p><strong>{{Fifth}}</strong></p>';
    const result = extractSubjectTitle(message);
    expect(result).toBe('Fifth');
  });

  it('should handle HTML strong tags with special characters', () => {
    const message =
      'Test message. <p><strong>{{Title with spaces and symbols!@#$%^&*()_+}}</strong></p>';
    const result = extractSubjectTitle(message);
    expect(result).toBe('Title with spaces and symbols!@#$%^&*()_+');
  });

  describe('subject title is empty or tag is missing', () => {
    it('should handle empty messages', () => {
      const message = '';
      const result = extractSubjectTitle(message);
      expect(result).toBe('');
    });

    it('should return the first sentence if no tags are present', () => {
      const message = 'This is a test message. It has multiple sentences.';
      const result = extractSubjectTitle(message);
      expect(result).toBe('This is a test message');
    });

    it('should return the first sentence if the tags are emptyand first sentence is not long', () => {
      const message =
        'This is a test message. It has multiple sentences. {{{}}}';
      const result = extractSubjectTitle(message);
      expect(result).toBe('This is a test message');
    });

    it('should return partial of the first sentence', () => {
      const message =
        'This is a test message when the first sentence is longer than 50 characters. It has multiple sentences.';
      const result = extractSubjectTitle(message);
      expect(result).toBe('This is a test message');
    });

    it('should return partial of the first sentence and text inside () is removed', () => {
      const message =
        'This is a test message (when the first sentence is longer than 50 characters). It has multiple sentences.';
      const result = extractSubjectTitle(message);
      expect(result).toBe('This is a test message');
    });

    it('should return first line', () => {
      const message = `This is a test message 
      when the first sentence is longer than 50 characters). It has multiple sentences.`;
      const result = extractSubjectTitle(message);
      expect(result).toBe('This is a test message');
    });
  });
});
