import React from 'react';
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/router';

import Header from '@/src/components/Header';
import { renderWithContext } from '@/__tests__/test_utils/context';

jest.mock('next/router', () => ({
  useRouter: jest.fn()
}));

const mockSetIsSidebarOpen = jest.fn();
const mockPush = jest.fn();
const mockSetIsConfigPanelVisible = jest.fn();

const defaultProps = {
  isSidebarOpen: true,
  setIsSidebarOpen: mockSetIsSidebarOpen
};

describe('Header Component', () => {
  beforeEach(() => {
    // Reset the mock before each test
    (useRouter as jest.Mock).mockReturnValue({
      pathname: '/',
      push: mockPush
    });
    jest.clearAllMocks();
  });

  it('should render the page title correctly', () => {
    renderWithContext(<Header {...defaultProps} />);

    // Check if the rendered header contains the correct page title
    expect(screen.getByText('Chat With My AI Assistant')).toBeInTheDocument();
  });

  it('should render different page titles based on pathname', () => {
    const paths = [
      { path: '/', title: 'Chat With My AI Assistant' },
      { path: '/finetunemodel', title: 'Finetune AI Model' },
      { path: '/embedragfile', title: 'Embed RAG File' }
    ];

    paths.forEach(({ path, title }) => {
      (useRouter as jest.Mock).mockReturnValue({
        pathname: path,
        push: mockPush
      });

      renderWithContext(<Header {...defaultProps} />);

      expect(screen.getByText(title)).toBeInTheDocument();
    });
  });

  describe('Mouse focusing and hovering events', () => {
    beforeEach(() => {
      renderWithContext(<Header {...defaultProps} />);
    });

    it('should change its background color when focusing on menu button and sidebar is open', async () => {
      const menuIcon = screen.getByLabelText('Toggle Sidebar');
      expect(menuIcon?.className).toMatch(/focus/);
      expect(menuIcon).toHaveClass('transition-colors');
    });

    it('should show visual feedback when hovering over menu button and sidebar is open ', async () => {
      const menuIcon = screen.getByLabelText('Toggle Sidebar');
      expect(menuIcon.className).toMatch(/hover/);
    });

    it('should show visual feedback when hovering over New Chat ', async () => {
      const newChatButton = screen.getByLabelText('New Chat');
      expect(newChatButton?.className).toMatch(/hover/);
    });
  });

  describe('Mouse click events on NewChat', () => {
    it('should navigate to the home page when NewChat button is clicked', async () => {
      renderWithContext(<Header {...defaultProps} />);

      fireEvent.click(screen.getByLabelText('New Chat'));
      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith('/');
    });

    it('should not call setIsSidebarOpen when NewChat button is clicked on mobile and sidebar is initially open', () => {
      global.innerWidth = 480;
      renderWithContext(<Header {...defaultProps} />);

      fireEvent.click(screen.getByLabelText('New Chat'));
      // Because router.push('/') is called instead
      expect(mockSetIsSidebarOpen).not.toHaveBeenCalled();
    });

    it('should not call setIsSidebarOpen when NewChat button is clicked on desktop and sidebar is initially open', () => {
      global.innerWidth = 1024;
      renderWithContext(<Header {...defaultProps} />);

      fireEvent.click(screen.getByLabelText('New Chat'));
      expect(mockSetIsSidebarOpen).not.toHaveBeenCalled();
    });

    it('should not call setIsSidebarOpen when NewChat button is clicked on desktop and sidebar is initially closed', () => {
      global.innerWidth = 1024;
      renderWithContext(<Header {...defaultProps} />);

      fireEvent.click(screen.getByLabelText('New Chat'));
      expect(mockSetIsSidebarOpen).not.toHaveBeenCalled();
    });

    it('should not call setIsSidebarOpen when NewChat button is clicked on mobile and sidebar is initially closed', () => {
      global.innerWidth = 480;
      renderWithContext(<Header {...defaultProps} />);

      fireEvent.click(screen.getByLabelText('New Chat'));
      expect(mockSetIsSidebarOpen).not.toHaveBeenCalled();
    });
  });

  describe('Mouse click events on menu icon', () => {
    it('should call setIsSidebarOpen with true when initially closed and toggle button is clicked', () => {
      renderWithContext(<Header {...defaultProps} isSidebarOpen={false} />);

      fireEvent.click(screen.getByLabelText('Toggle Sidebar'));
      expect(mockSetIsSidebarOpen).toHaveBeenCalledWith(true);
    });

    it('should call setIsSidebarOpen with false when initially open and toggle button is clicked', () => {
      renderWithContext(<Header {...defaultProps} />);

      fireEvent.click(screen.getByLabelText('Toggle Sidebar'));
      expect(mockSetIsSidebarOpen).toHaveBeenCalledWith(false);
    });
  });

  describe('Config panel visibility toggle', () => {
    it('should show correct button text based on panel visibility', () => {
      renderWithContext(<Header {...defaultProps} />);

      expect(screen.getByText('Show Assistant Config')).toBeInTheDocument();

      // Update the context to have config panel visible
      renderWithContext(<Header {...defaultProps} />, {
        isConfigPanelVisible: true
      });

      expect(screen.getByText('Hide Assistant Config')).toBeInTheDocument();
    });

    it('should call setIsConfigPanel when config button is clicked', async () => {
      renderWithContext(<Header {...defaultProps} />, {
        isConfigPanelVisible: false,
        setIsConfigPanelVisible: mockSetIsConfigPanelVisible
      });

      const showPanelButton = screen.getByLabelText('Show AI Assistant Config');

      fireEvent.click(showPanelButton);

      expect(mockSetIsConfigPanelVisible).toHaveBeenCalledWith(true);
    });
  });

  it('Header component snapshot', () => {
    const { asFragment } = renderWithContext(<Header {...defaultProps} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
