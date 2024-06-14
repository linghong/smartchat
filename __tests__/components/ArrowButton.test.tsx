import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import ArrowButton from '@/src/components/ArrowButton'

describe('ArrowButton Component', () => {
  test('has correct attributes when enabled', () => {
    const { getByRole } = render(<ArrowButton disabled={false} />)
    const button = getByRole('button')

    expect(button).not.toHaveAttribute('disabled')
    expect(button).toHaveClass('opacity-60')
    expect(button).toHaveClass('hover:stone-600')
    expect(button).toHaveClass('disabled:cursor-not-allowed')
  })

  test('has correct attributes when disabled', () => {
    const { getByRole } = render(<ArrowButton disabled={true} />)
    const button = getByRole('button')
    expect(button).toHaveClass('opacity-60')
    expect(button).toHaveClass('hover:stone-600')
    expect(button).toHaveClass('disabled:cursor-not-allowed')
  })

  test('renders SVG with correct attributes', () => {
    const { container } = render(<ArrowButton disabled={false} />)
    const svg = container.querySelector('svg')
    const title = container.querySelector('svg title')

    expect(svg).toHaveAttribute('viewBox', '0 0 18 18')
    expect(title).toHaveTextContent('Arrow Submit Button')
  })

  test('renders correctly and matches the snapshot when enabled', () => {
    const { asFragment } = render(<ArrowButton disabled={false} />)
    expect(asFragment()).toMatchSnapshot()
  })
})
