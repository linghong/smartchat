import React, { cloneElement } from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import Layout from '@/src/components/Layout';
import { OptionType } from '@/src/types/common';
import { useRouter } from 'next/router';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}));

// Mock Header component
jest.mock('@/src/components/Header', () => {
  return {
    __esModule: true,
    default: ({
      setIsSidebarOpen
    }: {
      setIsSidebarOpen: (isOpen: boolean) => void;
    }) => (
      <div data-testid="header-mock" onClick={() => setIsSidebarOpen(false)}>
        Header Mock
      </div>
    )
  };
});

// Mock Footer component
jest.mock('@/src/components/Footer', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="footer-mock">Footer Mock</div>
  };
});

describe('Layout Component', () => {
  const defaultProps = {
    namespacesList: null
  };

  beforeEach(() => {
    // Reset the viewport size before each test
    global.innerWidth = 1024;
    global.dispatchEvent(new Event('resize'));

    // Mock useRouter return value
    (useRouter as jest.Mock).mockReturnValue({
      route: '/',
      pathname: '/',
      query: '',
      asPath: '/'
    });
  });

  it('renders Header and Footer correctly on initial load', () => {
    const { getByTestId, getByText } = render(
      <Layout {...defaultProps}>
        <div>Child Content</div>
      </Layout>
    );

    expect(getByTestId('header-mock')).toBeInTheDocument();
    expect(getByTestId('footer-mock')).toBeInTheDocument();
    expect(getByText('Child Content')).toBeInTheDocument();
  });

  it('adjusts layout for mobile view when Header menu is clicked', () => {
    const { getByTestId, getAllByText, queryByTestId } = render(
      <Layout {...defaultProps}>
        <div>Child Content</div>
      </Layout>
    );

    // Simulate mobile view
    act(() => {
      global.innerWidth = 480;
      global.dispatchEvent(new Event('resize'));
    });

    // Click the header to close the sidebar
    fireEvent.click(getByTestId('header-mock'));

    // In mobile view, there should be only one instance of the child content
    expect(getAllByText('Child Content')).toHaveLength(1);
    expect(queryByTestId('footer-mock')).toBeInTheDocument();
  });

  it('renders correct layout in desktop mode', () => {
    const { getByTestId, getByText } = render(
      <Layout {...defaultProps}>
        <div>Child Content</div>
      </Layout>
    );

    expect(getByTestId('header-mock')).toBeInTheDocument();
    expect(getByText('Child Content')).toBeInTheDocument();
    expect(getByTestId('footer-mock')).toBeInTheDocument();
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
