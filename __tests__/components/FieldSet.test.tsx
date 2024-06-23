import { render } from '@testing-library/react'
import '@testing-library/jest-dom'

import FieldSet from '@/src/components/FieldSet'

describe('FieldSet Component', () => {
  test('renders children correctly', () => {
    const { getByText } = render(
      <FieldSet>
        <p>Test Child</p>
      </FieldSet>
    )

    expect(getByText('Test Child')).toBeInTheDocument()
  })

  test('applies correct classes', () => {
    const { container } = render(
      <FieldSet>
        <p>Test Child</p>
      </FieldSet>
    )

    expect(container.firstChild).toHaveClass('flex')
    expect(container.firstChild).toHaveClass('flex-col')
    expect(container.firstChild).toHaveClass('bg-slate-50')
    expect(container.firstChild).toHaveClass('shadow-md')
    expect(container.firstChild).toHaveClass('rounded')
  })

  test('matches the snapshot', () => {
    const { asFragment } = render(
      <FieldSet>
        <p>Test Child</p>
      </FieldSet>
    )

    expect(asFragment()).toMatchSnapshot()
  })
})
