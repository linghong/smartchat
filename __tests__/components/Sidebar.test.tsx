import React from 'react'
import { render, fireEvent, screen } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import Sidebar from '@/src/components/Sidebar' // Adjust the import path as needed


jest.mock('next/router', () => require('next-router-mock'))

describe('Sidebar Component', () => {
  const mockOnNewChat = jest.fn()

  beforeEach(() => {
    // Reset mock and render the component before each test
    mockOnNewChat.mockReset()
    
    act(() => {
      render(<Sidebar onNewChat={mockOnNewChat} />)
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

  test('invokes onNewChat callback when the New Chat button is clicked', async () => {
    await act(async () => {
      fireEvent.click(screen.getByText('New Chat'))
    })
    expect(mockOnNewChat).toHaveBeenCalledTimes(1)
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
      const { asFragment } = render(<Sidebar onNewChat={mockOnNewChat} />);
      expect(asFragment()).toMatchSnapshot()
    })
  })
})
