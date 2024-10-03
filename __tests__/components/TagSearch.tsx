import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import TagSearch from '@/src/components/TagSearch';
import { renderWithContext } from '@/__tests__/test_utils/context';
import { OptionType } from '@/src/types/common';

const mockOnFilterChats = jest.fn();

const defaultProps = {
  onFilterChats: mockOnFilterChats
};

describe('TagSearch Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the search input', () => {
    renderWithContext(<TagSearch {...defaultProps} />);
    expect(screen.getByLabelText('Search for tags')).toBeInTheDocument();
  });

  it('should update search term when typing', () => {
    renderWithContext(<TagSearch {...defaultProps} />);
    const input = screen.getByLabelText('Search for tags');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(input).toHaveValue('test');
  });

  it('should display suggested tags based on search term', async () => {
    const mockChats: OptionType[] = [
      { value: '1', label: 'Chat 1', tags: ['tag1', 'tag2'] },
      { value: '2', label: 'Chat 2', tags: ['tag2', 'tag3'] }
    ];

    renderWithContext(<TagSearch {...defaultProps} />, { chats: mockChats });

    const input = screen.getByLabelText('Search for tags');
    fireEvent.change(input, { target: { value: 'tag' } });

    await waitFor(() => {
      expect(screen.getByText('tag1')).toBeInTheDocument();
      expect(screen.getByText('tag2')).toBeInTheDocument();
      expect(screen.getByText('tag3')).toBeInTheDocument();
    });
  });

  it('should add a tag when clicked', async () => {
    const mockChats: OptionType[] = [
      { value: '1', label: 'Chat 1', tags: ['tag1', 'tag2'] }
    ];

    renderWithContext(<TagSearch {...defaultProps} />, { chats: mockChats });

    const input = screen.getByLabelText('Search for tags');
    fireEvent.change(input, { target: { value: 'tag' } });

    await waitFor(() => {
      fireEvent.click(screen.getByText('tag1'));
    });

    expect(screen.getByText('Selected Tags:')).toBeInTheDocument();
    expect(screen.getByText('tag1')).toBeInTheDocument();
  });

  it('should remove a tag when remove button is clicked', async () => {
    const mockChats: OptionType[] = [
      { value: '1', label: 'Chat 1', tags: ['tag1', 'tag2'] }
    ];

    renderWithContext(<TagSearch {...defaultProps} />, { chats: mockChats });

    const input = screen.getByLabelText('Search for tags');
    fireEvent.change(input, { target: { value: 'tag' } });

    await waitFor(() => {
      expect(screen.getByText('tag1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('tag1'));

    // Verify the tag is added to selected tags
    await waitFor(() => {
      expect(screen.getByText('Selected Tags:')).toBeInTheDocument();
      expect(screen.getByText('tag1')).toBeInTheDocument();
    });

    const removeButton = screen.getByLabelText('Remove tag1 tag');
    fireEvent.click(removeButton);

    // Wait for the tag to be removed
    await waitFor(() => {
      expect(screen.queryByText('Selected Tags:')).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Remove tag1 tag' })
      ).not.toBeInTheDocument();
    });

    // Verify the tag is back in the suggested tags
    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.getByText('Suggested Tags:')).toBeInTheDocument();
  });

  it('should call onFilterChats when tags are selected or removed', async () => {
    const mockChats: OptionType[] = [
      { value: '1', label: 'Chat 1', tags: ['tag1', 'tag2'] },
      { value: '2', label: 'Chat 2', tags: ['tag2', 'tag3'] }
    ];

    renderWithContext(<TagSearch {...defaultProps} />, { chats: mockChats });

    const input = screen.getByLabelText('Search for tags');
    fireEvent.change(input, { target: { value: 'tag' } });

    await waitFor(() => {
      fireEvent.click(screen.getByText('tag1'));
    });

    expect(mockOnFilterChats).toHaveBeenCalledWith([mockChats[0]]);

    fireEvent.click(screen.getByLabelText('Remove tag1 tag'));

    await waitFor(() => {
      expect(mockOnFilterChats).toHaveBeenCalledWith(mockChats);
    });
  });

  it('should clear search term after selecting a tag', async () => {
    const mockChats: OptionType[] = [
      { value: '1', label: 'Chat 1', tags: ['tag1', 'tag2'] }
    ];

    renderWithContext(<TagSearch {...defaultProps} />, { chats: mockChats });

    const input = screen.getByLabelText('Search for tags');
    fireEvent.change(input, { target: { value: 'tag' } });

    await waitFor(() => {
      fireEvent.click(screen.getByText('tag1'));
    });

    expect(input).toHaveValue('');
  });

  it('TagSearch component snapshot', () => {
    const { asFragment } = renderWithContext(<TagSearch {...defaultProps} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
