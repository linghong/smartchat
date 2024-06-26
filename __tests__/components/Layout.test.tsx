import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';

import Layout from '@/src/components/Layout';

// Mock Header component, default sidebar is open
// When Header is clicked, the sidebar will be closed
jest.mock('@/src/components/Header', () => {
  return {
    __esModule: true,
    default: ({
      setIsSidebarOpen
    }: {
      setIsSidebarOpen: (isOpen: boolean) => void;
    }) => <div onClick={() => setIsSidebarOpen(false)}>Header Mock</div>
  };
});

// Mock Sidebar component
jest.mock('@/src/components/Sidebar', () => {
  return {
    __esModule: true,
    default: () => <div>Sidebar Mock</div>
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
  beforeEach(() => {
    // Reset the viewport size before each test
    global.innerWidth = 1024;
    global.dispatchEvent(new Event('resize'));
  });

  it('renders Header, Sidebar (conditionally), and Footer correctly on initial load', () => {
    const messageSubjectList = ['Test Subject'];
    const { getByText } = render(
      <Layout messageSubjectList={messageSubjectList}>
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
    const messageSubjectList = ['Test Subject'];
    const { getByText, queryByText } = render(
      <Layout messageSubjectList={messageSubjectList}>
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
    const messageSubjectList = ['Test Subject'];
    const { getByText, queryByText } = render(
      <Layout messageSubjectList={messageSubjectList}>
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
});
