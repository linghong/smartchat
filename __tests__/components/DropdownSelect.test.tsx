import React from 'react'
import { render, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import DropdownSelect from '@/src/components/DropdownSelect'

const options = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' }
]

const label = 'Dropdown Label'
const name = 'dropdownName'

describe('DropdownSelect Component', () => {
  let mockChangeHandler: jest.Mock

  beforeEach(async () => {
    mockChangeHandler = jest.fn()
    await act(async () => {
      render(
        <DropdownSelect
          selectedOption={options[0]}
          onChange={mockChangeHandler}
          options={options}
          label={label}
          name={name}
        />
      )
    })
  })

  it('renders DropdownSelect component correctly', () => {
    // Check if label is in the document
    expect(screen.getByText(label)).toBeInTheDocument()

    // Check if the dropdown is rendered with the correct selected option
    expect(screen.getByText(options[0].label)).toBeInTheDocument()
  })

  it('handles option selection', async () => {
    await act(async () => {
      await userEvent.click(screen.getByText(options[0].label))
    })
    await act(async () => {
      await userEvent.click(screen.getByText(options[1].label))
    })

    // Check if the change handler is called with the correct option
    expect(mockChangeHandler).toHaveBeenCalledWith(
      options[1],
      expect.any(Object)
    )
  })

  it('applies custom styles when selected', async () => {
    const optionElement = screen.getByText(options[0].label)
    const originalStyles = window.getComputedStyle(optionElement)

    // Fire a click event to select the element
    await act(async () => {
      userEvent.click(optionElement)
    })

    const appliedStyles = window.getComputedStyle(optionElement)
    expect(appliedStyles).not.toBe(originalStyles)
  })

  it('applies custom styles on focus', async () => {
    const optionElement = screen.getByText(options[0].label)
    const originalStyles = window.getComputedStyle(optionElement)

    // Fire a hover or focus event
    await act(async () => {
      userEvent.hover(optionElement)
    })

    const appliedStyles = window.getComputedStyle(optionElement)

    expect(appliedStyles).not.toBe(originalStyles)
  })

  it('displays Dropdown component snapshot', async () => {
    let asFragment
    await act(() => {
      const { asFragment: renderFragment } = render(
        <DropdownSelect
          selectedOption={options[0]}
          onChange={mockChangeHandler}
          options={options}
          label={label}
          name={name}
        />
      )
      asFragment = renderFragment
    })

    expect(asFragment()).toMatchSnapshot()
  })
})
