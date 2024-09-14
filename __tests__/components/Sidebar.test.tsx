import React from 'react';
import {
  render,
  screen,
  waitFor,
  act,
  fireEvent
} from '@testing-library/react';
import '@testing-library/jest-dom';

import Sidebar from '@/src/components/Sidebar';
import { fetchChats } from '@/src/utils/sqliteChatApiClient';
import {
  deleteChat,
  editChatTitle,
  fetchChatMessages
} from '@/src/utils/sqliteChatIdApiClient';
import { OptionType, FileData, Message } from '@/src/types/chat';

// Mock the MenuItem component
jest.mock('@/src/components/MenuItem', () => {
  return function MockMenuItem({
    title,
    itemList,
    link,
    defaultOpen,
    onItemClick,
    activeItemId,
    onDeleteClick,
    onEditClick,
    setIsSidebarOpen
  }: {
    title: string;
    itemList: OptionType[];
    link: string;
    defaultOpen: boolean;
    onItemClick?: (id: string) => void;
    activeItemId?: string;
    onDeleteClick?: (id: string) => void;
    onEditClick?: (id: string, newTitle: string) => void;
    setIsSidebarOpen?: (isOpen: boolean) => void;
  }) {
    return (
      <div>
        <a href={link}>
          <h2>{title}</h2>
        </a>
        <ul>
          {defaultOpen &&
            itemList?.map(item => (
              <li
                key={item.value}
                onClick={() => {
                  onItemClick && onItemClick(item.value);
                  setIsSidebarOpen && setIsSidebarOpen(false);
                }}
                data-active={item.value === activeItemId}
              >
                {item.label}
                {onDeleteClick && (
                  <button onClick={() => onDeleteClick(item.value)}>
                    Delete
                  </button>
                )}
                {onEditClick && (
                  <button onClick={() => onEditClick(item.value, 'New Title')}>
                    Edit
                  </button>
                )}
              </li>
            ))}
        </ul>
      </div>
    );
  };
});

// Mock the AIHub component
jest.mock('@/src/components/AIHub', () => {
  return function MockAIHub() {
    return <div>AI Hub</div>;
  };
});

jest.mock('@/src/utils/sqliteChatApiClient', () => ({
  fetchChats: jest.fn()
}));

jest.mock('@/src/utils/sqliteChatIdApiClient', () => ({
  deleteChat: jest.fn(),
  editChatTitle: jest.fn(),
  fetchChatMessages: jest.fn()
}));

const mockPush = jest.fn();
jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/',
    push: mockPush
  })
}));

const mockSetIsConfigPanelVisible = jest.fn();
const mockSetIsSidebarOpen = jest.fn();
const mockSetChatId = jest.fn();
const mockSetChats = jest.fn();
const mockSetChatHistory = jest.fn();
const mockSetFileSrcHistory = jest.fn();

const mockNamespacesList: OptionType[] = [
  { label: 'Namespace 1', value: 'ns1' },
  { label: 'Namespace 2', value: 'ns2' }
];

const mockChats: OptionType[] = [
  { value: '1', label: 'Test Chat 1' },
  { value: '2', label: 'Test Chat 2' }
];

