import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ButtonWithTooltip from '@/src/components/ButtonWithTooltip';

describe('ButtonWithTooltip', () => {
  const mockOnClick = jest.fn();
  const defaultProps = {
    icon: <span>🔍</span>,
    onClick: mockOnClick,
    ariaLabel: 'Search',
    tooltipText: 'Click to search',
    isDisabled: false,
    tooltipDisabledText: 'Search is disabled'
  };

  it('renders the button with the provided icon', () => {
    render(<ButtonWithTooltip {...defaultProps} />);
    const button = screen.getByRole('button', { name: 'Search' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('🔍');
  });

  it('calls onClick when the button is clicked', () => {
    render(<ButtonWithTooltip {...defaultProps} />);
    const button = screen.getByRole('button', { name: 'Search' });
    fireEvent.click(button);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('disables the button when isDisabled is true', () => {
    render(<ButtonWithTooltip {...defaultProps} isDisabled={true} />);
    const button = screen.getByRole('button', { name: 'Search' });
    expect(button).toBeDisabled();
  });

  it('renders the correct tooltip text when not disabled', () => {
    render(<ButtonWithTooltip {...defaultProps} />);
    const tooltip = screen.getByText('Click to search');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveClass('hidden');
  });

  it('renders the correct tooltip text when disabled', () => {
    render(<ButtonWithTooltip {...defaultProps} isDisabled={true} />);
    const tooltip = screen.getByText('Search is disabled');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveClass('hidden');
  });

  it('applies the correct CSS classes to the button', () => {
    render(<ButtonWithTooltip {...defaultProps} />);
    const button = screen.getByRole('button', { name: 'Search' });
    expect(button).toHaveClass('flex', 'items-center', 'justify-center', 'font-bold', 'rounded', 'cursor-pointer');
  });

  it('applies the disabled CSS class when isDisabled is true', () => {
    render(<ButtonWithTooltip {...defaultProps} isDisabled={true} />);
    const button = screen.getByRole('button', { name: 'Search' });
    expect(button).toHaveClass('disabled:cursor-not-allowed');
  });

  it('renders the tooltip with the correct CSS classes', () => {
    render(<ButtonWithTooltip {...defaultProps} />);
    const tooltip = screen.getByText('Click to search');
    expect(tooltip).toHaveClass(
      'absolute', 'top-full', 'left-1/2', 'transform', '-translate-x-1/2', 'mt-4',
      'hidden', 'group-hover:block', 'bg-gray-100', 'text-black', 'text-xs',
      'rounded', 'py-1', 'px-5', 'whitespace-nowrap'
    );
  });

  it('Should match component snapshot', () => {
    const { asFragment } = render(
      <ButtonWithTooltip {...defaultProps} />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});