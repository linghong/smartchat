import React from 'react'
import { render, fireEvent, screen } from '@testing-library/react'
import { useRouter } from 'next/router'

import MenuItem from '@/src/components/MenuItem'

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}))

describe('MenuItem Component', () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    const mockedUseRouter = useRouter as jest.Mock
    mockedUseRouter.mockReturnValue({
      pathname: '/current-path', // Set the current path for the router mock
      push: mockPush,
    })
  })

  test('renders MenuItem component with the title and link', () => {
    render(
      <MenuItem
        title="Test Title"
        link="/test-link"
        itemList={['Item 1', 'Item 2']}
      />,
    )

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test Title')).toHaveAttribute('href', '/test-link')
  })

  test('renders MenuItem component with item list and toggles correctly', () => {
    render(<MenuItem title="Test Title" itemList={['Item 1', 'Item 2']} />)

    // Ensure the item list is not visible initially
    expect(screen.queryByText('Item 1')).toBeNull()
    expect(screen.queryByText('Item 2')).toBeNull()

    // Click to toggle the item list
    fireEvent.click(screen.getByRole('button'))

    // Ensure the item list is visible after toggling
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
  })

  test('applies active class when the link matches the current pathname', () => {
    render(
      <MenuItem
        title="Test Title"
        link="/current-path"
        itemList={['Item 1', 'Item 2']}
      />,
    )

    const menuItem = screen.getByText('Test Title').parentElement
    expect(menuItem).toHaveClass('bg-slate-400 text-indigo-200 rounded-sm')
  })

  test('does not apply active class when the link does not match the current pathname', () => {
    render(
      <MenuItem
        title="Test Title"
        link="/other-path"
        itemList={['Item 1', 'Item 2']}
      />,
    )

    const menuItem = screen.getByText('Test Title').parentElement
    expect(menuItem).not.toHaveClass('bg-slate-500 text-indigo-200 rounded-sm')
  })

  test('renders MenuItem component with default open state', () => {
    render(
      <MenuItem
        title="Test Title"
        itemList={['Item 1', 'Item 2']}
        defaultOpen={true}
      />,
    )

    // Ensure the item list is visible initially due to defaultOpen
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
  })

  test('it has hover and focus classes', () => {
    render(<MenuItem title="Test Title" itemList={['Item 1', 'Item 2']} />)
    const menuItem = screen.getByText('Test Title').parentElement
    expect(menuItem).toHaveClass('hover:bg-slate-500')
    expect(menuItem).toHaveClass('focus:bg-indigo-100')
  })

  test('MenuItem component matches snapshot', () => {
    const { asFragment } = render(
      <MenuItem
        title="Test Title"
        link="/test-link"
        itemList={['Item 1', 'Item 2']}
      />,
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
