import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatMessageList from '@/src/components/ChatMessageList';
import { Message, FileData } from '@/src/types/chat';

jest.mock('@/src/components/ChatMessage', () => {
  return function MockChatMessage({
    message,
    isNew,
    lastIndex,
    loading,
    fileSrc
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
          {fileSrc &&
            fileSrc.map((file: FileData, i: number) => (
              <div key={i}>
                {file.name} ({file.type})
              </div>
            ))}
        </div>
      </div>
    );
  };
});

describe('ChatMessageList', () => {
  const mockHandleFileDelete = jest.fn();
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
    fileSrcHistory: [[], []],
    handleFileDelete: mockHandleFileDelete
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

  it('handles file src history', () => {
    const customProps = {
      ...defaultProps,
      fileSrcHistory: [
        [
          {
            file: new File([''], 'test1.png', { type: 'image/png' }),
            type: 'image/png',
            name: 'test1.png'
          }
        ],
        [
          {
            file: new File([''], 'test2.jpg', { type: 'image/jpeg' }),
            type: 'image/jpeg',
            name: 'test2.jpg'
          }
        ]
      ] as FileData[][]
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

    expect(screen.getByText('Hi, how can I assist you?')).toBeInTheDocument();
    expect(screen.queryByTestId('chat-message')).not.toHaveTextContent('');
  });

  it('matches snapshot', () => {
    const { asFragment } = render(<ChatMessageList {...defaultProps} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