describe('Sidebar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetchChats as jest.Mock).mockResolvedValue(mockChats);
    (fetchChatMessages as jest.Mock).mockResolvedValue([
      {
        userMessage: 'Hello',
        aiMessage: 'Hi there',
        assistant: { label: 'Assistant 1' },
        files: []
      }
    ]);

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'mock-token'),
        setItem: jest.fn(),
        removeItem: jest.fn()
      },
      writable: true
    });

    // Mock window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 1024
    });
  });

  const renderSidebar = (chatId = '0') =>
    render(
      <Sidebar
        isSidebarOpen={true}
        setIsConfigPanelVisible={mockSetIsConfigPanelVisible}
        setIsSidebarOpen={mockSetIsSidebarOpen}
        namespacesList={mockNamespacesList}
        chatId={chatId}
        setChatId={mockSetChatId}
        chats={mockChats}
        setChats={mockSetChats}
        setChatHistory={mockSetChatHistory}
        setFileSrcHistory={mockSetFileSrcHistory}
      />
    );

  it('renders Sidebar component with all expected elements', async () => {
    await act(async () => {
      renderSidebar();
    });

    expect(screen.getByText('Embed RAG File')).toBeInTheDocument();
    expect(screen.getByText('Finetune AI Model')).toBeInTheDocument();
    expect(screen.getByText('Chat With AI')).toBeInTheDocument();
    expect(screen.getByText('AI Hub')).toBeInTheDocument();
  });

  it('handles fetch error gracefully', async () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    (fetchChats as jest.Mock).mockRejectedValue(new Error('Fetch failed'));

    await act(async () => {
      renderSidebar();
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to fetch chats')
      );
    });

    consoleSpy.mockRestore();
  });

  it('fetches and renders chats on mount', async () => {
    await act(async () => {
      renderSidebar();
    });

    await waitFor(() => {
      expect(fetchChats).toHaveBeenCalled();
    });

    expect(screen.getByText('Test Chat 1')).toBeInTheDocument();
    expect(screen.getByText('Test Chat 2')).toBeInTheDocument();
  });

  it('handles chat click correctly', async () => {
    await act(async () => {
      renderSidebar();
    });

    await waitFor(() => {
      expect(screen.getByText('Test Chat 1')).toBeInTheDocument();
    });

    const chatItem = screen.getByText('Test Chat 1');
    await act(async () => {
      fireEvent.click(chatItem);
    });

    expect(fetchChatMessages).toHaveBeenCalledWith('mock-token', 1);
    expect(mockSetIsConfigPanelVisible).toHaveBeenCalledWith(false);
    expect(mockSetChatHistory).toHaveBeenCalled();
    expect(mockSetFileSrcHistory).toHaveBeenCalled();
    expect(mockSetChatId).toHaveBeenCalledWith('1');
    expect(mockSetIsSidebarOpen).toHaveBeenCalledWith(false);
  });

  it('handles chat deletion correctly', async () => {
    await act(async () => {
      renderSidebar('1');
    });

    const deleteButton = screen.getAllByText('Delete')[0];
    await act(async () => {
      fireEvent.click(deleteButton);
    });

    expect(deleteChat).toHaveBeenCalledWith('mock-token', '1');
    expect(mockSetChats).toHaveBeenCalled();
    expect(mockSetChatId).toHaveBeenCalledWith('');
    expect(mockSetChatHistory).toHaveBeenCalled();
    expect(mockSetFileSrcHistory).toHaveBeenCalled();
  });

  it('handles chat editing correctly', async () => {
    await act(async () => {
      renderSidebar();
    });

    const editButton = screen.getAllByText('Edit')[0];
    await act(async () => {
      fireEvent.click(editButton);
    });

    expect(editChatTitle).toHaveBeenCalledWith('mock-token', '1', 'New Title');
    expect(mockSetChats).toHaveBeenCalled();
  });

  it('handles empty chat messages correctly', async () => {
    (fetchChatMessages as jest.Mock).mockResolvedValue([]);

    await act(async () => {
      renderSidebar();
    });

    const chatItem = await screen.findByText('Test Chat 1');
    await act(async () => {
      fireEvent.click(chatItem);
    });

    expect(mockSetChatHistory).toHaveBeenCalledWith([
      {
        question: '',
        answer: 'Hi, how can I assist you?',
        assistant: 'Default Gemini-1.5 Pro Exp'
      }
    ]);
    expect(mockSetFileSrcHistory).toHaveBeenCalledWith([[]]);
  });

  it('handles chat messages with files correctly', async () => {
    const mockFileData: FileData = {
      base64Content: 'base64content',
      type: 'image/jpeg',
      size: 1024,
      name: 'test.jpg',
      width: 100,
      height: 100
    };

    (fetchChatMessages as jest.Mock).mockResolvedValue([
      {
        userMessage: 'Hello',
        aiMessage: 'Hi there',
        assistant: { label: 'Assistant 1' },
        files: [{ fileData: mockFileData }, { fileData: mockFileData }]
      }
    ]);

    await act(async () => {
      renderSidebar();
    });

    const chatItem = await screen.findByText('Test Chat 1');
    await act(async () => {
      fireEvent.click(chatItem);
    });

    expect(mockSetFileSrcHistory).toHaveBeenCalledWith([
      [mockFileData, mockFileData]
    ]);
  });

  it('handles mobile view correctly', async () => {
    window.innerWidth = 600;

    await act(async () => {
      renderSidebar();
    });

    const chatItem = await screen.findByText('Test Chat 1');
    await act(async () => {
      fireEvent.click(chatItem);
    });

    expect(mockSetIsSidebarOpen).toHaveBeenCalledWith(false);
  });

  it('matches snapshot', async () => {
    let asFragment: (() => DocumentFragment) | undefined;

    await act(async () => {
      const result = renderSidebar();
      asFragment = result.asFragment;
    });

    if (asFragment) {
      expect(asFragment()).toMatchSnapshot();
    } else {
      throw new Error('asFragment was not assigned');
    }
  });
});
