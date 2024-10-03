// MenuItem.test.tsx
import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/router';

import MenuItem from '@/src/components/MenuItem';
import { renderWithContext } from '@/__tests__/test_utils/context';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}));

// Mock react-window and react-virtualized-auto-sizer
jest.mock('react-window', () => ({
  FixedSizeList: jest.fn(({ children, itemCount }) => (
    <div data-testid="virtualized-list">
      {Array.from({ length: itemCount }).map((_, index) => (
        <div key={`item-${index}`}>{children({ index, style: {} })}</div>
      ))}
    </div>
  ))
}));

jest.mock('react-virtualized-auto-sizer', () => ({
  __esModule: true,
  default: jest.fn(({ children }) => children({ width: 300, height: 400 }))
}));

const mockPush = jest.fn();
const mockSetIsSidebarOpen = jest.fn();
const mockOnItemClick = jest.fn();
const mockOnDeleteClick = jest.fn();
const mockOnEditClick = jest.fn();

describe('MenuItem Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    const mockedUseRouter = useRouter as jest.Mock;
    mockedUseRouter.mockReturnValue({
      pathname: '/current-path',
      push: mockPush
    });
  });

  it('should render MenuItem component with the title and link', () => {
    renderWithContext(
      <MenuItem
        title="Test Title"
        link="/test-link"
        itemList={[
          { label: 'Item 1', value: '1' },
          { label: 'Item 2', value: '2' }
        ]}
        maxVisibleItem={5}
      />
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Title')).toHaveAttribute(
      'href',
      '/test-link'
    );
  });

  it('should render MenuItem component with item list and toggles correctly', () => {
    renderWithContext(
      <MenuItem
        title="Test Title"
        itemList={[
          { label: 'Item 1', value: '1' },
          { label: 'Item 2', value: '2' }
        ]}
        maxVisibleItem={5}
      />
    );
    // Ensure the item list is not visible initially
    expect(screen.queryByTestId('virtualized-list')).toBeNull();
    expect(screen.queryByText('Item 1')).toBeNull();
    expect(screen.queryByText('Item 2')).toBeNull();

    const toggleButton = screen.getByRole('button', { name: /test title/i });

    fireEvent.click(toggleButton);

    // Ensure the item list is visible after toggling
    expect(screen.getByTestId('virtualized-list')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();

    fireEvent.click(toggleButton);

    // Ensure the item list is not visible after collapsing
    expect(screen.queryByTestId('virtualized-list')).toBeNull();
    expect(screen.queryByText('Item 1')).toBeNull();
    expect(screen.queryByText('Item 2')).toBeNull();
  });

  it('should render search toggle for "Chat With AI" title', () => {
    renderWithContext(
      <MenuItem
        title="Chat With AI"
        isSearchMenu={true}
        itemList={[
          { label: 'Item 1', value: '1' },
          { label: 'Item 2', value: '2' }
        ]}
        maxVisibleItem={5}
      />
    );
    expect(screen.getByLabelText('Toggle search')).toBeInTheDocument();
  });

  it('should render MenuItem component with default open state and correct height', () => {
    renderWithContext(
      <MenuItem
        title="Test Title"
        itemList={[
          { label: 'Item 1', value: '1' },
          { label: 'Item 2', value: '2' }
        ]}
        maxVisibleItem={5}
        defaultOpen={true}
      />
    );

    const listContainer = screen.getByTestId('virtualized-list').parentElement;
    expect(screen.getByTestId('virtualized-list')).toBeInTheDocument(); // Ensure the virtualized list is visible initially due to defaultOpen
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('should highlight active item based on activeItemId', () => {
    renderWithContext(
      <MenuItem
        title="Test Title"
        itemList={[
          { label: 'Item 1', value: '1' },
          { label: 'Item 2', value: '2' }
        ]}
        maxVisibleItem={5}
        activeItemId="2"
        defaultOpen={true}
      />
    );

    const activeItem = screen.getByText('Item 2').closest('div');
    expect(activeItem).toHaveClass('bg-slate-400 text-indigo-200 rounded-sm');
  });

  it('should pass correct props to FixedSizeList', () => {
    const { FixedSizeList } = require('react-window');
    const itemList = [
      { label: 'Item 1', value: '1' },
      { label: 'Item 2', value: '2' }
    ];
    renderWithContext(
      <MenuItem
        title="Test Title"
        itemList={itemList}
        maxVisibleItem={5}
        defaultOpen={true}
      />
    );
    const ITEM_HEIGHT = 30;
    const expectedHeight = Math.min(
      itemList.length * ITEM_HEIGHT,
      5 * ITEM_HEIGHT
    );

    expect(FixedSizeList).toHaveBeenCalledWith(
      expect.objectContaining({
        width: 300,
        height: expectedHeight,
        itemCount: itemList.length,
        itemSize: ITEM_HEIGHT
      }),
      expect.anything()
    );
  });

  it('should add custom scrollbar class when items exceed maxVisibleItem', () => {
    const { FixedSizeList } = require('react-window');
    const manyItems = Array.from({ length: 20 }, (_, i) => ({
      label: `Item ${i + 1}`,
      value: `${i + 1}`
    }));

    renderWithContext(
      <MenuItem
        title="Test Title"
        itemList={manyItems}
        maxVisibleItem={5}
        defaultOpen={true}
      />
    );

    expect(FixedSizeList).toHaveBeenCalledWith(
      expect.objectContaining({
        className: 'custom-scrollbar'
      }),
      expect.anything()
    );
  });

  it('should limit the height of the list to MAX_HEIGHT when there are many items', () => {
    const { FixedSizeList } = require('react-window');
    const manyItems = Array.from({ length: 20 }, (_, i) => ({
      label: `Item ${i + 1}`,
      value: `${i + 1}`
    }));

    const ITEM_HEIGHT = 30;
    const MAX_VISIBLEITEM = 5;
    const MAX_HEIGHT = MAX_VISIBLEITEM * ITEM_HEIGHT;

    renderWithContext(
      <MenuItem
        title="Test Title"
        itemList={manyItems}
        maxVisibleItem={MAX_VISIBLEITEM}
        defaultOpen={true}
      />
    );

    expect(FixedSizeList).toHaveBeenCalledWith(
      expect.objectContaining({
        width: 300,
        height: MAX_HEIGHT,
        itemCount: manyItems.length,
        itemSize: ITEM_HEIGHT
      }),
      expect.anything()
    );
  });

  it('should have hover and focus classes', () => {
    renderWithContext(
      <MenuItem
        title="Test Title"
        itemList={[
          { label: 'Item 1', value: '1' },
          { label: 'Item 2', value: '2' }
        ]}
        maxVisibleItem={5}
      />
    );
    const menuItem = screen.getByText('Test Title').closest('div');
    expect(menuItem).toHaveClass('hover:bg-slate-500');
    expect(menuItem).toHaveClass('focus:bg-indigo-100');
  });

  it('should call router.push and setIsSidebarOpen when link is clicked on mobile', async () => {
    global.innerWidth = 480;

    renderWithContext(
      <MenuItem
        title="Test Title"
        link="/test-link"
        itemList={[
          { label: 'Item 1', value: '1' },
          { label: 'Item 2', value: '2' }
        ]}
        setIsSidebarOpen={mockSetIsSidebarOpen}
        maxVisibleItem={5}
      />
    );

    const toggleButton = screen.getByRole('button', { name: /test title/i });
    fireEvent.click(toggleButton);

    fireEvent.click(screen.getByText('Test Title'));
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/test-link');
      expect(mockSetIsSidebarOpen).toHaveBeenCalledWith(false);
    });
  });

  it('should call router.push but not setIsSidebarOpen when link is clicked on desktop', async () => {
    global.innerWidth = 1024;
    renderWithContext(
      <MenuItem
        title="Test Title"
        link="/test-link"
        itemList={[
          { label: 'Item 1', value: '1' },
          { label: 'Item 2', value: '2' }
        ]}
        setIsSidebarOpen={mockSetIsSidebarOpen}
        maxVisibleItem={5}
      />
    );

    const toggleButton = screen.getByRole('button', { name: /test title/i });
    fireEvent.click(toggleButton);

    fireEvent.click(screen.getByText('Test Title'));
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/test-link');
      expect(mockSetIsSidebarOpen).not.toHaveBeenCalled();
    });
  });

  it('should call onItemClick when an item is clicked', () => {
    renderWithContext(
      <MenuItem
        title="Test Title"
        itemList={[
          { label: 'Item 1', value: '1' },
          { label: 'Item 2', value: '2' }
        ]}
        maxVisibleItem={5}
        onItemClick={mockOnItemClick}
        defaultOpen={true}
      />
    );

    fireEvent.click(screen.getByText('Item 1'));
    expect(mockOnItemClick).toHaveBeenCalledWith('1');

    fireEvent.click(screen.getByText('Item 2'));
    expect(mockOnItemClick).toHaveBeenCalledWith('2');
  });

  it('should call onDeleteClick when delete icon is clicked', () => {
    renderWithContext(
      <MenuItem
        title="Test Title"
        itemList={[
          { label: 'Item 1', value: '1' },
          { label: 'Item 2', value: '2' }
        ]}
        maxVisibleItem={5}
        onDeleteClick={mockOnDeleteClick}
        defaultOpen={true}
      />
    );

    const deleteButtons = screen.getAllByLabelText(/Delete Item \d/);
    fireEvent.click(deleteButtons[0]);
    expect(mockOnDeleteClick).toHaveBeenCalledWith('1');
  });

  it('should enter edit mode when edit icon is clicked', () => {
    renderWithContext(
      <MenuItem
        title="Test Title"
        itemList={[
          { label: 'Item 1', value: '1' },
          { label: 'Item 2', value: '2' }
        ]}
        maxVisibleItem={5}
        onEditClick={mockOnEditClick}
        defaultOpen={true}
      />
    );

    const editButtons = screen.getAllByLabelText(/Edit Item \d/);
    fireEvent.click(editButtons[0]);
    expect(screen.getByDisplayValue('Item 1')).toBeInTheDocument();
  });

  it('should call onEditClick when edit is submitted', () => {
    renderWithContext(
      <MenuItem
        title="Test Title"
        itemList={[
          { label: 'Item 1', value: '1' },
          { label: 'Item 2', value: '2' }
        ]}
        maxVisibleItem={5}
        onEditClick={mockOnEditClick}
        defaultOpen={true}
      />
    );
    const editButtons = screen.getAllByLabelText(/Edit Item \d/);
    fireEvent.click(editButtons[0]);
    const input = screen.getByDisplayValue('Item 1');
    fireEvent.change(input, { target: { value: 'Updated Item 1' } });
    fireEvent.click(screen.getByLabelText('Submit edit'));

    expect(mockOnEditClick).toHaveBeenCalledWith('1', 'Updated Item 1');
  });

  it('should render correct number of items in the virtualized list', () => {
    const itemList = [
      { label: 'Item 1', value: '1' },
      { label: 'Item 2', value: '2' },
      { label: 'Item 3', value: '3' }
    ];

    renderWithContext(
      <MenuItem
        title="Test Title"
        itemList={itemList}
        maxVisibleItem={5}
        defaultOpen={true}
      />
    );

    const listItems = screen.getAllByText(/Item \d/);
    expect(listItems).toHaveLength(itemList.length);
  });

  it('should not render list when itemList is null', () => {
    renderWithContext(
      <MenuItem title="Test Title" itemList={null} defaultOpen={true} />
    );

    expect(screen.queryByTestId('virtualized-list')).toBeNull();
  });

  it('should match MenuItem component snapshot', () => {
    const { asFragment } = renderWithContext(
      <MenuItem
        title="Test Title"
        link="/test-link"
        itemList={[
          { label: 'Item 1', value: '1' },
          { label: 'Item 2', value: '2' }
        ]}
        maxVisibleItem={5}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
