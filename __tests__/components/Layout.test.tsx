import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';

import Layout from '@/src/components/Layout';

// Mock Header component, default sidebar is open
// When Header is clicked, the sidebar will be closed
jest.mock('@/src/components/Header', () => {
  return {
    __esModule: true,
    default: ({
      setIsSidebarOpen,
      isConfigPanelVisible,
      setIsConfigPanelVisible
    }: {
      isSidebarOpen: boolean;
      setIsSidebarOpen: (isOpen: boolean) => void;
      isConfigPanelVisible: boolean;
      setIsConfigPanelVisible: (isVisible: boolean) => void;
    }) => <div onClick={() => setIsSidebarOpen(false)}>Header Mock</div>
  };
});

// Mock Sidebar component
jest.mock('@/src/components/Sidebar', () => {
  return {
    __esModule: true,
    default: ({
      setIsSidebarOpen,
      namespacesList,
      chatId,
      setChatId,
      setChatHistory,
      setImageSrcHistory,
      setIsConfigPanelVisible
    }: {
      setIsSidebarOpen: (isOpen: boolean) => void;
      namespacesList: any[] | null;
      chatId: string | null;
      setChatId: (chatId: string | null) => void;
      setChatHistory: (chatHistory: any[]) => void;
      setImageSrcHistory: (ImageSrcHistory: any[][]) => void;
      setIsConfigPanelVisible: (isVisible: boolean) => void;
    }) => <div>Sidebar Mock</div>
  };
});

// Mock Footer component
jest.mock('@/src/components/Footer', () => {
  return {
    __esModule: true,
    default: () => <div>Footer Mock</div>
  };
});

describe('Layout Component', () => {
  const defaultProps = {
    isConfigPanelVisible: false,
    setIsConfigPanelVisible: jest.fn(),
    namespacesList: null,
    chatId: '0',
    setChatId: jest.fn(),
    setChatHistory: jest.fn(),
    setImageSrcHistory: jest.fn()
  };

  beforeEach(() => {
    // Reset the viewport size before each test
    global.innerWidth = 1024;
    global.dispatchEvent(new Event('resize'));
  });

  it('renders Header, Sidebar (conditionally), and Footer correctly on initial load', () => {
    const { getByText } = render(
      <Layout {...defaultProps}>
        <div>Child Content</div>
      </Layout>
    );

    // Check for Header and Footer
    expect(getByText('Header Mock')).toBeInTheDocument();
    expect(getByText('Footer Mock')).toBeInTheDocument();

    // Sidebar should be visible by default in desktop mode (mock as desktop initially if not specified)
    expect(getByText('Sidebar Mock')).toBeInTheDocument();

    // Check that child content is rendered
    expect(getByText('Child Content')).toBeInTheDocument();
  });

  it('does not render Sidebar when it is in mobile mode and Header menu is clicked to be closed', () => {
    const { getByText, queryByText } = render(
      <Layout {...defaultProps}>
        <div>Child Content</div>
      </Layout>
    );

    // Simulate mobile view
    act(() => {
      global.innerWidth = 480;
      global.dispatchEvent(new Event('resize'));
    });

    act(() => {
      fireEvent.click(getByText('Header Mock'));
    });

    expect(queryByText('Sidebar Mock')).not.toBeInTheDocument();
    expect(getByText('Child Content')).toBeInTheDocument();
  });

  it('renders Sidebar in mobile mode when sidebar is open', () => {
    const { getByText, queryByText } = render(
      <Layout {...defaultProps}>
        <div>Child Content</div>
      </Layout>
    );

    act(() => {
      global.innerWidth = 480;
      global.dispatchEvent(new Event('resize'));
    });

    expect(getByText('Sidebar Mock')).toBeInTheDocument();
    expect(queryByText('Child Content')).not.toBeInTheDocument();
  });

  it('should match Layout component snapshot', () => {
    const { asFragment } = render(
      <Layout {...defaultProps}>
        <div>Child Content</div>
      </Layout>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
