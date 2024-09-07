import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AIConfigPanel from '@/src/components/AIConfigPanel';
import { OptionType } from '@/src/types/common';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn()
  })
}));

// Mock the postAIConfig function
jest.mock('@/src/utils/sqliteAIConfigApiClient', () => ({
  postAIConfig: jest.fn()
}));

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
    model: 'gpt-4',
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

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'mock-token')
      },
      writable: true
    });
  });

  it('renders the component correctly', () => {
    render(<AIConfigPanel {...mockProps} />);
    expect(screen.getByText('Configure AI Assistant')).toBeInTheDocument();
    expect(screen.getByText('Choose AI Model')).toBeInTheDocument();
    expect(screen.getByText('Select RAG Namespace')).toBeInTheDocument();
    expect(
      screen.getByText('Enter Information You Want AI to Remember')
    ).toBeInTheDocument();
  });

  it('renders the Select components with correct options', () => {
    render(<AIConfigPanel {...mockProps} />);
    expect(screen.getByText('Model 1')).toBeInTheDocument();
    expect(screen.getByText('Model 2')).toBeInTheDocument();
    expect(screen.getByText('None')).toBeInTheDocument();
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

  it('submits the form with correct data', async () => {
    const { postAIConfig } = require('@/src/utils/sqliteAIConfigApiClient');
    render(<AIConfigPanel {...mockProps} />);
    const submitButton = screen.getByText('Save Configuration');
    fireEvent.click(submitButton);

    expect(postAIConfig).toHaveBeenCalledWith(
      'mock-token',
      mockAIConfig,
      'namespace1'
    );
  });

  it('redirects to login page if token is not present', () => {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => null)
      },
      writable: true
    });
    const mockPush = jest.fn();
    jest.spyOn(require('next/router'), 'useRouter').mockImplementation(() => ({
      push: mockPush
    }));
    render(<AIConfigPanel {...mockProps} />);
    const submitButton = screen.getByText('Save Configuration');
    fireEvent.click(submitButton);
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('matches snapshot', () => {
    const { asFragment } = render(<AIConfigPanel {...mockProps} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
