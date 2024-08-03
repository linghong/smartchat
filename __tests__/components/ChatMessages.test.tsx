import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';

import ChatMessage from '@/src/components/ChatMessage';
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
  let imageSrc: ImageFile[];
  let handleImageDelete: jest.Mock;

  beforeEach(() => {
    message = {
      question: 'What is AI?',
      answer: 'AI stands for Artificial Intelligence.',
      model: 'gpt-4o'
    };
    loading = false;
    lastIndex = true;
    handleImageDelete = jest.fn();
    imageSrc = [
      {
        base64Image: '/path/to/image1.png',
        mimeType: 'image/png',
        size: 5000,
        name: 'image1'
      },
      {
        base64Image: 'path/to/image2.png',
        mimeType: 'image/png',
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
        imageSrc={imageSrc}
        handleImageDelete={handleImageDelete}
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
        imageSrc={imageSrc}
        handleImageDelete={handleImageDelete}
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
          imageSrc={imageSrc}
          handleImageDelete={handleImageDelete}
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
          imageSrc={imageSrc}
          handleImageDelete={handleImageDelete}
        />
      );
    });

    const botImage = screen.getByAltText('AI avatar');
    expect(botImage).not.toHaveClass('animate-pulse');
  });

  it('renders code blocks correctly', () => {
    const messageWithCode = {
      ...message,
      answer: 'Here\'s a code example:\n```python\nprint("Hello, World!")\n```'
    };
    render(
      <ChatMessage
        isNew={false}
        message={messageWithCode}
        lastIndex={lastIndex}
        loading={loading}
        imageSrc={imageSrc}
        handleImageDelete={handleImageDelete}
      />
    );
    expect(screen.getByText('Here\'s a code example:')).toBeInTheDocument();
    expect(screen.getByText('print("Hello, World!")')).toBeInTheDocument();
    const codeBlock = screen.getByText('print("Hello, World!")');
    expect(codeBlock.closest('pre')).toBeInTheDocument();
    expect(codeBlock.closest('code')).toHaveClass('language-python');
  });

  it('sanitizes and formats messages correctly', () => {
    const messageWithHtml = {
      ...message,
      question: 'Is <script>alert("XSS")</script> sanitized?',
      answer: 'Yes, it is <strong>sanitized</strong> and <code>formatted</code>.'
    };
    render(
      <ChatMessage
        isNew={false}
        message={messageWithHtml}
        lastIndex={lastIndex}
        loading={loading}
        imageSrc={imageSrc}
        handleImageDelete={handleImageDelete}
      />
    );
    expect(screen.queryByText('alert("XSS")')).not.toBeInTheDocument();
    expect(screen.getByText('Is <script>alert("XSS")</script> sanitized?')).toBeInTheDocument();
    expect(screen.getByText((content, element) => {
      return element?.tagName.toLowerCase() === 'strong' && content === 'sanitized';
    })).toBeInTheDocument();
    const codeElement = screen.getByText('formatted');
    expect(codeElement.tagName).toBe('CODE');
    expect(codeElement).toHaveClass('inline-code');
  });
  
  it('renders image thumbnails when imageSrc is provided', () => {
    render(
      <ChatMessage
        isNew={false}
        message={message}
        lastIndex={lastIndex}
        loading={loading}
        imageSrc={imageSrc}
        handleImageDelete={handleImageDelete}
      />
    );
    expect(screen.getByTitle('Uploaded image thumbnail 1')).toBeInTheDocument();
    expect(screen.getByTitle('Uploaded image thumbnail 2')).toBeInTheDocument();
  });

  it('does not render image thumbnails for new messages', () => {
    render(
      <ChatMessage
        isNew={true}
        message={message}
        lastIndex={lastIndex}
        loading={loading}
        imageSrc={imageSrc}
        handleImageDelete={handleImageDelete}
      />
    );
    expect(screen.queryByTitle('Uploaded image thumbnail 1')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Uploaded image thumbnail 2')).not.toBeInTheDocument();
  });

  it('ChatMessage component snapshot', () => {
    const { asFragment } = render(
      <ChatMessage
        isNew={false}
        message={message}
        lastIndex={lastIndex}
        loading={loading}
        imageSrc={imageSrc}
        handleImageDelete={handleImageDelete}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
