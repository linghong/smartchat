import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { act } from 'react-dom/test-utils';

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
  postAIConfig: jest.fn(),
  getAIConfigs: jest.fn().mockResolvedValue([])
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
  )
}));

jest.mock('@/src/components/ui/slider', () => ({
  Slider: () => <div>Slider</div>
}));

jest.mock('@/src/components/Notification', () => ({
  __esModule: true,
  default: ({ type, message }: { type: string; message: string }) => (
    <div data-testid={`notification-${type}`}>{message}</div>
  )
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

  it('renders the component correctly', async () => {
    await act(async () => {
      render(<AIConfigPanel {...mockProps} />);
    });
    expect(screen.getByText('Configure AI Assistant')).toBeInTheDocument();
    expect(screen.getByText('Choose AI Model')).toBeInTheDocument();
    expect(screen.getByText('Select RAG Namespace')).toBeInTheDocument();
    expect(
      screen.getByText('Enter Information You Want AI to Remember')
    ).toBeInTheDocument();
  });

  it('renders the Select components with correct options', async () => {
    await act(async () => {
      render(<AIConfigPanel {...mockProps} />);
    });
    expect(screen.getByText('Model 1')).toBeInTheDocument();
    expect(screen.getByText('Model 2')).toBeInTheDocument();
    expect(screen.getByText('None')).toBeInTheDocument();
    expect(screen.getByText('Namespace 1')).toBeInTheDocument();
    expect(screen.getByText('Namespace 2')).toBeInTheDocument();
  });

  it('renders the textarea with correct value', async () => {
    await act(async () => {
      render(<AIConfigPanel {...mockProps} />);
    });
    const textarea = screen.getByPlaceholderText(
      'Enter text here for AI to remember throughout the chat'
    );
    expect(textarea).toHaveValue('Test prompt');
  });

  it('calls setAIConfig when input values change', async () => {
    await act(async () => {
      render(<AIConfigPanel {...mockProps} />);
    });
    const nameInput = screen.getByPlaceholderText('Enter assistant name');
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'New Name' } });
    });
    expect(mockProps.setAIConfig).toHaveBeenCalledWith(expect.any(Function));

    // Get the function passed to setAIConfig
    const setAIConfigArg = mockProps.setAIConfig.mock.calls[0][0];

    const mockPrevState = { ...mockProps.aiConfig };
    const result = setAIConfigArg(mockPrevState);

    expect(result).toEqual(expect.objectContaining({ name: 'New Name' }));
  });

  it('calls handleModelChange when model is selected', async () => {
    await act(async () => {
      render(<AIConfigPanel {...mockProps} />);
    });
    const select = screen.getByLabelText('Choose AI Model');
    await act(async () => {
      fireEvent.change(select, { target: { value: 'model2' } });
    });
    expect(mockProps.handleModelChange).toHaveBeenCalledWith({
      value: 'model2',
      label: 'Model 2'
    });
  });

  it('calls handleNamespaceChange when namespace is selected', async () => {
    await act(async () => {
      render(<AIConfigPanel {...mockProps} />);
    });

    const select = screen.getByLabelText('Select RAG Namespace');
    await act(async () => {
      fireEvent.change(select, { target: { value: 'namespace2' } });
    });
    expect(mockProps.handleNamespaceChange).toHaveBeenCalledWith({
      value: 'namespace2',
      label: 'Namespace 2'
    });
  });

  it('calls handleNamespaceChange when namespace is selected', async () => {
    await act(async () => {
      render(<AIConfigPanel {...mockProps} />);
    });
    const select = screen.getByLabelText('Select RAG Namespace');
    await act(async () => {
      fireEvent.change(select, { target: { value: 'namespace2' } });
    });
    expect(mockProps.handleNamespaceChange).toHaveBeenCalledWith({
      value: 'namespace2',
      label: 'Namespace 2'
    });
  });

  it('submits the form with correct data', async () => {
    const { postAIConfig } = require('@/src/utils/sqliteAIConfigApiClient');
    postAIConfig.mockResolvedValue({ message: 'AI Config saved successfully' });

    await act(async () => {
      render(<AIConfigPanel {...mockProps} />);
    });
    const submitButton = screen.getByText('Save Configuration');
    await act(async () => {
      fireEvent.click(submitButton);
    });
    await waitFor(() => {
      expect(postAIConfig).toHaveBeenCalledWith(
        'mock-token',
        mockAIConfig,
        'namespace1'
      );
      expect(screen.getByTestId('notification-success')).toBeInTheDocument();
      expect(screen.getByTestId('notification-success')).toHaveTextContent(
        'AI Config saved successfully'
      );
    });
  });

  it('shows error notification on submission failure', async () => {
    const { postAIConfig } = require('@/src/utils/sqliteAIConfigApiClient');
    postAIConfig.mockRejectedValue(new Error('Failed to save AI Config'));

    await act(async () => {
      render(<AIConfigPanel {...mockProps} />);
    });
    const submitButton = screen.getByText('Save Configuration');
    await act(async () => {
      fireEvent.click(submitButton);
    });
    await waitFor(() => {
      expect(screen.getByTestId('notification-error')).toBeInTheDocument();
      expect(screen.getByTestId('notification-error')).toHaveTextContent(
        'Failed to save AI Config'
      );
    });
  });

  it('redirects to login page if token is not present', async () => {
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
    await act(async () => {
      render(<AIConfigPanel {...mockProps} />);
    });
    const submitButton = screen.getByText('Save Configuration');
    await act(async () => {
      fireEvent.click(submitButton);
    });
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('disables submit button when required fields are empty', async () => {
    await act(async () => {
      const emptyConfig = { ...mockAIConfig, name: '', role: '' };
      render(<AIConfigPanel {...mockProps} aiConfig={emptyConfig} />);
    });
    const submitButton = screen.getByText('Save Configuration');
    expect(submitButton).toHaveAttribute('disabled');
  });

  it('shows error when submitting with existing name', async () => {
    const {
      getAIConfigs,
      postAIConfig
    } = require('@/src/utils/sqliteAIConfigApiClient');
    getAIConfigs.mockResolvedValue([{ name: 'TestBot' }]);
    postAIConfig.mockRejectedValue(
      new Error('An AI assistant with this name already exists.')
    );

    await act(async () => {
      render(<AIConfigPanel {...mockProps} />);
    });
    const submitButton = screen.getByText('Save Configuration');
    await act(async () => {
      fireEvent.click(submitButton);
    });
    await waitFor(() => {
      expect(screen.getByTestId('notification-error')).toBeInTheDocument();
      expect(screen.getByTestId('notification-error')).toHaveTextContent(
        'An AI assistant with this name already exists.'
      );
    });
  });

  it('matches snapshot', async () => {
    let asFragment;
    await act(async () => {
      const rendered = render(<AIConfigPanel {...mockProps} />);
      asFragment = rendered.asFragment;
    });
    expect(asFragment()).toMatchSnapshot();
  });
});
