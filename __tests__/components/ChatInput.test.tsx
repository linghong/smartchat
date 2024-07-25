import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatInput from '@/src/components/ChatInput';

// Mock the file-to-base64 conversion utility
jest.mock('@/src/utils/fileFetchAndConversion', () => ({
  fileToBase64: jest.fn().mockResolvedValue('mocked-base64-string')
}));

// Mock the image validation utility
jest.mock('@/src/utils/mediaValidationHelper', () => ({
  isSupportedImage: jest.fn().mockReturnValue([])
}));

describe('ChatInput', () => {
  const mockOnSubmit = jest.fn();
  const mockSetIsConfigPanelVisible = jest.fn();

  const defaultProps = {
    onSubmit: mockOnSubmit,
    isVisionModel: true,
    selectedModel: { value: 'gpt-4-vision', label: 'GPT-4 Vision' },
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
    expect(screen.getByLabelText('Upload Image')).toBeInTheDocument();
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

  it('disables image upload when isVisionModel is false', () => {
    render(<ChatInput {...defaultProps} isVisionModel={false} />);
    expect(screen.getByLabelText('Upload Image')).toBeDisabled();
    expect(screen.getByLabelText('Capture Screenshot')).toBeDisabled();
  });

  it('handles image upload correctly', async () => {
    render(<ChatInput {...defaultProps} />);
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const input = screen.getByLabelText('Upload image');

    Object.defineProperty(input, 'files', {
      value: [file]
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Click to view larger image 1' })
      ).toBeInTheDocument();
    });
  });

  it('handles screen capture correctly', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          message: 'Success',
          base64Image: 'mocked-base64-string',
          mimeType: 'image/png',
          size: 1000,
          name: 'screenshot.png'
        })
    });

    render(<ChatInput {...defaultProps} />);
    const captureButton = screen.getByLabelText('Capture Screenshot');
    fireEvent.click(captureButton);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Click to view larger image 1' })
      ).toBeInTheDocument();
    });
  });

  it('handles image upload error', async () => {
    const { isSupportedImage } = require('@/src/utils/mediaValidationHelper');
    isSupportedImage.mockReturnValueOnce(['Unsupported image format']);

    render(<ChatInput {...defaultProps} />);
    const file = new File(['dummy content'], 'test.unsupported', {
      type: 'image/unsupported'
    });
    const input = screen.getByLabelText('Upload image');

    Object.defineProperty(input, 'files', {
      value: [file]
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(screen.getByText('Unsupported image format')).toBeInTheDocument();
    });
  });

  it('handles screen capture error', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      json: () =>
        Promise.resolve({
          message: 'Failed to capture screenshot'
        })
    });

    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<ChatInput {...defaultProps} />);
    const captureButton = screen.getByLabelText('Capture Screenshot');
    fireEvent.click(captureButton);

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Failed to capture screenshot');
    });

    alertMock.mockRestore();
  });

  it('handles screen capture network error', async () => {
    global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network error'));

    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<ChatInput {...defaultProps} />);
    const captureButton = screen.getByLabelText('Capture Screenshot');
    fireEvent.click(captureButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
      expect(alertMock).toHaveBeenCalledWith(
        'An error occurred while capturing the screen'
      );
    });

    consoleSpy.mockRestore();
    alertMock.mockRestore();
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
