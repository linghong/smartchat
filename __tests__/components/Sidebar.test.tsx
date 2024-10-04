import React from 'react';
import { screen, waitFor, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import Sidebar from '@/src/components/Sidebar';
import { fetchChats } from '@/src/utils/sqliteChatApiClient';
import {
  deleteChat,
  updateChat,
  fetchChatMessages
} from '@/src/utils/sqliteChatIdApiClient';
import { FileData } from '@/src/types/chat';
import { OptionType } from '@/src/types/common';
import { initialMessage } from '@/src/utils/initialData';
import { renderWithContext } from '@/__tests__/test_utils/context';
import { assistantGemini } from '@/__tests__/test_utils/chat';

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
                  <button
                    onClick={() => onDeleteClick(item.value)}
                    aria-label={`Delete ${item.label}`}
                  >
                    Delete
                  </button>
                )}
                {onEditClick && (
                  <button
                    onClick={() => onEditClick(item.value, 'New Title')}
                    aria-label={`Edit ${item.label}`}
                  >
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

jest.mock('@/src/utils/sqliteChatApiClient', () => ({
  fetchChats: jest.fn()
}));

jest.mock('@/src/utils/sqliteChatIdApiClient', () => ({
  deleteChat: jest.fn(),
  updateChat: jest.fn(),
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
const mockSetIsSearchChat = jest.fn();
const mockSetIsSidebarOpen = jest.fn();
const mockSetActiveChat = jest.fn();
const mockSetChats = jest.fn();
const mockSetChatHistory = jest.fn();
const mockSetFileSrcHistory = jest.fn();

const mockNamespacesList: OptionType[] = [
  { label: 'Namespace 1', value: 'ns1' },
  { label: 'Namespace 2', value: 'ns2' }
];

const mockChats: OptionType[] = [
  { value: '1', label: 'Chat 1', tags: ['tag1'] },
  { value: '2', label: 'Chat 2', tags: ['tag2'] }
];

describe('Sidebar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetchChats as jest.Mock).mockResolvedValue(mockChats);
    (fetchChatMessages as jest.Mock).mockResolvedValue([
      {
        userMessage: 'Hello',
        aiMessage: 'Hi there',
        assistant: assistantGemini,
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

  it('renders Sidebar component with all expected elements', async () => {
    renderWithContext(
      <Sidebar
        isSidebarOpen={true}
        setIsSidebarOpen={mockSetIsSidebarOpen}
        namespacesList={mockNamespacesList}
      />,
      { chats: mockChats, activeChat: mockChats[0] }
    );

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

    renderWithContext(
      <Sidebar
        isSidebarOpen={true}
        setIsSidebarOpen={mockSetIsSidebarOpen}
        namespacesList={mockNamespacesList}
      />,
      { chats: mockChats, activeChat: mockChats[0] }
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to fetch chats')
      );
    });

    consoleSpy.mockRestore();
  });

  it('fetches and renders chats on mount', async () => {
    renderWithContext(
      <Sidebar
        isSidebarOpen={true}
        setIsSidebarOpen={mockSetIsSidebarOpen}
        namespacesList={mockNamespacesList}
      />,
      { chats: mockChats, activeChat: mockChats[0] }
    );

    await waitFor(() => {
      expect(fetchChats).toHaveBeenCalled();
    });

    expect(screen.getByText('Chat 1')).toBeInTheDocument();
    expect(screen.getByText('Chat 2')).toBeInTheDocument();
  });

  it('handles chat click correctly', async () => {
    renderWithContext(
      <Sidebar
        isSidebarOpen={true}
        setIsSidebarOpen={mockSetIsSidebarOpen}
        namespacesList={mockNamespacesList}
      />,
      {
        chats: mockChats,
        activeChat: mockChats[0],
        setIsConfigPanelVisible: mockSetIsConfigPanelVisible,
        setIsSearchChat: mockSetIsSearchChat,
        setActiveChat: mockSetActiveChat,
        setChatHistory: mockSetChatHistory,
        setFileSrcHistory: mockSetFileSrcHistory
      }
    );

    await waitFor(() => {
      expect(screen.getByText('Chat 1')).toBeInTheDocument();
    });

    const chatItem = screen.getByText('Chat 1');
    await act(async () => {
      fireEvent.click(chatItem);
    });

    expect(fetchChatMessages).toHaveBeenCalledWith('mock-token', 1);
    expect(mockSetIsConfigPanelVisible).toHaveBeenCalledWith(false);
    expect(mockSetIsSearchChat).toHaveBeenCalledWith(false);
    expect(mockSetChatHistory).toHaveBeenCalled();
    expect(mockSetFileSrcHistory).toHaveBeenCalled();
    expect(mockSetActiveChat).toHaveBeenCalledWith(mockChats[0]);
    expect(mockSetIsSidebarOpen).toHaveBeenCalledWith(false);
  });

  it('redirects to login if token is missing in handleChatClick', async () => {
    window.localStorage.getItem = jest.fn(() => null); // Simulate no token
    const pushSpy = jest.spyOn(require('next/router').useRouter(), 'push');

    renderWithContext(
      <Sidebar
        isSidebarOpen={true}
        setIsSidebarOpen={mockSetIsSidebarOpen}
        namespacesList={mockNamespacesList}
      />,
      {
        chats: mockChats,
        activeChat: mockChats[0]
      }
    );

    const chatItem = await screen.findByText('Chat 1');
    await act(async () => {
      fireEvent.click(chatItem);
    });

    expect(pushSpy).toHaveBeenCalledWith('/login');
  });

  it('redirects to login if token is missing in handleDeleteChat', async () => {
    window.localStorage.getItem = jest.fn(() => null);
    const pushSpy = jest.spyOn(require('next/router').useRouter(), 'push');

    renderWithContext(
      <Sidebar
        isSidebarOpen={true}
        setIsSidebarOpen={mockSetIsSidebarOpen}
        namespacesList={mockNamespacesList}
      />,
      {
        chats: mockChats,
        activeChat: mockChats[0]
      }
    );

    const deleteButton = screen.getAllByLabelText('Delete Chat 1')[0];
    await act(async () => {
      fireEvent.click(deleteButton);
    });

    expect(pushSpy).toHaveBeenCalledWith('/login');
  });

  it('handles chat deletion correctly', async () => {
    renderWithContext(
      <Sidebar
        isSidebarOpen={true}
        setIsSidebarOpen={mockSetIsSidebarOpen}
        namespacesList={mockNamespacesList}
      />,
      {
        chats: mockChats,
        activeChat: mockChats[0],
        setChats: mockSetChats,
        setActiveChat: mockSetActiveChat,
        setChatHistory: mockSetChatHistory,
        setFileSrcHistory: mockSetFileSrcHistory
      }
    );

    const deleteButton = screen.getAllByText('Delete')[0];
    await act(async () => {
      fireEvent.click(deleteButton);
    });

    expect(deleteChat).toHaveBeenCalledWith('mock-token', '1');
    expect(mockSetChats).toHaveBeenCalled();
    expect(mockSetActiveChat).toHaveBeenCalledWith({
      label: '0',
      value: '0',
      tags: []
    });
    expect(mockSetChatHistory).toHaveBeenCalled();
    expect(mockSetFileSrcHistory).toHaveBeenCalled();
  });

  it('handles chat editing correctly', async () => {
    let capturedChats: OptionType[] = [];
    const mockSetChats = jest.fn(
      (
        newChatsOrUpdater:
          | OptionType[]
          | ((prevChats: OptionType[]) => OptionType[])
      ) => {
        if (typeof newChatsOrUpdater === 'function') {
          capturedChats = newChatsOrUpdater(mockChats);
        } else {
          capturedChats = newChatsOrUpdater;
        }
      }
    );

    await act(async () => {
      renderWithContext(
        <Sidebar
          isSidebarOpen={true}
          setIsSidebarOpen={mockSetIsSidebarOpen}
          namespacesList={mockNamespacesList}
        />,
        {
          chats: mockChats,
          activeChat: mockChats[0],
          setActiveChat: mockSetActiveChat,
          setChats: mockSetChats
        }
      );
    });

    const editButton = screen.getAllByText('Edit')[0];
    await act(async () => {
      fireEvent.click(editButton);
    });

    expect(updateChat).toHaveBeenCalledWith('mock-token', '1', {
      title: 'New Title'
    });
    expect(mockSetChats).toHaveBeenCalled();

    // Check if the chat was updated correctly
    const updatedChat = capturedChats.find(chat => chat.value === '1');
    expect(updatedChat).toBeDefined();
    expect(updatedChat?.label).toBe('New Title');
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
        files: [{ fileData: mockFileData }]
      }
    ]);

    renderWithContext(
      <Sidebar
        isSidebarOpen={true}
        setIsSidebarOpen={mockSetIsSidebarOpen}
        namespacesList={mockNamespacesList}
      />,
      {
        chats: mockChats,
        activeChat: mockChats[0],
        setActiveChat: mockSetActiveChat,
        setFileSrcHistory: mockSetFileSrcHistory
      }
    );

    const chatItem = await screen.findByText('Chat 1');
    await act(async () => {
      fireEvent.click(chatItem);
    });

    expect(mockSetFileSrcHistory).toHaveBeenCalledWith([[mockFileData]]);
  });

  it('handles mobile view correctly', async () => {
    window.innerWidth = 600;

    renderWithContext(
      <Sidebar
        isSidebarOpen={true}
        setIsSidebarOpen={mockSetIsSidebarOpen}
        namespacesList={mockNamespacesList}
      />,
      {
        chats: mockChats,
        activeChat: mockChats[0],
        setActiveChat: mockSetActiveChat
      }
    );

    const chatItem = await screen.findByText('Chat 1');
    await act(async () => {
      fireEvent.click(chatItem);
    });

    expect(mockSetIsSidebarOpen).toHaveBeenCalledWith(false);
  });

  it('handles empty chat messages by resetting to default values', async () => {
    (fetchChatMessages as jest.Mock).mockResolvedValue([]); // Simulate empty chat messages

    renderWithContext(
      <Sidebar
        isSidebarOpen={true}
        setIsSidebarOpen={mockSetIsSidebarOpen}
        namespacesList={mockNamespacesList}
      />,
      {
        chats: mockChats,
        activeChat: mockChats[0],
        setActiveChat: mockSetActiveChat,
        setChatHistory: mockSetChatHistory,
        setFileSrcHistory: mockSetFileSrcHistory
      }
    );

    const chatItem = await screen.findByText('Chat 1');
    await act(async () => {
      fireEvent.click(chatItem);
    });

    expect(mockSetActiveChat).toHaveBeenCalledWith({
      label: '0',
      value: '0',
      tags: []
    });
    expect(mockSetChatHistory).toHaveBeenCalledWith([initialMessage]);
    expect(mockSetFileSrcHistory).toHaveBeenCalledWith([[]]);
  });

  it('logs an error when deleteChat fails', async () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    (deleteChat as jest.Mock).mockRejectedValue(new Error('Delete failed'));

    renderWithContext(
      <Sidebar
        isSidebarOpen={true}
        setIsSidebarOpen={mockSetIsSidebarOpen}
        namespacesList={mockNamespacesList}
      />,
      {
        chats: mockChats,
        activeChat: mockChats[0],
        setActiveChat: mockSetActiveChat
      }
    );

    const deleteButton = screen.getAllByLabelText('Delete Chat 1')[0];
    await act(async () => {
      fireEvent.click(deleteButton);
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to delete chat: Delete failed'
    );
    consoleSpy.mockRestore();
  });

  it('does not fetch chats when token is missing in useEffect', () => {
    window.localStorage.getItem = jest.fn(() => null); // Simulate no token

    renderWithContext(
      <Sidebar
        isSidebarOpen={true}
        setIsSidebarOpen={mockSetIsSidebarOpen}
        namespacesList={mockNamespacesList}
      />,
      { chats: mockChats, activeChat: mockChats[0] }
    );

    expect(fetchChats).not.toHaveBeenCalled();
  });

  it('matches snapshot', async () => {
    let asFragment: (() => DocumentFragment) | undefined;

    const result = renderWithContext(
      <Sidebar
        isSidebarOpen={true}
        setIsSidebarOpen={mockSetIsSidebarOpen}
        namespacesList={mockNamespacesList}
      />,
      {
        chats: mockChats,
        activeChat: mockChats[0],
        setActiveChat: mockSetActiveChat
      }
    );
    asFragment = result.asFragment;

    if (asFragment) {
      expect(asFragment()).toMatchSnapshot();
    } else {
      throw new Error('asFragment was not assigned');
    }
  });
});
