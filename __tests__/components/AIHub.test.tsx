import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AIHub from '@/src/components/AIHub';

// Mock the next/link component
jest.mock('next/link', () => {
  const MockLink = ({ children, ...rest }: any) => {
    return <a {...rest}>{children}</a>;
  };
  MockLink.displayName = 'MockLink';
  return MockLink;
});

describe('AIHub Component', () => {
  it('renders the AIHub button', () => {
    render(<AIHub />);
    const button = screen.getByRole('button', { name: /AI Hub/i });
    expect(button).toBeInTheDocument();
  });

  it('initially renders with the menu closed', () => {
    render(<AIHub />);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('opens the menu when the button is clicked', () => {
    render(<AIHub />);
    const button = screen.getByRole('button', { name: /AI Hub/i });
    fireEvent.click(button);
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('closes the menu when the button is clicked again', () => {
    render(<AIHub />);
    const button = screen.getByRole('button', { name: /AI Hub/i });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('renders all links when the menu is open', () => {
    render(<AIHub />);
    const button = screen.getByRole('button', { name: /AI Hub/i });
    fireEvent.click(button);
    expect(screen.getByText('Model List')).toBeInTheDocument();
    expect(screen.getByText('Prompt Templates')).toBeInTheDocument();
  });

  it('applies the correct classes when the menu is open', () => {
    render(<AIHub />);
    const button = screen.getByRole('button', { name: /AI Hub/i });
    fireEvent.click(button);
    const container = button.closest('div');
    expect(container).toHaveClass('bg-slate-300');
  });

  it('applies the correct classes when the menu is closed', () => {
    render(<AIHub />);
    const button = screen.getByRole('button', { name: /AI Hub/i });
    const container = button.closest('div');
    expect(container).toHaveClass('bg-slate-400');
  });

  it('renders the correct icon when the menu is open', () => {
    render(<AIHub />);
    const button = screen.getByRole('button', { name: /AI Hub/i });
    fireEvent.click(button);
    const icon = button.querySelector('svg[aria-label="caret-down"]');
    expect(icon).toBeInTheDocument();
  });

  it('renders the correct icon when the menu is closed', () => {
    render(<AIHub />);
    const button = screen.getByRole('button', { name: /AI Hub/i });
    const icon = button.querySelector('svg[aria-label="caret-up"]');
    expect(icon).toBeInTheDocument();
  });

  it('sets the correct aria attributes on the button', () => {
    render(<AIHub />);
    const button = screen.getByRole('button', { name: /AI Hub/i });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveAttribute('aria-controls', 'ai-hub-menu');
  });

  it('updates aria-expanded when the menu is toggled', () => {
    render(<AIHub />);
    const button = screen.getByRole('button', { name: /AI Hub/i });
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders links with correct attributes', () => {
    render(<AIHub />);
    const button = screen.getByRole('button', { name: /AI Hub/i });
    fireEvent.click(button);
    const links = screen.getAllByRole('menuitem');
    expect(links).toHaveLength(2);
    links.forEach(link => {
      expect(link).toHaveAttribute('href', '#');
      expect(link).not.toHaveAttribute('target');
      expect(link).not.toHaveAttribute('rel');
    });
  });

  it('matches snapshot when closed', () => {
    const { asFragment } = render(<AIHub />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('matches snapshot when open', () => {
    const { asFragment } = render(<AIHub />);
    const button = screen.getByRole('button', { name: /AI Hub/i });
    fireEvent.click(button);
    expect(asFragment()).toMatchSnapshot();
  });
});
