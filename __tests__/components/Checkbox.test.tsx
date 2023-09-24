import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Checkbox from '@/src/components/Checkbox'

describe('Checkbox Component', () => {
  let setIsChecked: jest.Mock
  
  beforeEach(() => {
    setIsChecked = jest.fn()
    render(<Checkbox label="Check me" setIsChecked={setIsChecked} />)
  })

  afterEach(() => {
    setIsChecked.mockClear();
  })

  it('renders Checkbox component correctly', () => {
    expect(screen.getByText('Check me')).toBeInTheDocument()
    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })

  it('handles checkbox change', () => {
    fireEvent.click(screen.getByRole('checkbox'))
    expect(setIsChecked).toHaveBeenCalledWith(true)
  })

  it('Checkbox component snapshot', () => {
    const { asFragment } =  render(<Checkbox label="Check me" setIsChecked={setIsChecked} />)
    expect(asFragment()).toMatchSnapshot()
  })
})