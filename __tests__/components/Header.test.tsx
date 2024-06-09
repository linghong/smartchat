import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useRouter } from 'next/router'

import Header from '@/src/components/Header'

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}))

const setIsSidebarOpen = jest.fn()

describe('Header Component', () => {
  beforeEach(() => {
    // Reset the mock before each test
    (useRouter as jest.Mock).mockReturnValue({
      pathname: '/',
      push: jest.fn(),
    })
    setIsSidebarOpen.mockClear()
  })

  it('should render the page title correctly', () => {
    render(<Header isSidebarOpen={true} setIsSidebarOpen={setIsSidebarOpen} />)

    // Check if the rendered header contains the correct page title
    expect(screen.getByText('Chat With AI')).toBeInTheDocument()
    expect(screen.getByRole('heading')).toHaveTextContent('Chat With AI')
  })

  it('should render different page titles based on pathname', () => {
    const paths = [
      { path: '/', title: 'Chat With AI' },
      { path: '/finetunemodel', title: 'Finetune AI Model' },
      { path: '/managemyai', title: 'Manage RAG Files' },
    ]

    paths.forEach(({ path, title }) => {
      (useRouter as jest.Mock).mockReturnValue({
        pathname: path,
        push: jest.fn()
      })

      render(<Header isSidebarOpen={true} setIsSidebarOpen={setIsSidebarOpen} />)

      const headings = screen.getAllByRole('heading')

      expect(headings.some(heading => heading.textContent === title)).toBe(true)
    })
  })

  it('should call setIsSidebarOpen when NewChat button is clicked on mobile', () => {
    global.innerWidth = 480
    render(<Header isSidebarOpen={true} setIsSidebarOpen={setIsSidebarOpen} />)

    // Simulate NewChat button clicks
    fireEvent.click(screen.getByLabelText('New Chat'))
    expect(setIsSidebarOpen).toHaveBeenCalledWith(false) // Because router.push('/') is called instead
  })

  it('should not call setIsSidebarOpen when NewChat button is clicked on desktop', () => {

    global.innerWidth = 1024
    render(<Header isSidebarOpen={true} setIsSidebarOpen={setIsSidebarOpen} />)

    // Simulate NewChat button clicks
    fireEvent.click(screen.getByLabelText('New Chat'))
    expect(setIsSidebarOpen).not.toHaveBeenCalled()
  })

  it('should call setIsSidebarOpen with false when initially open and toggle button is clicked', () => {

    render(<Header isSidebarOpen={true} setIsSidebarOpen={setIsSidebarOpen} />)

    // Simulate SidebarMenu button clicks
    fireEvent.click(screen.getByLabelText('Toggle Sidebar'))
    expect(setIsSidebarOpen).toHaveBeenCalledWith(false)
  })

  it('should call setIsSidebarOpen with true when initially closed and toggle button is clicked', () => {

    render(<Header isSidebarOpen={false} setIsSidebarOpen={setIsSidebarOpen} />)

    // Simulate button clicks
    fireEvent.click(screen.getByLabelText('Toggle Sidebar'))
    expect(setIsSidebarOpen).toHaveBeenCalledWith(true)
  })

  it('Header component snapshot', () => {

    const { asFragment } = render(<Header isSidebarOpen={true} setIsSidebarOpen={setIsSidebarOpen} />)
    expect(asFragment()).toMatchSnapshot()
  })
})