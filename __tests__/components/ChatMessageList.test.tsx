import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatMessageList from '@/src/components/ChatMessageList';
import { ImageFile } from '@/src/types/chat';
import { OptionType } from '@/src/types/common';

// Mock the ChatMessage component
jest.mock('@/src/components/ChatMessage', () => {
  return function MockChatMessage({
    message,
    index,
    loading,
    imageSrc,
    modelName
  }: any) {
    return (
      <div data-testid={`chat-message-${index}`}>
        <div>{message.question}</div>
        <div>
          {loading && <div data-testid="loading-indicator">Loading...</div>}
          <div>{modelName}</div>
          <div>{message.answer}</div>
          {imageSrc &&
            imageSrc.map((img: ImageFile, i: number) => (
              <div key={i}>
                {img.name} ({img.mimeType})
              </div>
            ))}
        </div>
      </div>
    );
  };
});

describe('ChatMessageList', () => {
  const mockHandleImageDelete = jest.fn();
  const defaultProps = {
    chatHistory: [
      { question: 'Hello', answer: '' },
      { question: '', answer: 'Hi there!' }
    ],
    loading: false,
    imageSrcHistory: [[], []],
    selectedModel: {
      value: 'gpt-4',
      label: 'GPT-4',
      contextWindow: 8192,
      vision: true
    } as OptionType,
    handleImageDelete: mockHandleImageDelete
  };

  it('renders correct number of ChatMessage components', () => {
    render(<ChatMessageList {...defaultProps} />);
    const chatMessages = screen.getAllByTestId(/chat-message-/);
    expect(chatMessages).toHaveLength(2);
  });

  it('renders correctly with chat history', () => {
    render(<ChatMessageList {...defaultProps} />);

    expect(screen.getByTestId('chat-message-0')).toHaveTextContent('Hello');
    expect(screen.getByTestId('chat-message-1')).toHaveTextContent('Hi there!');
  });

  it('renders correctly when loading', () => {
    render(<ChatMessageList {...defaultProps} loading={true} />);

    expect(screen.getByTestId('chat-message-0')).toBeInTheDocument();
    expect(screen.getByTestId('chat-message-1')).toBeInTheDocument();
  });

  it('renders correctly with empty chat history', () => {
    render(<ChatMessageList {...defaultProps} chatHistory={[]} />);

    expect(screen.queryByTestId('chat-message-0')).not.toBeInTheDocument();
  });

  it('handles different selected models', () => {
    const customProps = {
      ...defaultProps,
      selectedModel: {
        value: 'gpt-3.5-turbo',
        label: 'GPT-3.5 Turbo',
        contextWindow: 4096,
        vision: false
      } as OptionType
    };
    render(<ChatMessageList {...customProps} />);

    expect(screen.getByTestId('chat-message-0')).toBeInTheDocument();
    expect(screen.getByTestId('chat-message-1')).toBeInTheDocument();
  });

  it('handles image src history', () => {
    const customProps = {
      ...defaultProps,
      imageSrcHistory: [
        [
          {
            base64Image: 'data:image/png;base64,abc123',
            mimeType: 'image/png',
            size: 1000,
            name: 'test1.png'
          }
        ],
        [
          {
            base64Image: 'data:image/jpeg;base64,def456',
            mimeType: 'image/jpeg',
            size: 2000,
            name: 'test2.jpg'
          }
        ]
      ] as ImageFile[][]
    };
    render(<ChatMessageList {...customProps} />);

    expect(screen.getByTestId('chat-message-0')).toBeInTheDocument();
    expect(screen.getByTestId('chat-message-1')).toBeInTheDocument();
  });

  it('does not automatically scroll when chat history updates', () => {
    const { rerender, container } = render(
      <ChatMessageList {...defaultProps} />
    );

    const messagesContainer = container.firstChild as HTMLElement;
    const initialScrollTop = messagesContainer.scrollTop;

    const updatedProps = {
      ...defaultProps,
      chatHistory: [
        ...defaultProps.chatHistory,
        { question: 'New message', answer: '' }
      ]
    };

    rerender(<ChatMessageList {...updatedProps} />);

    // Check that scrollTop hasn't changed
    expect(messagesContainer.scrollTop).toBe(initialScrollTop);

    // But the new message should be rendered
    expect(screen.getAllByTestId(/chat-message-/)).toHaveLength(3);
  });

  it('matches snapshot with chat history', () => {
    const { asFragment } = render(<ChatMessageList {...defaultProps} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('matches snapshot when loading', () => {
    const { asFragment } = render(
      <ChatMessageList {...defaultProps} loading={true} />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('matches snapshot with empty chat history', () => {
    const { asFragment } = render(
      <ChatMessageList {...defaultProps} chatHistory={[]} />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
