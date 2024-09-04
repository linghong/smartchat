import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import CustomSelect from '@/src/components/CustomSelect';
const mockOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' }
];
describe('CustomSelect', () => {
  const mockOnChange = jest.fn();
  beforeEach(() => {
    mockOnChange.mockClear();
  });
  it('renders with placeholder when no value is selected', () => {
    render(
      <CustomSelect
        id="test-select"
        options={mockOptions}
        value=""
        onChange={mockOnChange}
        placeholder="Select an option"
      />
    );
    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });
  it('renders with selected value when provided', () => {
    render(
      <CustomSelect
        id="test-select"
        options={mockOptions}
        value="option2"
        onChange={mockOnChange}
      />
    );
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });
  it('opens dropdown when clicked', () => {
    render(
      <CustomSelect
        id="test-select"
        options={mockOptions}
        value=""
        onChange={mockOnChange}
      />
    );
    fireEvent.click(screen.getByText('Select an option'));
    mockOptions.forEach(option => {
      expect(screen.getByText(option.label)).toBeInTheDocument();
    });
  });
  it('calls onChange with correct value when option is selected', () => {
    render(
      <CustomSelect
        id="test-select"
        options={mockOptions}
        value=""
        onChange={mockOnChange}
      />
    );
    fireEvent.click(screen.getByText('Select an option'));
    fireEvent.click(screen.getByText('Option 2'));
    expect(mockOnChange).toHaveBeenCalledWith('option2');
  });
  it('closes dropdown after selecting an option', () => {
    render(
      <CustomSelect
        id="test-select"
        options={mockOptions}
        value=""
        onChange={mockOnChange}
      />
    );
    fireEvent.click(screen.getByText('Select an option'));
    fireEvent.click(screen.getByText('Option 2'));
    expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Option 3')).not.toBeInTheDocument();
  });
  it('applies correct styles to selected option', () => {
    render(
      <CustomSelect
        id="test-select"
        options={mockOptions}
        value="option2"
        onChange={mockOnChange}
      />
    );
    //open the dropdown
    fireEvent.click(screen.getByText('Option 2'));

    const dropdown = screen.getByRole('list');
    const selectedOption = within(dropdown).getByText('Option 2');
    expect(selectedOption).toHaveClass('bg-slate-200');
    expect(selectedOption).toHaveClass('text-slate-900');
  });
  it('applies hover styles to options', () => {
    render(
      <CustomSelect
        id="test-select"
        options={mockOptions}
        value=""
        onChange={mockOnChange}
      />
    );
    fireEvent.click(screen.getByText('Select an option'));

    const option = screen.getByText('Option 1');
    fireEvent.mouseEnter(option);

    expect(option).toHaveClass('hover:bg-gray-100');
  });

  it('renders correctly and matches snapshot', () => {
    const { asFragment } = render(
      <CustomSelect
        id="test-select"
        options={mockOptions}
        value="option2"
        onChange={mockOnChange}
        placeholder="Select an option"
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
