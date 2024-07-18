import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AIConfigPanel from '@/src/components/AIConfigPanel';
import { OptionType } from '@/src/types/common';

// Mock the DropdownSelect component
jest.mock('@/src/components/DropdownSelect', () => {
  return function MockDropdownSelect({
    label,
    selectedOption
  }: {
    label: string;
    selectedOption: OptionType;
  }) {
    return (
      <div>
        <span>{label}</span>
        <span>{selectedOption.label}</span>
      </div>
    );
  };
});

describe('AIConfigPanel', () => {
  const mockProps = {
    selectedModel: { value: 'model1', label: 'Model 1' },
    handleModelChange: jest.fn(),
    selectedNamespace: { value: 'namespace1', label: 'Namespace 1' },
    handleNamespaceChange: jest.fn(),
    basePrompt: 'Test prompt',
    handleBasePromptChange: jest.fn(),
    modelOptions: [
      { value: 'model1', label: 'Model 1' },
      { value: 'model2', label: 'Model 2' }
    ],
    fileCategoryOptions: [
      { value: 'namespace1', label: 'Namespace 1' },
      { value: 'namespace2', label: 'Namespace 2' }
    ],
    isConfigPanelVisible: true
  };

  it('renders the component correctly', () => {
    render(<AIConfigPanel {...mockProps} />);

    expect(screen.getByText('Config My AI Assistant')).toBeInTheDocument();
    expect(screen.getByText('Choose AI Model:')).toBeInTheDocument();
    expect(screen.getByText('Select RAG File:')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Enter text here for AI to remember throughout the chat:'
      )
    ).toBeInTheDocument();
  });

  it('renders the DropdownSelect components with correct props', () => {
    render(<AIConfigPanel {...mockProps} />);

    expect(screen.getByText('Model 1')).toBeInTheDocument();
    expect(screen.getByText('Namespace 1')).toBeInTheDocument();
  });

  it('renders the textarea with correct value', () => {
    render(<AIConfigPanel {...mockProps} />);

    const textarea = screen.getByLabelText(
      'Enter text here for AI to remember throughout the chat'
    );
    expect(textarea).toHaveValue('Test prompt');
  });

  it('calls handleBasePromptChange when textarea value changes', () => {
    render(<AIConfigPanel {...mockProps} />);

    const textarea = screen.getByLabelText(
      'Enter text here for AI to remember throughout the chat'
    );
    fireEvent.change(textarea, { target: { value: 'New prompt' } });

    expect(mockProps.handleBasePromptChange).toHaveBeenCalled();
  });

  it('matches snapshot', () => {
    const { asFragment } = render(<AIConfigPanel {...mockProps} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
