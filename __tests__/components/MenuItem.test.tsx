import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/router';

import MenuItem from '@/src/components/MenuItem';

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

describe('MenuItem Component', () => {
  const mockPush = jest.fn();
  const mockSetIsSidebarOpen = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    const mockedUseRouter = useRouter as jest.Mock;
    mockedUseRouter.mockReturnValue({
      pathname: '/current-path',
      push: mockPush
    });
  });

  it('should render MenuItem component with the title and link', () => {
    render(
      <MenuItem
        title="Test Title"
        link="/test-link"
        itemList={[
          { label: 'Item 1', value: '1' },
          { label: 'Item 2', value: '2' }
        ]}
      />
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Title')).toHaveAttribute(
      'href',
      '/test-link'
    );
  });

  it('should render MenuItem component with item list and toggles correctly', () => {
    render(
      <MenuItem
        title="Test Title"
        itemList={[
          { label: 'Item 1', value: '1' },
          { label: 'Item 2', value: '2' }
        ]}
      />
    );

    // Ensure the item list is not visible initially
    expect(screen.queryByTestId('virtualized-list')).toBeNull();
    expect(screen.queryByText('Item 1')).toBeNull();
    expect(screen.queryByText('Item 2')).toBeNull();

    // Click to toggle the item list
    fireEvent.click(screen.getByRole('button', { name: 'Expand' }));

    // Ensure the item list is visible after toggling
    expect(screen.getByTestId('virtualized-list')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('should apply active class when the link matches the current pathname', () => {
    render(
      <MenuItem
        title="Test Title"
        link="/current-path"
        itemList={[
          { label: 'Item 1', value: '1' },
          { label: 'Item 2', value: '2' }
        ]}
      />
    );

    const menuItem = screen.getByText('Test Title').closest('div');
    expect(menuItem).toHaveClass('bg-slate-400 text-indigo-200 rounded-sm');
  });

  it('should not apply active class when the link does not match the current pathname', () => {
    render(
      <MenuItem
        title="Test Title"
        link="/other-path"
        itemList={[
          { label: 'Item 1', value: '1' },
          { label: 'Item 2', value: '2' }
        ]}
      />
    );

    const menuItem = screen.getByText('Test Title').closest('div');
    expect(menuItem).not.toHaveClass('bg-slate-400 text-indigo-200 rounded-sm');
  });

  it('should render MenuItem component with default open state', () => {
    render(
      <MenuItem
        title="Test Title"
        itemList={[
          { label: 'Item 1', value: '1' },
          { label: 'Item 2', value: '2' }
        ]}
        defaultOpen={true}
      />
    );

    // Ensure the virtualized list is visible initially due to defaultOpen
    expect(screen.getByTestId('virtualized-list')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('should have hover and focus classes', () => {
    render(
      <MenuItem
        title="Test Title"
        itemList={[
          { label: 'Item 1', value: '1' },
          { label: 'Item 2', value: '2' }
        ]}
      />
    );
    const menuItem = screen.getByText('Test Title').closest('div');
    expect(menuItem).toHaveClass('hover:bg-slate-500');
    expect(menuItem).toHaveClass('focus:bg-indigo-100');
  });

  it('should call router.push and setIsSidebarOpen when link is clicked on mobile', async () => {
    global.innerWidth = 480;

    render(
      <MenuItem
        title="Test Title"
        link="/test-link"
        itemList={[
          { label: 'Item 1', value: '1' },
          { label: 'Item 2', value: '2' }
        ]}
        setIsSidebarOpen={mockSetIsSidebarOpen}
      />
    );

    fireEvent.click(screen.getByText('Test Title'));
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/test-link');
      expect(mockSetIsSidebarOpen).toHaveBeenCalledWith(false);
    });
  });

  it('should call router.push but not setIsSidebarOpen when link is clicked on desktop', async () => {
    global.innerWidth = 1024;
    render(
      <MenuItem
        title="Test Title"
        link="/test-link"
        itemList={[
          { label: 'Item 1', value: '1' },
          { label: 'Item 2', value: '2' }
        ]}
        setIsSidebarOpen={mockSetIsSidebarOpen}
      />
    );

    fireEvent.click(screen.getByText('Test Title'));
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/test-link');
      expect(mockSetIsSidebarOpen).not.toHaveBeenCalled();
    });
  });

  it('should match MenuItem component snapshot', () => {
    const { asFragment } = render(
      <MenuItem
        title="Test Title"
        link="/test-link"
        itemList={[
          { label: 'Item 1', value: '1' },
          { label: 'Item 2', value: '2' }
        ]}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
