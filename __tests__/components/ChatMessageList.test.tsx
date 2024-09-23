import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';

import ChatMessageList, {
  ChatMessageListProps
} from '@/src/components/ChatMessageList';
import { FileData, AssistantOption } from '@/src/types/chat';
import { defaultAssistants } from '@/src/utils/initialData';
import {
  renderWithContext,
  defaultChatHistory
} from '@/__tests__/test_utils/context';

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
    handleRetry,
    handleFileDelete
  }: any) {
    return (
      <div data-testid={`chat-message`}>
        {!isNew && <div className="user">{message.question}</div>}
        <div className="ai">
          <div>{message.model}</div>
          {lastIndex && loading ? (
            <div aria-label="loading">Just a moment, I’m working on it...</div>
          ) : (
            <div>{message.answer}</div>
          )}
          {fileSrc &&
            fileSrc.map((file: FileData, i: number) => (
              <div key={i}>
                {file.name} ({file.type})
                <button onClick={() => handleFileDelete(i)}>Delete</button>
              </div>
            ))}
          {!isNew && lastIndex && (
            <div>
              {handleRetry && <button onClick={handleRetry}>Retry</button>}
              {handleCopy && message.answer !== '' && (
                <button onClick={handleCopy}>Copy</button>
              )}
              <select>
                {assistantOptions.map((assistant: AssistantOption) => (
                  <option
                    key={assistant.value}
                    onClick={() => handleAssistantChange(assistant)}
                  >
                    {assistant.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    );
  };
});

// Mock ResizeObserver
const mockResizeObserver = jest.fn(function MockResizeObserver(callback: any) {
  return {
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
  };
});

global.ResizeObserver = mockResizeObserver;

describe('ChatMessageList', () => {
  const mockHandleFileDelete = jest.fn();
  const mockHandleAssistantChange = jest.fn();
  const mockHandleRetry = jest.fn();
  const mockHandleCopy = jest.fn();

  const defaultProps: ChatMessageListProps = {
    loading: false,
    selectedAssistant: defaultAssistants[0],
    assistantOptions: defaultAssistants,
    handleAssistantChange: mockHandleAssistantChange,
    handleFileDelete: mockHandleFileDelete,
    handleRetry: mockHandleRetry,
    handleCopy: mockHandleCopy
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    // Mock scrollIntoView
    Element.prototype.scrollIntoView = jest.fn();
  });

  describe('render', () => {
    it('renders correct number of ChatMessage components', () => {
      renderWithContext(<ChatMessageList {...defaultProps} />);
      const chatMessages = screen.getAllByTestId('chat-message');
      expect(chatMessages).toHaveLength(2);
    });

    it('renders correctly with chat history', () => {
      renderWithContext(<ChatMessageList {...defaultProps} />);
      expect(screen.getByText('How are you?')).toBeInTheDocument();
      expect(
        screen.getByText("I'm doing well, thank you!")
      ).toBeInTheDocument();
    });

    it('renders correctly when loading', () => {
      renderWithContext(<ChatMessageList {...defaultProps} loading={true} />);
      expect(screen.getByLabelText('loading')).toBeInTheDocument();
    });

    it('indicates a new conversation', () => {
      const newChatMessageListContext = {
        chatHistory: [
          {
            question: '',
            answer: 'Hi, how can I assist you?',
            assistant: 'GPT-4 Assistant'
          }
        ],
        firSrcHistory: [[]]
      };
      renderWithContext(<ChatMessageList {...defaultProps} />, {
        ...newChatMessageListContext
      });

      expect(screen.getByText('Hi, how can I assist you?')).toBeInTheDocument();
      expect(screen.queryByTestId('chat-message')).not.toHaveTextContent('');
    });
  });

  describe('render and handle various mose event', () => {
    it('renders retry button for the last message', () => {
      renderWithContext(<ChatMessageList {...defaultProps} />);
      const retryButton = screen.getByText('Retry');
      expect(retryButton).toBeInTheDocument();
    });

    it('calls handleRetry when Retry button is clicked', () => {
      renderWithContext(<ChatMessageList {...defaultProps} />);
      const retryButton = screen.getByText('Retry');
      fireEvent.click(retryButton);
      expect(mockHandleRetry).toHaveBeenCalled();
    });

    it('renders copy button for the last message', () => {
      renderWithContext(<ChatMessageList {...defaultProps} />);
      const copyButton = screen.getByText('Copy');
      expect(copyButton).toBeInTheDocument();
    });

    it('calls handleCopy when Copy button is clicked', () => {
      renderWithContext(<ChatMessageList {...defaultProps} />);
      const copyButton = screen.getByText('Copy');
      fireEvent.click(copyButton);
      expect(mockHandleCopy).toHaveBeenCalled();
    });

    it('handles assistant change', () => {
      renderWithContext(<ChatMessageList {...defaultProps} />);
      const combobox = screen.getByRole('combobox');
      expect(combobox).toBeInTheDocument();
      expect(combobox).toHaveTextContent('Default Gemini-1.5 Pro Exp');

      // simulate the selection process
      fireEvent.click(combobox);
      const options = screen.getAllByRole('option');
      fireEvent.click(options[1]); // Select the second option

      expect(mockHandleAssistantChange).toHaveBeenCalledWith(
        defaultAssistants[1]
      );
    });
  });

  describe('render files and handle events', () => {
    it('handles file src history and delete', () => {
      const fileSrcHistory = [
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
      ];

      renderWithContext(<ChatMessageList {...defaultProps} />, {
        fileSrcHistory
      });

      expect(screen.getByText('test1.png (image/png)')).toBeInTheDocument();
      expect(screen.getByText('test2.jpg (image/jpeg)')).toBeInTheDocument();

      const deleteButtons = screen.getAllByText('Delete');
      expect(deleteButtons).toHaveLength(2);
      fireEvent.click(deleteButtons[0]);
      expect(mockHandleFileDelete).toHaveBeenCalledWith(0);
    });
  });

  describe('scroll to bottom message line', () => {
    it('scrolls to bottom when chat history changes', () => {
      const scrollIntoViewMock = jest.fn();
      Element.prototype.scrollIntoView = scrollIntoViewMock;

      const { rerender } = renderWithContext(
        <ChatMessageList {...defaultProps} />
      );

      expect(scrollIntoViewMock).toHaveBeenCalledTimes(1);

      // Simulate chat history update
      const chatHistory = [
        ...defaultChatHistory,
        {
          question: 'New question',
          answer: 'New answer',
          assistant: 'GPT-4 Assistant'
        }
      ];

      renderWithContext(<ChatMessageList {...defaultProps} />, { chatHistory });

      expect(scrollIntoViewMock).toHaveBeenCalledTimes(2);
    });

    it('sets up and cleans up ResizeObserver correctly', () => {
      const { unmount } = renderWithContext(
        <ChatMessageList {...defaultProps} />
      );

      expect(mockResizeObserver).toHaveBeenCalledTimes(1);
      expect(
        mockResizeObserver.mock.results[0].value.observe
      ).toHaveBeenCalledTimes(1);

      unmount();

      expect(
        mockResizeObserver.mock.results[0].value.disconnect
      ).toHaveBeenCalledTimes(1);
    });

    it('scrolls to bottom when content resizes and already at bottom', () => {
      const scrollIntoViewMock = jest.fn();
      Element.prototype.scrollIntoView = scrollIntoViewMock;

      renderWithContext(<ChatMessageList {...defaultProps} />);

      // Simulate resize event when scrolled to bottom
      act(() => {
        const resizeCallback = mockResizeObserver.mock.calls[0][0];
        const mockScrollContainer = {
          scrollHeight: 1000,
          clientHeight: 800,
          scrollTop: 200 // scrolled to bottom (1000 - 800 = 200)
        };
        Object.defineProperty(document.querySelector('div'), 'current', {
          value: mockScrollContainer,
          writable: true
        });
        resizeCallback([{ target: mockScrollContainer }]);
      });

      expect(scrollIntoViewMock).toHaveBeenCalledTimes(2); // Once on initial render, once after resize
    });

    it('scrolls to bottom when content resizes and already at bottom', () => {
      const scrollIntoViewMock = jest.fn();
      window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

      renderWithContext(<ChatMessageList {...defaultProps} />);

      // Simulate resize event when scrolled to bottom
      act(() => {
        const resizeCallback = (mockResizeObserver as any).mock.calls[0][0];
        const mockScrollContainer = {
          scrollHeight: 1000,
          clientHeight: 800,
          scrollTop: 200 // scrolled to bottom (1000 - 800 = 200)
        };
        Object.defineProperty(document.querySelector('div'), 'current', {
          value: mockScrollContainer,
          writable: true
        });
        resizeCallback([{ target: mockScrollContainer }]);
      });

      expect(scrollIntoViewMock).toHaveBeenCalledTimes(2); // Once on initial render, once after resize
    });

    it('does not scroll to bottom when content resizes and not at bottom', () => {
      const scrollIntoViewMock = jest.fn();
      window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

      renderWithContext(<ChatMessageList {...defaultProps} />);

      // Simulate resize event when not scrolled to bottom
      act(() => {
        const resizeCallback = (mockResizeObserver as any).mock.calls[0][0];
        const mockScrollContainer = {
          scrollHeight: 1000,
          clientHeight: 800,
          scrollTop: 100 // not scrolled to bottom
        };
        Object.defineProperty(document.querySelector('div'), 'current', {
          value: mockScrollContainer,
          writable: true
        });
        resizeCallback([{ target: mockScrollContainer }]);
      });

      expect(scrollIntoViewMock).toHaveBeenCalledTimes(2); // Only called on initial render
    });
  });

  it('matches snapshot', () => {
    const { asFragment } = renderWithContext(
      <ChatMessageList {...defaultProps} />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
