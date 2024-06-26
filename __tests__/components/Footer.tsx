import React from 'react';
import { render, screen } from '@testing-library/react';

import Footer from '@/src/components/Footer';

describe('Footer component', () => {
  it('renders the footer and checks the text content', () => {
    render(<Footer />);
    const footerElement = screen.getByRole('contentinfo');
    expect(footerElement).toBeInTheDocument();
    expect(footerElement).toHaveClass('py-2 text-center opacity-40 text-sm');
    expect(footerElement.textContent).toBe(
      'AI-generated responses may be inaccurate. Verify critical information.'
    );
  });

  it('matches the snapshot', () => {
    const { asFragment } = render(<Footer />);
    expect(asFragment()).toMatchSnapshot();
  });
});
