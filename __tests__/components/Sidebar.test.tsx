import React from 'react'
import { render, fireEvent, screen } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import Sidebar from '@/src/components/Sidebar'
import { useRouter } from 'next/router'


jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}))
const mockPush = jest.fn()


describe('Sidebar Component', () => {

  beforeEach(() => {
    // reset the state of all mocks to to their initial state (clears call history, 
    // instances, return values, and implementations)
    jest.resetAllMocks()

    // Must apply the type assertion before attempting to call any methods
    // Chaining method calls directly on type assertions can produce errors
    // (useRouter as jest.Mock).mockReturnValue({ push: mockPush })  --error
    const mockedUseRouter = useRouter as jest.Mock

    // Set the mock to return a specified value telling the mock that whenever useRouter() is called
    // it should return an object with a push method (mockPush)
    mockedUseRouter.mockReturnValue({ push: mockPush })

    act(() => {
      render(<Sidebar />)
    })
  })

  test('renders Sidebar component with all expected elements', () => {
    expect(screen.getByText('New Chat')).toBeInTheDocument()
    expect(screen.getByText('Manage My AI')).toBeInTheDocument()
    expect(screen.getByText('Finetune AI Model')).toBeInTheDocument()
    expect(screen.getByText('Chat with AI')).toBeInTheDocument()
  })

  test('initially renders child menu items correctly based on defaultOpen state', () => {
    expect(screen.queryByText('File1')).toBeNull()
    expect(screen.queryByText('My Model1')).toBeNull()
    expect(screen.getByText('Chat 1')).toBeInTheDocument() // Visible because defaultOpen is true
  })

  test('Clicking onNewChat button navigate to the home page', async () => {
    await act(async () => {
      const newChatDiv = document.querySelector('#newChatDiv')
      fireEvent.click(newChatDiv)
    })
    expect(mockPush).toHaveBeenCalledTimes(1)
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  test('hovering over New Chat should show visual feedback', async () => {
    const newChatButton = document.querySelector('#newChat')
    expect(newChatButton.className).toMatch(/hover/)
  })

  test('focusing on New Chat should change its background color', async () => {
    const newChatButton = document.querySelector('#newChat')
    expect(newChatButton.className).toMatch(/focus/)
  })

  test('Each menuItem has the correct href', () => {
    const manageMyAILink = screen.getByText('Manage My AI').closest('a')
    expect(manageMyAILink).toHaveAttribute('href', '/managemyai')

    const finetuneModelLink = screen.getByText('Finetune AI Model').closest('a')
    expect(finetuneModelLink).toHaveAttribute('href', '/finetunemodel')

    const chatWithAILink = screen.getByText('Chat with AI').closest('a')
    expect(chatWithAILink).toHaveAttribute('href', '/')
  })

  test('Sidebar component matches snapshot', () => {
    act(() => {
      const { asFragment } = render(<Sidebar />)
      expect(asFragment()).toMatchSnapshot()
    })
  })
})
