import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';

import ChatMessage from '@/src/components/ChatMessage';
import { sanitizeAndFormate } from '@/src/components/AITextMessage';
import { encodeHTMLEntities } from '@/src/utils/htmlEntities';
import { Message, ImageFile } from '@/src/types/chat';

// Mock the console methods to suppress output during tests
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('ChatMessage Component', () => {
  let message: Message;
  let loading: boolean;
  let lastIndex: boolean;
  let fileSrc: FileData[];
  let handleImageDelete: jest.Mock;

  beforeEach(() => {
    message = {
      question: 'What is AI?',
      answer: 'AI stands for Artificial Intelligence.',
      model: 'gpt-4o'
    };
    loading = false;
    lastIndex = true;
    handleFileDelete = jest.fn();
    fileSrc = [
      {
        base64Content: '/path/to/image1.png',
        type: 'image/png',
        size: 5000,
        name: 'image1'
      },
      {
        base64Content: 'path/to/image2.png',
        type: 'image/png',
        size: 8000,
        name: 'image2'
      }
    ];
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders ChatMessage component correctly with question and answer', () => {
    render(
      <ChatMessage
        isNew={false}
        message={message}
        lastIndex={lastIndex}
        loading={loading}
        fileSrc={fileSrc}
        handleFileDelete={handleFileDelete}
      />
    );
    expect(screen.getByText('What is AI?')).toBeInTheDocument();
    expect(
      screen.getByText('AI stands for Artificial Intelligence.')
    ).toBeInTheDocument();
  });

  it('renders the user and AI avatars', () => {
    render(
      <ChatMessage
        isNew={false}
        message={message}
        lastIndex={lastIndex}
        loading={loading}
        fileSrc={fileSrc}
        handleFileDelete={handleFileDelete}
      />
    );
    expect(screen.getByAltText('User avatar')).toBeInTheDocument();
    expect(screen.getByAltText('AI avatar')).toBeInTheDocument();
  });

  it('applies animate-pulse class when loading and is the last index', () => {
    act(() => {
      render(
        <ChatMessage
          isNew={false}
          message={message}
          lastIndex={true}
          loading={true}
          fileSrc={fileSrc}
          handleFileDelete={handleFileDelete}
        />
      );
    });
    const botImages = screen.getAllByAltText('AI avatar') as HTMLElement[];
    expect(botImages[botImages.length - 1]).toHaveClass('animate-pulse');
  });

  it('does not apply animate-pulse class when not loading', () => {
    act(() => {
      render(
        <ChatMessage
          isNew={true}
          message={message}
          lastIndex={true}
          loading={false}
          fileSrc={fileSrc}
          handleFileDelete={handleFileDelete}
        />
      );
    });

    const botImage = screen.getByAltText('AI avatar');
    expect(botImage).not.toHaveClass('animate-pulse');
  });

  it('sanitizes and formats messages correctly', () => {
    const userMessage = `Is <script>alert("XSS")</script> sanitized? 
    it is <strong>sanitized</strong>`;
    const messageWithHtml = {
      ...message,
      question: userMessage,
      answer:
        'Yes, it is <strong>sanitized</strong> and <code>formatted</code>.'
    };
    render(
      <ChatMessage
        isNew={false}
        message={messageWithHtml}
        lastIndex={lastIndex}
        loading={loading}
        fileSrc={fileSrc}
        handleFileDelete={handleFileDelete}
      />
    );
    const result = sanitizeAndFormate(encodeHTMLEntities(userMessage));
    expect(result).not.toContain('<script>');
    expect(result).toContain('sanitized');

    const codeElement = screen.getByText('formatted');
    expect(codeElement.tagName).toBe('CODE');
    expect(codeElement).toHaveClass('inline-code');
  });

  it('renders file thumbnails when fileSrc is provided', () => {
    render(
      <ChatMessage
        isNew={false}
        message={message}
        lastIndex={lastIndex}
        loading={loading}
        fileSrc={fileSrc}
        handleFileDelete={handleFileDelete}
      />
    );
    expect(
      screen.getByTitle('Thumbnail for uploaded file 1')
    ).toBeInTheDocument();
    expect(
      screen.getByTitle('Thumbnail for uploaded file 2')
    ).toBeInTheDocument();
  });

  it('does not render image thumbnails for new messages', () => {
    render(
      <ChatMessage
        isNew={true}
        message={message}
        lastIndex={lastIndex}
        loading={loading}
        fileSrc={fileSrc}
        handleFileDelete={handleFileDelete}
      />
    );
    expect(
      screen.queryByTitle('Uploaded image thumbnail 1')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTitle('Uploaded image thumbnail 2')
    ).not.toBeInTheDocument();
  });

  it('renders code blocks in ai answer correctly', () => {
    const messageWithCode = {
      question: 'Give me a code example.',
      answer:
        'Here\'s a code example:\n<pre>><code class="python">print("Hello, World!")\n</code></pre>',
      model: 'gpt-4'
    };
    render(
      <ChatMessage
        isNew={false}
        message={messageWithCode}
        lastIndex={lastIndex}
        loading={loading}
        fileSrc={fileSrc}
        handleFileDelete={handleFileDelete}
      />
    );
    expect(screen.getByText("Here's a code example:")).toBeInTheDocument();
    expect(screen.getByText('print("Hello, World!")')).toBeInTheDocument();
    const codeBlock = screen.getByText('print("Hello, World!")');
    expect(codeBlock.closest('pre')).toBeInTheDocument();
    expect(codeBlock.closest('code')).toHaveClass('python');
  });

  it('handles multiple code blocks and text content', () => {
    const messageWithMultipleCodeBlocks = {
      question: 'Show me multiple code examples',
      answer: `Here's a Python example:
        <pre><code class=\"python\">
        def greet(name):
            print(f"Hello, {name}!")
        </code></pre>

        And here's a JavaScript example:
        <pre><code class="javascript">
        function greet(name) {
            console.log(\`Hello, \${name}!\`);
        }
        </code></pre>
        
        Both examples demonstrate a simple greeting function.`,
      model: 'gpt-4'
    };

    render(
      <ChatMessage
        isNew={false}
        message={messageWithMultipleCodeBlocks}
        lastIndex={true}
        loading={false}
        fileSrc={[]}
        handleFileDelete={jest.fn()}
      />
    );

    const pythonCodeBlock = screen.getByText((content, element) => {
      return (
        element?.tagName.toLowerCase() === 'code' &&
        content.includes('def greet(name):')
      );
    });
    expect(pythonCodeBlock).toBeInTheDocument();
    expect(pythonCodeBlock.closest('code')).toHaveClass('python');

    const javascriptCodeBlock = screen.getByText((content, element) => {
      return (
        element?.tagName.toLowerCase() === 'code' &&
        content.includes('function greet(name)')
      );
    });
    expect(javascriptCodeBlock).toBeInTheDocument();
    expect(javascriptCodeBlock.closest('code')).toHaveClass('javascript');

    const textContent1 = screen.getByText(content =>
      content.includes("Here's a Python example:")
    );
    expect(textContent1).toBeInTheDocument();

    const textContent2 = screen.getByText(content =>
      content.includes('Both examples demonstrate a simple greeting function.')
    );
    expect(textContent2).toBeInTheDocument();
  });

  it('ChatMessage component snapshot', () => {
    const { asFragment } = render(
      <ChatMessage
        isNew={false}
        message={message}
        lastIndex={lastIndex}
        loading={loading}
        fileSrc={fileSrc}
        handleFileDelete={handleFileDelete}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
