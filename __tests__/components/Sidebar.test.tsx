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
import {
  fetchChats,
  fetchChatMessages,
  deleteChat,
  editChatTitle
} from '@/src/utils/sqliteApiClient';

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
    onEditClick
  }: {
    title: string;
    itemList: any[];
    link: string;
    defaultOpen: boolean;
    onItemClick?: (id: string) => void;
    activeItemId?: string;
    onDeleteClick?: (id: string) => void;
    onEditClick?: (id: string) => void;
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
                onClick={() => onItemClick && onItemClick(item.value)}
                data-active={item.value === activeItemId}
              >
                {item.label}
                {onDeleteClick && (
                  <button onClick={() => onDeleteClick(item.value)}>
                    Delete
                  </button>
                )}
                {onEditClick && (
                  <button onClick={() => onEditClick(item.value)}>Edit</button>
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

jest.mock('@/src/utils/sqliteApiClient', () => ({
  fetchChats: jest.fn(),
  fetchChatMessages: jest.fn(),
  deleteChat: jest.fn(),
  editChatTitle: jest.fn()
}));

const mockSetIsConfigPanelVisible = jest.fn();
const mockSetIsSidebarOpen = jest.fn();
const mockSetChatId = jest.fn();
const mockSetChats = jest.fn();
const mockSetChatHistory = jest.fn();
const mockSetImageSrcHistory = jest.fn();

const mockNamespacesList = [
  { label: 'Namespace 1', value: 'ns1' },
  { label: 'Namespace 2', value: 'ns2' }
];

const mockChats = [
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
        model: 'model1',
        images: []
      }
    ]);
  });

  const renderSidebar = (chatId = '0') =>
    render(
      <Sidebar
        setIsConfigPanelVisible={mockSetIsConfigPanelVisible}
        setIsSidebarOpen={mockSetIsSidebarOpen}
        namespacesList={mockNamespacesList}
        chatId={chatId}
        setChatId={mockSetChatId}
        chats={mockChats}
        setChats={mockSetChats}
        setChatHistory={mockSetChatHistory}
        setImageSrcHistory={mockSetImageSrcHistory}
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
        'Failed to fetch chats: Fetch failed'
      );
    });

    consoleSpy.mockRestore();
  });

  it('fetches and renders chats on mount', async () => {
    await act(async () => {
      renderSidebar();
    });

    expect(fetchChats).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getByText('Test Chat 1')).toBeInTheDocument();
      expect(screen.getByText('Test Chat 2')).toBeInTheDocument();
    });
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

    expect(fetchChatMessages).toHaveBeenCalledWith(1);
    expect(mockSetIsConfigPanelVisible).toHaveBeenCalledWith(false);
    expect(mockSetChatHistory).toHaveBeenCalled();
    expect(mockSetImageSrcHistory).toHaveBeenCalled();
    expect(mockSetChatId).toHaveBeenCalledWith('1');
  });

  it('handles chat deletion correctly', async () => {
    await act(async () => {
      renderSidebar('1');
    });

    const deleteButton = screen.getAllByText('Delete')[0];
    await act(async () => {
      fireEvent.click(deleteButton);
    });

    expect(deleteChat).toHaveBeenCalledWith('1');
    expect(mockSetChats).toHaveBeenCalled();
    expect(mockSetChatId).toHaveBeenCalledWith('');
    expect(mockSetChatHistory).toHaveBeenCalled();
    expect(mockSetImageSrcHistory).toHaveBeenCalled();
  });

  it('handles chat editing correctly', async () => {
    window.prompt = jest.fn().mockReturnValue('New Chat Title');

    await act(async () => {
      renderSidebar();
    });

    const editButton = screen.getAllByText('Edit')[0];
    await act(async () => {
      fireEvent.click(editButton);
    });

    expect(editChatTitle).toHaveBeenCalledWith('1', 'New Chat Title');
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
        model: 'Gemini-1.5 Pro' // it is the default model
      }
    ]);
    expect(mockSetImageSrcHistory).toHaveBeenCalledWith([[]]);
  });

  it('handles chat messages with images correctly', async () => {
    (fetchChatMessages as jest.Mock).mockResolvedValue([
      {
        userMessage: 'Hello',
        aiMessage: 'Hi there',
        model: 'model1',
        images: [{ imageFile: 'image1.jpg' }, { imageFile: 'image2.jpg' }]
      }
    ]);

    await act(async () => {
      renderSidebar();
    });

    const chatItem = await screen.findByText('Test Chat 1');
    await act(async () => {
      fireEvent.click(chatItem);
    });

    expect(mockSetImageSrcHistory).toHaveBeenCalledWith([
      ['image1.jpg', 'image2.jpg']
    ]);
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
