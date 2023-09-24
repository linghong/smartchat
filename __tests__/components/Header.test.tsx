import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Header from '@/src/components/Header'

const pageTitle = 'Test Page Title'

describe('Header Component', () => {
  it('should render the page title correctly', () => {
    
    render(<Header pageTitle={pageTitle} />)
    
    // Check if the rendered header contains the correct page title
    expect(screen.getByText(pageTitle)).toBeInTheDocument()
    expect(screen.getByRole('heading')).toHaveTextContent(pageTitle)
  })

  it('Header component snapshot', () => {
    const { asFragment } = render(<Header pageTitle={pageTitle} />)
    expect(asFragment()).toMatchSnapshot()
  })
})