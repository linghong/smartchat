import React from 'react'
import { render, screen } from '@testing-library/react'
import Footer from '@/src/components/Footer'

describe('Footer component', () => {
  it('renders the footer and checks the text content', () => {
    render(<Footer />)
    const footerElement = screen.getByRole('contentinfo')
    expect(footerElement).toBeInTheDocument()
    expect(footerElement).toHaveClass('py-3 text-center opacity-40')
    expect(footerElement.textContent).toBe(
      'Chatbot responses are AI-generated and may be inaccurate, so always verify critical information.',
    )
  })

  it('matches the snapshot', () => {
    const { asFragment } = render(<Footer />)
    expect(asFragment()).toMatchSnapshot()
  })
})
