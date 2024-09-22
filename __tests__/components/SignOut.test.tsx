import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SignOut from '@/src/components/SignOut';
// Mock the next/router module
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}));
// Import the mocked useRouter
import { useRouter } from 'next/router';
// Mock the window.localStorage
const localStorageMock = (function () {
  let store: { [key: string]: string } = {};
  return {
    getItem: function (key: string) {
      return store[key] || null;
    },
    setItem: function (key: string, value: string) {
      store[key] = value.toString();
    },
    removeItem: function (key: string) {
      delete store[key];
    },
    clear: function () {
      store = {};
    }
  };
})();
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});
describe('SignOut Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { asFragment } = render(<SignOut />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('displays the correct text', () => {
    render(<SignOut />);
    expect(screen.getByText('Log out')).toBeInTheDocument();
  });

  it('has the correct icon', () => {
    render(<SignOut />);
    const icon = document.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('calls handleSignOut when clicked', () => {
    const pushMock = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: pushMock
    });
    render(<SignOut />);
    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(localStorage.getItem('token')).toBeNull();
    expect(pushMock).toHaveBeenCalledWith('/login');
  });
});
