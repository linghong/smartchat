import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import Notification from '@/src/components/Notification'

describe('Notification Component', () => {
  test('renders null when message is null', () => {
    const { container } = render(<Notification message={null} />)
    expect(container.firstChild).toBeNull()
  })

  test('renders with error type correctly', () => {
    render(<Notification type="error" message="Error message" />)
    const messageElement = screen.getByText('Error message')
    expect(messageElement).toHaveClass('bold', 'text-red-600')
    expect(messageElement).toHaveAttribute('role', 'alert')
    expect(messageElement).toHaveAttribute('aria-live', 'assertive')
  })

  test('renders with loading type correctly', () => {
    render(<Notification type="loading" message="Loading message" />)
    const messageElement = screen.getByText('Loading message')
    expect(messageElement).toHaveClass('bold', 'text-gray-600')
    expect(messageElement).toHaveAttribute('role', 'status')
    expect(messageElement).toHaveAttribute('aria-live', 'assertive')
  })

  test('renders with success type correctly', () => {
    render(<Notification type="success" message="Success message" />)
    const messageElement = screen.getByText('Success message')
    expect(messageElement).toHaveClass('bold', 'text-green-600')
    expect(messageElement).toHaveAttribute('role', 'status')
    expect(messageElement).toHaveAttribute('aria-live', 'polite')
  })

  test('renders with status type correctly', () => {
    render(<Notification type="status" message="Status message" />)
    const messageElement = screen.getByText('Status message')
    expect(messageElement).toHaveClass('bold', 'text-yellow-600')
    expect(messageElement).toHaveAttribute('role', 'status')
    expect(messageElement).toHaveAttribute('aria-live', 'polite')
  })

  test('renders with default type correctly', () => {
    render(<Notification message="Default message" />)
    const messageElement = screen.getByText('Default message')
    // Check for default behavior.
    expect(messageElement).not.toHaveClass()
    expect(messageElement).toHaveAttribute('role', '')
    expect(messageElement).toHaveAttribute('aria-live', 'off')
  })

  test('Notification component snapshot', () => {
    const { asFragment } = render(<Notification message="Default message" />)

    expect(asFragment()).toMatchSnapshot()
  })
})
