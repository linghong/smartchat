import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PlusIcon from '@/src/components/PlusIcon';

describe('PlusIcon', () => {
  it('should render the PlusIcon', () => {
    render(<PlusIcon />);
    const svgElement = document.querySelector('[data-id="plus-icon"]');
    expect(svgElement).toBeInTheDocument();
  });

  it('should match snapshot', () => {
    const { asFragment } = render(<PlusIcon />);
    expect(asFragment()).toMatchSnapshot();
  });
});