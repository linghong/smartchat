// ChatList.test.tsx
import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import ChatList from '@/src/components/ChatList';
import { renderWithContext } from '@/__tests__/test_utils/context';
import { OptionType } from '@/src/types/common';

// Mock the TagSearch component
jest.mock('@/src/components/TagSearch', () => ({
  __esModule: true,
  default: ({
    onFilterChats
  }: {
    onFilterChats: (chats: OptionType[]) => void;
  }) => (
    <button
      data-testid="mock-tag-search"
      onClick={() =>
        onFilterChats([
          { value: '1', label: 'Chat 1', tags: ['tag1'] },
          { value: '2', label: 'Chat 2', tags: ['tag2'] }
        ])
      }
    >
      Mock TagSearch
    </button>
  )
}));

describe('ChatList Component', () => {
  const mockChats: OptionType[] = [
    { value: '1', label: 'Chat 1', tags: ['tag1', 'tag2'] },
    { value: '2', label: 'Chat 2', tags: ['tag2'] },
    { value: '3', label: 'Chat 3', tags: ['tag3'] }
  ];

  const emptyChats: OptionType[] = [];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the TagSearch component', () => {
    renderWithContext(<ChatList />, { chats: mockChats });

    expect(screen.getByTestId('mock-tag-search')).toBeInTheDocument();
    expect(screen.getByText('Mock TagSearch')).toBeInTheDocument();
  });

  it('should render the list of chats when filteredChats has items', () => {
    renderWithContext(<ChatList />, { chats: mockChats });

    expect(screen.getByText('Filtered Chats:')).toBeInTheDocument();

    mockChats.forEach(chat => {
      const chatElement = screen
        .getByText(chat.label)
        .closest('div.bg-gray-100');
      expect(chatElement).toBeInTheDocument();
      expect(screen.getByText(chat.label)).toBeInTheDocument();
      if (chat.tags) {
        chat.tags.forEach(tag => {
          expect(screen.getAllByText(tag).length).toBeGreaterThan(0);
        });
      }
    });
  });

  it('should display "No chats found..." when filteredChats is empty', () => {
    renderWithContext(<ChatList />, { chats: emptyChats });

    expect(
      screen.getByText('No chats found matching the selected tags.')
    ).toBeInTheDocument();
  });

  it('should update the displayed chats when TagSearch filters chats', async () => {
    renderWithContext(<ChatList />, { chats: mockChats });

    expect(screen.getByText('Chat 1')).toBeInTheDocument();
    expect(screen.getByText('Chat 2')).toBeInTheDocument();
    expect(screen.getByText('Chat 3')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('mock-tag-search'));

    await waitFor(() => {
      expect(screen.getByText('Chat 1')).toBeInTheDocument();
      expect(screen.getByText('Chat 2')).toBeInTheDocument();
      expect(screen.queryByText('Chat 3')).not.toBeInTheDocument();
    });
  });

  it('should match the snapshot', () => {
    const { asFragment } = renderWithContext(<ChatList />, {
      chats: mockChats
    });
    expect(asFragment()).toMatchSnapshot();
  });
});
