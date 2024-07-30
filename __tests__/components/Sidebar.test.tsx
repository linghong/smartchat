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
import { fetchChats, fetchChatMessages } from '@/src/utils/sqliteApiClient';

// Mock the MenuItem component
jest.mock('@/src/components/MenuItem', () => {
  return function MockMenuItem({
    title,
    itemList,
    link,
    defaultOpen,
    onItemClick,
    activeItemId
  }: {
    title: string;
    itemList: any[];
    link: string;
    defaultOpen: boolean;
    onItemClick?: (id: string) => void;
    activeItemId?: string;
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
  fetchChatMessages: jest.fn()
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

const mockSelectedModel = {
  value: 'gemini-1.5-pro',
  label: 'Gemini-1.5 Pro',
  vision: true
};

describe('Sidebar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetchChats as jest.Mock).mockResolvedValue(mockChats);
    (fetchChatMessages as jest.Mock).mockResolvedValue([
      { userMessage: 'Hello', aiMessage: 'Hi there', images: [] }
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

  it('renders namespaces list correctly', async () => {
    await act(async () => {
      renderSidebar();
    });

    // Not visible because Embed RAG File is not defaultOpen
    expect(screen.queryByText('Namespace 1')).toBeNull();
    expect(screen.queryByText('Namespace 2')).toBeNull();
  });

  it('initially renders child menu items correctly based on defaultOpen state', async () => {
    await act(async () => {
      renderSidebar();
    });

    expect(screen.queryByText('Namespace 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Namespace 2')).not.toBeInTheDocument();
    expect(screen.queryByText('Model 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Model 2')).not.toBeInTheDocument();

    // Visible because defaultOpen is true for Chat With AI
    await waitFor(() => {
      expect(screen.getByText('Test Chat 1')).toBeInTheDocument();
      expect(screen.getByText('Test Chat 2')).toBeInTheDocument();
    });
  });

  it('has the correct href for Each MenuItem', async () => {
    await act(async () => {
      renderSidebar();
    });

    const embedRagFileLink = screen.getByText('Embed RAG File').closest('a');
    expect(embedRagFileLink).toHaveAttribute('href', '/embedragfile');

    const finetuneModelLink = screen
      .getByText('Finetune AI Model')
      .closest('a');
    expect(finetuneModelLink).toHaveAttribute('href', '/finetunemodel');

    const chatWithAILink = screen.getByText('Chat With AI').closest('a');
    expect(chatWithAILink).toHaveAttribute('href', '/');
  });

  it('sets active chat correctly', async () => {
    await act(async () => {
      renderSidebar('2');
    });

    await waitFor(() => {
      const activeChat = screen.getByText('Test Chat 2');
      expect(activeChat.closest('li')).toHaveAttribute('data-active', 'true');
    });
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
        model: 'Gemini-1.5 Pro'
      }
    ]);
    expect(mockSetImageSrcHistory).toHaveBeenCalledWith([[]]);
  });

  it('handles chat messages with images correctly', async () => {
    (fetchChatMessages as jest.Mock).mockResolvedValue([
      {
        userMessage: 'Hello',
        aiMessage: 'Hi there',
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
