import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatMessageList from '@/src/components/ChatMessageList';
import { Message, ImageFile } from '@/src/types/chat';

jest.mock('@/src/components/ChatMessage', () => {
  return function MockChatMessage({
    message,
    isNew,
    lastIndex,
    loading,
    imageSrc
  }: any) {
    return (
      <div data-testid={`chat-message`}>
        {!isNew && <div className="user">{message.question}</div>}
        <div className="ai">
          {loading && lastIndex && (
            <div data-testid="loading-indicator">Loading...</div>
          )}
          <div>{message.model}</div>
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
      {
        question: 'Hello',
        answer: 'Hi, how can I assist you?',
        model: 'GPT-4'
      },
      {
        question: 'How are you?',
        answer: "I'm doing well, thank you!",
        model: 'GPT-4'
      }
    ] as Message[],
    loading: false,
    imageSrcHistory: [[], []],
    handleImageDelete: mockHandleImageDelete
  };

  it('renders correct number of ChatMessage components', () => {
    render(<ChatMessageList {...defaultProps} />);
    const chatMessages = screen.getAllByTestId('chat-message');
    expect(chatMessages).toHaveLength(2);
  });

  it('renders correctly with chat history', () => {
    render(<ChatMessageList {...defaultProps} />);
    expect(screen.getByText('How are you?')).toBeInTheDocument();
    expect(screen.getByText("I'm doing well, thank you!")).toBeInTheDocument();
  });

  it('renders correctly when loading', () => {
    render(<ChatMessageList {...defaultProps} loading={true} />);
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
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
    expect(screen.getByText('test1.png (image/png)')).toBeInTheDocument();
    expect(screen.getByText('test2.jpg (image/jpeg)')).toBeInTheDocument();
  });

  it('indicates a new conversation', () => {
    const newConversationProps = {
      ...defaultProps,
      chatHistory: [
        { question: '', answer: 'Hi, how can I assist you?', model: 'GPT-4' }
      ]
    };
    render(<ChatMessageList {...newConversationProps} />);

    expect(screen.getByText('Hi, how can I assist you?')).toBeInTheDocument(); // The question should not be rendered for a new conversation
  });

  it('matches snapshot', () => {
    const { asFragment } = render(<ChatMessageList {...defaultProps} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
