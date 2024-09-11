import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ChatInput from '@/src/components/ChatInput';
import { sanitizeWithPreserveCode } from '@/src/utils/guardrail';

jest.mock('@/src/utils/mediaValidationHelper', () => ({
  isSupportedImage: jest.fn().mockReturnValue([])
}));

jest.mock('@/src/utils/guardrail', () => ({
  sanitizeWithPreserveCode: jest.fn(input => input)
}));

jest.mock('@/src/utils/fileFetchAndConversion', () => ({
  fileToDataURLBase64: jest.fn().mockResolvedValue('mocked-base64-content')
}));

describe('ChatInput', () => {
  const mockOnSubmit = jest.fn();
  const mockSetIsConfigPanelVisible = jest.fn();

  const defaultProps = {
    onSubmit: mockOnSubmit,
    isVisionModel: true,
    selectedModel: {
      value: 'ai-model',
      label: 'AI model',
      contextWindow: 8192
    },
    isConfigPanelVisible: false,
    setIsConfigPanelVisible: mockSetIsConfigPanelVisible
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<ChatInput {...defaultProps} />);
    expect(
      screen.getByPlaceholderText(
        'Click to send. Shift + Enter for a new line.'
      )
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Capture Screenshot')).toBeInTheDocument();
    expect(screen.getByLabelText('Upload File')).toBeInTheDocument();
  });

  it('closes config panel when user starts typing', () => {
    render(<ChatInput {...defaultProps} isConfigPanelVisible={true} />);
    const input = screen.getByPlaceholderText(
      'Click to send. Shift + Enter for a new line.'
    );
    fireEvent.change(input, { target: { value: 'T' } });
    expect(mockSetIsConfigPanelVisible).toHaveBeenCalledWith(false);
  });

  it('handles text input correctly', () => {
    render(<ChatInput {...defaultProps} />);
    const input = screen.getByPlaceholderText(
      'Click to send. Shift + Enter for a new line.'
    );
    fireEvent.change(input, { target: { value: 'Test message' } });
    expect(input).toHaveValue('Test message');
  });

  it('submits the form when Enter is pressed', () => {
    render(<ChatInput {...defaultProps} />);
    const input = screen.getByPlaceholderText(
      'Click to send. Shift + Enter for a new line.'
    );
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    expect(mockOnSubmit).toHaveBeenCalledWith('Test message', []);
  });

  it('adds a new line when Shift+Enter is pressed', () => {
    render(<ChatInput {...defaultProps} />);
    const input = screen.getByPlaceholderText(
      'Click to send. Shift + Enter for a new line.'
    );
    fireEvent.change(input, { target: { value: 'Line 1' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', shiftKey: true });
    expect(input).toHaveValue('Line 1\n');
  });

  it('adjusts textarea height as user types', () => {
    render(<ChatInput {...defaultProps} />);
    const textarea = screen.getByPlaceholderText(
      'Click to send. Shift + Enter for a new line.'
    );
    const initialHeight = textarea.style.height;
    fireEvent.change(textarea, {
      target: { value: 'Line 1\nLine 2\nLine 3\nLine 4' }
    });

    expect(textarea.style.height).not.toBe(initialHeight);
  });

  it('enables submit button when there is input', () => {
    render(<ChatInput {...defaultProps} />);
    const input = screen.getByPlaceholderText(
      'Click to send. Shift + Enter for a new line.'
    );
    const submitButton = screen
      .getAllByRole('button')
      .find(button => (button as HTMLButtonElement).type === 'submit');
    fireEvent.change(input, { target: { value: 'Test message' } });
    expect(submitButton).not.toBeDisabled();
  });

  it('disables screen capture feature when isVisionModel is false', () => {
    render(<ChatInput {...defaultProps} isVisionModel={false} />);
    expect(screen.getByLabelText('Capture Screenshot')).toBeDisabled();
  });

  it('handles file upload correctly', async () => {
    const user = userEvent.setup();
    render(<ChatInput {...defaultProps} />);

    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const input = screen.getByLabelText('Upload file', {
      selector: 'input[type="file"]'
    }) as HTMLInputElement;

    await user.upload(input, file);

    expect(input.files?.[0]).toBe(file);
    expect(input.files?.item(0)).toBe(file);
    expect(input.files).toHaveLength(1);
    expect(
      await screen.findByRole('button', {
        name: /Click to view larger file 1/i
      })
    ).toBeInTheDocument();
  });

  it('handles multiple files uploads', async () => {
    const user = userEvent.setup();

    render(<ChatInput {...defaultProps} />);

    const file1 = new File(['dummy content 1'], 'test1.png', {
      type: 'image/png'
    });
    const file2 = new File(['dummy content 2'], 'test2.png', {
      type: 'image/png'
    });
    const input = screen.getByLabelText('Upload file', {
      selector: 'input[type="file"]'
    });

    await user.upload(input, file1);
    await user.upload(input, file2);

    expect(
      await screen.findByRole('button', {
        name: /Click to view larger file 1/i
      })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('button', {
        name: /Click to view larger file 2/i
      })
    ).toBeInTheDocument();
  });

  it('handles file upload when isVisionModel is false', async () => {
    const user = userEvent.setup();
    render(<ChatInput {...defaultProps} isVisionModel={false} />);

    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const input = screen.getByLabelText('Upload file', {
      selector: 'input[type="file"]'
    }) as HTMLInputElement;

    await user.upload(input, file);

    expect(
      await screen.findByText('The model only supports text messages.')
    ).toBeInTheDocument();
  });

  it('disables file upload when selectedModel.contextWindow is small', () => {
    render(
      <ChatInput
        {...defaultProps}
        selectedModel={{ ...defaultProps.selectedModel, contextWindow: 2000 }}
      />
    );

    const uploadButton = screen.getByLabelText('Upload File');
    expect(uploadButton).toBeDisabled();

    const tooltip = screen.getByText(
      "ai-model's context window is too small to add a file"
    );
    expect(tooltip).toBeInTheDocument();
  });

  it('handles file deletion', async () => {
    const user = userEvent.setup();
    render(<ChatInput {...defaultProps} />);
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const input = screen.getByLabelText('Upload file', {
      selector: 'input[type="file"]'
    });

    await user.upload(input, file);
    expect(
      await screen.findByRole('button', {
        name: /Click to view larger file 1/i
      })
    ).toBeInTheDocument();

    const deleteButton = screen.getByLabelText('Delete file 1');
    await fireEvent.click(deleteButton);

    expect(
      screen.queryByRole('button', { name: /Click to view larger file 1/i })
    ).not.toBeInTheDocument();
  });

  it('handles screen capture correctly', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          message: 'Success',
          base64Image: 'mocked-base64-string',
          type: 'image/png',
          size: 1000,
          name: 'screenshot.png'
        })
    });

    render(<ChatInput {...defaultProps} />);
    const captureButton = screen.getByLabelText('Capture Screenshot');
    fireEvent.click(captureButton);

    await waitFor(() => {
      const viewImageButton = screen.getByRole('button', {
        name: /Click to view larger file/i
      });
      expect(viewImageButton).toBeInTheDocument();
    });
  });

  it('handles screen capture when isVisionModel is false', async () => {
    render(<ChatInput {...defaultProps} isVisionModel={false} />);
    const captureButton = screen.getByLabelText('Capture Screenshot');

    expect(captureButton).toBeDisabled();
  });

  it('handles screen capture error', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      json: () =>
        Promise.resolve({
          message: 'Failed to capture screenshot'
        })
    });

    render(<ChatInput {...defaultProps} />);
    const captureButton = screen.getByLabelText('Capture Screenshot');
    fireEvent.click(captureButton);

    await waitFor(() => {
      expect(
        screen.getByText('An error occurred while capturing the screen')
      ).toBeInTheDocument();
    });
  });

  it('handles screen capture network error', async () => {
    global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network error'));

    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    render(<ChatInput {...defaultProps} />);
    const captureButton = screen.getByLabelText('Capture Screenshot');
    fireEvent.click(captureButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
      expect(
        screen.getByText('A network error occurred while capturing the screen')
      ).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  it('handles file upload error for unsupported image format', async () => {
    const { isSupportedImage } = require('@/src/utils/mediaValidationHelper');
    isSupportedImage.mockReturnValueOnce(['Unsupported file format']);

    const user = userEvent.setup();
    render(<ChatInput {...defaultProps} />);

    const file = new File(['dummy content'], 'test.bmp', { type: 'image/bmp' });
    const input = screen.getByLabelText('Upload file', {
      selector: 'input[type="file"]'
    }) as HTMLInputElement;

    await user.upload(input, file);

    expect(
      await screen.findByText('Unsupported file format')
    ).toBeInTheDocument();
  });

  it('sanitizes user input', () => {
    render(<ChatInput {...defaultProps} />);
    const input = screen.getByPlaceholderText(
      'Click to send. Shift + Enter for a new line.'
    );

    fireEvent.change(input, {
      target: { value: '<script>alert("XSS")</script>' }
    });
    expect(sanitizeWithPreserveCode).toHaveBeenCalledWith(
      '<script>alert("XSS")</script>'
    );
  });

  it('matches snapshot', () => {
    const { asFragment } = render(<ChatInput {...defaultProps} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('matches snapshot when isVisionModel is false', () => {
    const { asFragment } = render(
      <ChatInput {...defaultProps} isVisionModel={false} />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
