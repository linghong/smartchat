import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
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
    onItemClick
  }: {
    title: string;
    itemList: any[];
    link: string;
    defaultOpen: boolean;
    onItemClick?: (id: string) => void;
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

// Mock the fetchChats and fetchChatMessages functions
jest.mock('@/src/utils/sqliteApiClient', () => ({
  fetchChats: jest.fn(),
  fetchChatMessages: jest.fn()
}));

const mockSetIsSidebarOpen = jest.fn();
const mockSetChatId = jest.fn();
const mockSetChatHistory = jest.fn();
const mockSetImageSrcHistory = jest.fn();

const mockNamespacesList = [
  { label: 'Namespace 1', value: 'ns1' },
  { label: 'Namespace 2', value: 'ns2' }
];

describe('Sidebar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetchChats as jest.Mock).mockResolvedValue([
      { value: '1', label: 'Test Chat' }
    ]);
    (fetchChatMessages as jest.Mock).mockResolvedValue([
      { userMessage: 'Hello', aiMessage: 'Hi there', images: [] }
    ]);
  });

  it('renders Sidebar component with all expected elements', async () => {
    await act(async () => {
      render(
        <Sidebar
          setIsSidebarOpen={mockSetIsSidebarOpen}
          namespacesList={mockNamespacesList}
          setChatId={mockSetChatId}
          setChatHistory={mockSetChatHistory}
          setImageSrcHistory={mockSetImageSrcHistory}
        />
      );
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
      render(
        <Sidebar
          setIsSidebarOpen={mockSetIsSidebarOpen}
          namespacesList={mockNamespacesList}
          setChatId={mockSetChatId}
          setChatHistory={mockSetChatHistory}
          setImageSrcHistory={mockSetImageSrcHistory}
        />
      );
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
      render(
        <Sidebar
          setIsSidebarOpen={mockSetIsSidebarOpen}
          namespacesList={mockNamespacesList}
          setChatId={mockSetChatId}
          setChatHistory={mockSetChatHistory}
          setImageSrcHistory={mockSetImageSrcHistory}
        />
      );
    });

    expect(fetchChats).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getByText('Test Chat')).toBeInTheDocument();
    });
  });

  it('handles chat click correctly', async () => {
    await act(async () => {
      render(
        <Sidebar
          setIsSidebarOpen={mockSetIsSidebarOpen}
          namespacesList={mockNamespacesList}
          setChatId={mockSetChatId}
          setChatHistory={mockSetChatHistory}
          setImageSrcHistory={mockSetImageSrcHistory}
        />
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Test Chat')).toBeInTheDocument();
    });

    const chatItem = screen.getByText('Test Chat');
    await act(async () => {
      chatItem.click();
    });

    expect(fetchChatMessages).toHaveBeenCalledWith(1);
    expect(mockSetChatHistory).toHaveBeenCalled();
    expect(mockSetImageSrcHistory).toHaveBeenCalled();
    expect(mockSetChatId).toHaveBeenCalledWith('1');
  });

  it('renders namespaces list correctly', async () => {
    await act(async () => {
      render(
        <Sidebar
          setIsSidebarOpen={mockSetIsSidebarOpen}
          namespacesList={mockNamespacesList}
          setChatId={mockSetChatId}
          setChatHistory={mockSetChatHistory}
          setImageSrcHistory={mockSetImageSrcHistory}
        />
      );
    });

    expect(screen.queryByText('Namespace 1')).toBeNull(); // Not visible because Embed RAG File is not defaultOpen
    expect(screen.queryByText('Namespace 2')).toBeNull();
  });

  it('initially renders child menu items correctly based on defaultOpen state', async () => {
    await act(async () => {
      render(
        <Sidebar
          setIsSidebarOpen={mockSetIsSidebarOpen}
          namespacesList={mockNamespacesList}
          setChatId={mockSetChatId}
          setChatHistory={mockSetChatHistory}
          setImageSrcHistory={mockSetImageSrcHistory}
        />
      );
    });

    expect(screen.queryByText('Namespace 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Namespace 2')).not.toBeInTheDocument();
    expect(screen.queryByText('Model 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Model 2')).not.toBeInTheDocument();

    // Wait for the chat data to be fetched and rendered
    await waitFor(() => {
      expect(screen.getByText('Test Chat')).toBeInTheDocument();
    }); // Visible because defaultOpen is true for Chat With AI
  });

  it('has the correct href for Each MenuItem', async () => {
    await act(async () => {
      render(
        <Sidebar
          setIsSidebarOpen={mockSetIsSidebarOpen}
          namespacesList={mockNamespacesList}
          setChatId={mockSetChatId}
          setChatHistory={mockSetChatHistory}
          setImageSrcHistory={mockSetImageSrcHistory}
        />
      );
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

  it('matches snapshot', async () => {
    let asFragment: (() => DocumentFragment) | undefined;

    await act(async () => {
      const result = render(
        <Sidebar
          setIsSidebarOpen={mockSetIsSidebarOpen}
          namespacesList={mockNamespacesList}
          setChatId={mockSetChatId}
          setChatHistory={mockSetChatHistory}
          setImageSrcHistory={mockSetImageSrcHistory}
        />
      );
      asFragment = result.asFragment;
    });

    if (asFragment) {
      expect(asFragment()).toMatchSnapshot();
    } else {
      throw new Error('asFragment was not assigned');
    }
  });
});
