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
  let index: number;
  let message: Message;
  let loading: boolean;
  let lastIndex: boolean;
  let imageSrc: ImageFile[];
  let modelName: string;
  let handleImageDelete: jest.Mock;

  beforeEach(() => {
    message = {
      question: 'What is AI?',
      answer: 'AI stands for Artificial Intelligence.'
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
    modelName = 'gpt-4o';

    render(
      <ChatMessage
        index={index}
        message={message}
        lastIndex={lastIndex}
        loading={loading}
        imageSrc={imageSrc}
        modelName={modelName}
        handleImageDelete={handleImageDelete}
      />
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders ChatMessage component correctly with question and answer', () => {
    expect(screen.getByText('What is AI?')).toBeInTheDocument();
    expect(
      screen.getByText('AI stands for Artificial Intelligence.')
    ).toBeInTheDocument();
  });

  it('renders the user and AI avatars', () => {
    expect(screen.getByAltText('User avatar')).toBeInTheDocument();
    expect(screen.getByAltText('AI avatar')).toBeInTheDocument();
  });

  it('applies animate-pulse class when loading and is the last index', () => {
    act(() => {
      render(
        <ChatMessage
          index={index}
          message={message}
          lastIndex={true}
          loading={true}
          imageSrc={imageSrc}
          modelName={modelName}
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
          index={index}
          message={message}
          lastIndex={true}
          loading={false}
          imageSrc={imageSrc}
          modelName={modelName}
          handleImageDelete={handleImageDelete}
        />
      );
    });

    const botImages = screen.getAllByAltText('AI avatar') as HTMLElement[];
    expect(botImages[botImages.length - 1]).not.toHaveClass('animate-pulse');
  });

  it('ChatMessage component snapshot', () => {
    const { asFragment } = render(
      <ChatMessage
        index={index}
        message={message}
        lastIndex={lastIndex}
        loading={loading}
        imageSrc={imageSrc}
        modelName={modelName}
        handleImageDelete={handleImageDelete}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
