import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';

import { modelOptions } from '@/config/modellist';
import ChatMessageList from '@/src/components/ChatMessageList';
import { Message, FileData, AssistantOption } from '@/src/types/chat';
import { OptionType } from '@/src/types/common';
import { defaultAssistants } from '@/src/utils/initialData';
import { getAIConfigs } from '@/src/utils/sqliteAIConfigApiClient';

jest.mock('@/src/utils/sqliteAIConfigApiClient', () => ({
  getAIConfigs: jest.fn()
}));

jest.mock('@/src/components/ChatMessage', () => {
  return function MockChatMessage({
    message,
    isNew,
    lastIndex,
    loading,
    fileSrc,
    selectedAssistant,
    handleAssistantChange,
    assistantOptions,
    handleCopy,
    handleRetry
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
          {!isNew && lastIndex && (
            <div>
              {handleRetry && <button onClick={handleRetry}>Retry</button>}
              {handleCopy && message.answer !== '' && (
                <button onClick={handleCopy}>Copy</button>
              )}
              {
                <select>
                  {assistantOptions.map((assistant: AssistantOption) => (
                    <option
                      key={assistant.value}
                      onClick={handleAssistantChange}
                    >
                      {assistant.label}
                    </option>
                  ))}
                </select>
              }
            </div>
          )}
        </div>
      </div>
    );
  };
});

describe('ChatMessageList', () => {
  const mockHandleFileDelete = jest.fn();
  const mockHandleAssistantChange = jest.fn();
  const mockHandleRetry = jest.fn();
  const mockHandleCopy = jest.fn();
  const defaultProps = {
    chatHistory: [
      {
        question: 'Hello',
        answer: 'Hi, how can I assist you?',
        assistant: 'Default GPT-4'
      },
      {
        question: 'How are you?',
        answer: "I'm doing well, thank you!",
        model: 'GPT-4'
      }
    ] as Message[],
    loading: false,
    fileSrcHistory: [[]],
    selectedAssistant: defaultAssistants[0],
    modelOptions,
    handleAssistantChange: mockHandleAssistantChange,
    handleFileDelete: mockHandleFileDelete,
    handleRetry: mockHandleRetry,
    handleCopy: mockHandleCopy
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

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
            base64Content: 'data:image/png;base64,base64Imagetest1',
            type: 'image/png',
            size: 2 * 1024 * 1024, //2MB
            name: 'test1.png'
          }
        ],
        [
          {
            base64Content: 'data:image/png;base64,base64Imagetest2',
            type: 'image/jpeg',
            size: 2 * 1024 * 1024, //2MB
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
        {
          question: '',
          answer: 'Hi, how can I assist you?',
          assistant: 'GPT-4 Assistant'
        }
      ]
    };
    render(<ChatMessageList {...newConversationProps} />);

    expect(screen.getByText('Hi, how can I assist you?')).toBeInTheDocument();
    expect(screen.queryByTestId('chat-message')).not.toHaveTextContent('');
  });

  it('renders retry button for the last message', () => {
    render(<ChatMessageList {...defaultProps} />);
    const retryButtons = screen.getAllByText('Retry');
    expect(retryButtons).toHaveLength(1);
  });

  it('renders copy button for all messages', () => {
    render(<ChatMessageList {...defaultProps} />);
    const copyButtons = screen.getAllByText('Copy');
    expect(copyButtons).toHaveLength(1);
  });

  it('fetches AI configs when token is available', async () => {
    localStorage.setItem('token', 'test-token');
    const mockAIConfigs = [
      { id: 1, name: 'Custom AI 1' },
      { id: 2, name: 'Custom AI 2' }
    ];
    (getAIConfigs as jest.Mock).mockResolvedValue(mockAIConfigs);

    await act(async () => {
      render(<ChatMessageList {...defaultProps} />);
    });

    await waitFor(() => {
      expect(getAIConfigs).toHaveBeenCalledWith('test-token');
    });
  });

  it('does not fetch AI configs when token is not available', async () => {
    localStorage.removeItem('token');

    await act(async () => {
      render(<ChatMessageList {...defaultProps} />);
    });

    expect(getAIConfigs).not.toHaveBeenCalled();
  });

  it('calls handleAssistantChange with first assistant when no assistant is selected', async () => {
    localStorage.setItem('token', 'test-token');
    const mockAIConfigs = [
      { id: 1, name: 'Custom AI 1' },
      { id: 2, name: 'Custom AI 2' }
    ];
    (getAIConfigs as jest.Mock).mockResolvedValue(mockAIConfigs);

    const propsWithoutSelectedAssistant = {
      ...defaultProps,
      selectedAssistant: null
    };

    await act(async () => {
      render(<ChatMessageList {...propsWithoutSelectedAssistant} />);
    });

    await waitFor(() => {
      expect(mockHandleAssistantChange).toHaveBeenCalledWith(
        defaultAssistants[0]
      );
    });
  });

  it('matches snapshot', () => {
    const { asFragment } = render(<ChatMessageList {...defaultProps} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
