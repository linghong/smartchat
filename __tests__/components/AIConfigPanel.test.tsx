import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import AIConfigPanel from '@/src/components/AIConfigPanel';
import { OptionType } from '@/src/types/common';

// Mock the UI components
jest.mock('@/src/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  CardTitle: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  )
}));

jest.mock('@/src/components/CustomSelect', () => ({
  __esModule: true,
  default: ({
    id,
    options,
    value,
    onChange
  }: {
    id: string;
    options: OptionType[];
    value: string;
    onChange: (value: string) => void;
  }) => (
    <div>
      <select
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        aria-label={id}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}));

jest.mock('@/src/components/ui/slider', () => ({
  Slider: () => <div>Slider</div>
}));

describe('AIConfigPanel', () => {
  const mockAIConfig = {
    name: 'TestBot',
    role: 'Test Assistant',
    model: {
      value: 'gpt-4',
      label: 'gpt 4',
      contextWindow: 128000,
      vision: true
    },
    basePrompt: 'Test prompt',
    topP: 0.7,
    temperature: 0.5
  };

  const mockProps = {
    selectedModel: { value: 'model1', label: 'Model 1' },
    handleModelChange: jest.fn(),
    selectedNamespace: { value: 'namespace1', label: 'Namespace 1' },
    handleNamespaceChange: jest.fn(),
    aiConfig: mockAIConfig,
    setAIConfig: jest.fn(),
    modelOptions: [
      { value: 'model1', label: 'Model 1' },
      { value: 'model2', label: 'Model 2' }
    ],
    fileCategoryOptions: [
      { value: 'namespace1', label: 'Namespace 1' },
      { value: 'namespace2', label: 'Namespace 2' }
    ]
  };

  it('renders the component correctly', () => {
    render(<AIConfigPanel {...mockProps} />);

    expect(screen.getByText('Configure AI Assistant')).toBeInTheDocument();
    expect(screen.getByText('Choose AI Model')).toBeInTheDocument();
    expect(screen.getByText('Select RAG Namespace')).toBeInTheDocument();
    expect(
      screen.getByText('Enter text for AI to remember')
    ).toBeInTheDocument();
  });

  it('renders the Select components with correct options', () => {
    render(<AIConfigPanel {...mockProps} />);

    expect(screen.getByText('Model 1')).toBeInTheDocument();
    expect(screen.getByText('Model 2')).toBeInTheDocument();
    expect(screen.getByText('Namespace 1')).toBeInTheDocument();
    expect(screen.getByText('Namespace 2')).toBeInTheDocument();
  });

  it('renders the Select components with correct options', () => {
    render(<AIConfigPanel {...mockProps} />);
    expect(screen.getByText('Model 1')).toBeInTheDocument();
    expect(screen.getByText('Model 2')).toBeInTheDocument();
    expect(screen.getByText('Namespace 1')).toBeInTheDocument();
    expect(screen.getByText('Namespace 2')).toBeInTheDocument();
  });

  it('renders the textarea with correct value', () => {
    render(<AIConfigPanel {...mockProps} />);

    const textarea = screen.getByPlaceholderText(
      'Enter text here for AI to remember throughout the chat'
    );
    expect(textarea).toHaveValue('Test prompt');
  });

  it('calls setAIConfig when input values change', () => {
    render(<AIConfigPanel {...mockProps} />);
    const nameInput = screen.getByPlaceholderText('Enter assistant name');
    fireEvent.change(nameInput, { target: { value: 'New Name' } });
    expect(mockProps.setAIConfig).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'New Name' })
    );
  });

  it('calls handleModelChange when model is selected', () => {
    render(<AIConfigPanel {...mockProps} />);

    const select = screen.getByLabelText('Choose AI Model');
    fireEvent.change(select, { target: { value: 'model2' } });

    expect(mockProps.handleModelChange).toHaveBeenCalledWith({
      value: 'model2',
      label: 'Model 2'
    });
  });

  it('calls handleNamespaceChange when namespace is selected', () => {
    render(<AIConfigPanel {...mockProps} />);

    const select = screen.getByLabelText('Select RAG Namespace');
    fireEvent.change(select, { target: { value: 'namespace2' } });

    expect(mockProps.handleNamespaceChange).toHaveBeenCalledWith({
      value: 'namespace2',
      label: 'Namespace 2'
    });
  });

  it('submits the form with correct data', () => {
    const mockSubmit = jest.fn();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    render(<AIConfigPanel {...mockProps} />);
    const submitButton = screen.getByText('Save Configuration');
    fireEvent.click(submitButton);
    expect(console.log).toHaveBeenCalledWith(
      'Form submitted',
      expect.objectContaining({
        aiConfig: mockAIConfig,
        selectedNamespace: { value: 'namespace1', label: 'Namespace 1' }
      })
    );
  });

  it('matches snapshot', () => {
    const { asFragment } = render(<AIConfigPanel {...mockProps} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
