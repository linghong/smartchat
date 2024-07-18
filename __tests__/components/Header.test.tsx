import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/router';

import Header from '@/src/components/Header';

jest.mock('next/router', () => ({
  useRouter: jest.fn()
}));

const setIsSidebarOpen = jest.fn();
const setIsConfigPanelVisible = jest.fn();
const mockPush = jest.fn();

describe('Header Component', () => {
  beforeEach(() => {
    // Reset the mock before each test
    (useRouter as jest.Mock).mockReturnValue({
      pathname: '/',
      push: mockPush
    });
    setIsSidebarOpen.mockClear();
    setIsConfigPanelVisible.mockClear();
    mockPush.mockClear();
  });

  it('should render the page title correctly', () => {
    render(
      <Header
        isSidebarOpen={true}
        setIsSidebarOpen={setIsSidebarOpen}
        isConfigPanelVisible={false}
        setIsConfigPanelVisible={setIsConfigPanelVisible}
      />
    );

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

      render(
        <Header
          isSidebarOpen={true}
          setIsSidebarOpen={setIsSidebarOpen}
          isConfigPanelVisible={false}
          setIsConfigPanelVisible={setIsConfigPanelVisible}
        />
      );

      expect(screen.getByText(title)).toBeInTheDocument();
    });
  });

  describe('Mouse focusing and hovering events', () => {
    beforeEach(() => {
      render(
        <Header
          isSidebarOpen={true}
          setIsSidebarOpen={setIsSidebarOpen}
          isConfigPanelVisible={false}
          setIsConfigPanelVisible={setIsConfigPanelVisible}
        />
      );
    });

    it('should change its background color when focusing on menu button and sidebar is open', async () => {
      const menuIcon = screen.getByLabelText('Toggle Sidebar');
      expect(menuIcon?.className).toMatch(/focus/);
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
      render(
        <Header
          isSidebarOpen={true}
          setIsSidebarOpen={setIsSidebarOpen}
          isConfigPanelVisible={false}
          setIsConfigPanelVisible={setIsConfigPanelVisible}
        />
      );

      fireEvent.click(screen.getByLabelText('New Chat'));
      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith('/');
    });

    it('should not call setIsSidebarOpen when NewChat button is clicked on mobile and sidebar is initially open', () => {
      global.innerWidth = 480;
      render(
        <Header
          isSidebarOpen={true}
          setIsSidebarOpen={setIsSidebarOpen}
          isConfigPanelVisible={false}
          setIsConfigPanelVisible={setIsConfigPanelVisible}
        />
      );

      fireEvent.click(screen.getByLabelText('New Chat'));
      // Because router.push('/') is called instead
      expect(setIsSidebarOpen).not.toHaveBeenCalled();
    });

    it('should not call setIsSidebarOpen when NewChat button is clicked on desktop and sidebar is initially open', () => {
      global.innerWidth = 1024;
      render(
        <Header
          isSidebarOpen={false}
          setIsSidebarOpen={setIsSidebarOpen}
          isConfigPanelVisible={false}
          setIsConfigPanelVisible={setIsConfigPanelVisible}
        />
      );

      fireEvent.click(screen.getByLabelText('New Chat'));
      expect(setIsSidebarOpen).not.toHaveBeenCalled();
    });

    it('should not call setIsSidebarOpen when NewChat button is clicked on desktop and sidebar is initially closed', () => {
      global.innerWidth = 1024;
      render(
        <Header
          isSidebarOpen={false}
          setIsSidebarOpen={setIsSidebarOpen}
          isConfigPanelVisible={false}
          setIsConfigPanelVisible={setIsConfigPanelVisible}
        />
      );

      fireEvent.click(screen.getByLabelText('New Chat'));
      expect(setIsSidebarOpen).not.toHaveBeenCalled();
    });

    it('should not call setIsSidebarOpen when NewChat button is clicked on mobile and sidebar is initially closed', () => {
      global.innerWidth = 480;
      render(
        <Header
          isSidebarOpen={false}
          setIsSidebarOpen={setIsSidebarOpen}
          isConfigPanelVisible={false}
          setIsConfigPanelVisible={setIsConfigPanelVisible}
        />
      );

      fireEvent.click(screen.getByLabelText('New Chat'));
      expect(setIsSidebarOpen).not.toHaveBeenCalled();
    });
  });

  describe('Mouse click events on menu icon', () => {
    it('should call setIsSidebarOpen with true when initially closed and toggle button is clicked', () => {
      render(
        <Header
          isSidebarOpen={false}
          setIsSidebarOpen={setIsSidebarOpen}
          isConfigPanelVisible={false}
          setIsConfigPanelVisible={setIsConfigPanelVisible}
        />
      );

      fireEvent.click(screen.getByLabelText('Toggle Sidebar'));
      expect(setIsSidebarOpen).toHaveBeenCalledWith(true);
    });

    it('should call setIsSidebarOpen with false when initially open and toggle button is clicked', () => {
      render(
        <Header
          isSidebarOpen={true}
          setIsSidebarOpen={setIsSidebarOpen}
          isConfigPanelVisible={false}
          setIsConfigPanelVisible={setIsConfigPanelVisible}
        />
      );

      fireEvent.click(screen.getByLabelText('Toggle Sidebar'));
      expect(setIsSidebarOpen).toHaveBeenCalledWith(false);
    });
  });

  describe('Config panel visibility toggle', () => {
    it('should toggle panel visibility when config button is clicked', () => {
      render(
        <Header
          isSidebarOpen={false}
          setIsSidebarOpen={setIsSidebarOpen}
          isConfigPanelVisible={false}
          setIsConfigPanelVisible={setIsConfigPanelVisible}
        />
      );

      fireEvent.click(screen.getByLabelText('Show Config'));
      expect(setIsConfigPanelVisible).toHaveBeenCalledWith(true);
    });

    it('should show correct button text based on panel visibility', () => {
      const { rerender } = render(
        <Header
          isSidebarOpen={false}
          setIsSidebarOpen={setIsSidebarOpen}
          isConfigPanelVisible={false}
          setIsConfigPanelVisible={setIsConfigPanelVisible}
        />
      );

      expect(screen.getByText('Show AI Assistant Config')).toBeInTheDocument();

      rerender(
        <Header
          isSidebarOpen={false}
          setIsSidebarOpen={setIsSidebarOpen}
          isConfigPanelVisible={true}
          setIsConfigPanelVisible={setIsConfigPanelVisible}
        />
      );

      expect(screen.getByText('Hide AI Assistant Config')).toBeInTheDocument();
    });
  });

  it('Header component snapshot', () => {
    const { asFragment } = render(
      <Header
        isSidebarOpen={true}
        setIsSidebarOpen={setIsSidebarOpen}
        isConfigPanelVisible={false}
        setIsConfigPanelVisible={setIsConfigPanelVisible}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
