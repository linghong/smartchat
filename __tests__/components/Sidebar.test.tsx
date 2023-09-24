import React from 'react'
import { render, screen, fireEvent, RenderResult } from '@testing-library/react'
import '@testing-library/jest-dom'
import Sidebar from '@/src/components/Sidebar' 

describe('Sidebar Component', () => {
  
  let mockOnNewChat: jest.Mock
  let renderedComponent : RenderResult
  
  beforeEach(() => {
    mockOnNewChat = jest.fn()
    renderedComponent = render(<Sidebar onNewChat={mockOnNewChat} />)
  })

  test('renders Sidebar component', () => {
    expect(screen.getByText('New Chat')).toBeInTheDocument()
    expect(screen.getByText('Manage My AI')).toBeInTheDocument()
    expect(screen.getByText('Finetune AI Model')).toBeInTheDocument()
    expect(screen.getByText('Chat with AI')).toBeInTheDocument()
  })

  test('calls onNewChat when New Chat is clicked', () => {
    fireEvent.click(screen.getByText('New Chat'))
    expect(mockOnNewChat).toHaveBeenCalledTimes(1)
  })

  test('renders navigation links with correct href', () => {
    expect(screen.getByText('Manage My AI').closest('a')).toHaveAttribute('href', '/managemyai')
    expect(screen.getByText('Finetune AI Model').closest('a')).toHaveAttribute('href', '/finetunemodel')
    expect(screen.getByText('Chat with AI').closest('a')).toHaveAttribute('href', '/')
  })

  test('hovering over items should change their background color', () => {
    const chat1 = screen.getByText('Chat 1')
    expect(chat1.className).toMatch(/hover/)
  })

  test('focusing on items should change their background color', () => {
    const chat2 = screen.getByText('Chat 2')
    expect(chat2.className).toMatch(/focus/)
  })

  test('Sidebar component snapshot', () => {
    expect(renderedComponent.asFragment()).toMatchSnapshot()
  })
})