import React from 'react';
import { fireEvent, waitFor, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import ChatInput from '@/src/components/ChatInput';
import { fileToDataURLBase64 } from '@/src/utils/fileHelper/fileFetchAndConversion';
import { isSupportedImage } from '@/src/utils/fileHelper/mediaValidationHelper';
import { renderWithContext } from '@/__tests__/test_utils/context';

jest.mock('@/src/utils/fileHelper/mediaValidationHelper', () => ({
  isSupportedImage: jest.fn().mockReturnValue([])
}));

jest.mock('@/src/utils/guardrails/htmlEncodeDecode', () => ({
  sanitizeWithPreserveCode: jest.fn(input => input)
}));

jest.mock('@/src/utils/fileHelper/fileFetchAndConversion', () => ({
  fileToDataURLBase64: jest.fn().mockResolvedValue('mocked-base64-content')
}));

const mockOnSubmit = jest.fn();
const mockSetIsConfigPanelVisible = jest.fn();

const defaultProps = {
  onSubmit: mockOnSubmit,
  isVisionModel: true
};

const mockContextValue = {
  selectedModel: {
    value: 'ai-model',
    label: 'AI model',
    contextWindow: 8192
  },
  isConfigPanelVisible: false,
  setIsConfigPanelVisible: jest.fn()
};

describe('ChatInput', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    renderWithContext(<ChatInput {...defaultProps} />);
    expect(
      screen.getByPlaceholderText(
        'Click to send. Shift + Enter for a new line.'
      )
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Capture Screenshot')).toBeInTheDocument();
    expect(screen.getByLabelText('Upload File')).toBeInTheDocument();
  });

  it('closes config panel when user starts typing', async () => {
    const mockSetIsConfigPanelVisible = jest.fn();

    renderWithContext(<ChatInput {...defaultProps} />, {
      isConfigPanelVisible: true,
      setIsConfigPanelVisible: mockSetIsConfigPanelVisible
    });
    const input = screen.getByPlaceholderText(
      'Click to send. Shift + Enter for a new line.'
    );
    await act(async () => {
      fireEvent.change(input, { target: { value: 'T' } });
    });

    expect(mockSetIsConfigPanelVisible).toHaveBeenCalledWith(false);
  });

  it('handles text input correctly', () => {
    renderWithContext(<ChatInput {...defaultProps} />);
    const input = screen.getByPlaceholderText(
      'Click to send. Shift + Enter for a new line.'
    );
    fireEvent.change(input, { target: { value: 'Test message' } });
    expect(input).toHaveValue('Test message');
  });

  it('adds a new line when Shift+Enter is pressed', () => {
    renderWithContext(<ChatInput {...defaultProps} />);
    const input = screen.getByPlaceholderText(
      'Click to send. Shift + Enter for a new line.'
    );
    fireEvent.change(input, { target: { value: 'Line 1' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', shiftKey: true });
    expect(input).toHaveValue('Line 1\n');
  });

  it('adjusts textarea height as user types', () => {
    renderWithContext(<ChatInput {...defaultProps} />);
    const textarea = screen.getByPlaceholderText(
      'Click to send. Shift + Enter for a new line.'
    );
    const initialHeight = textarea.style.height;
    fireEvent.change(textarea, {
      target: { value: 'Line 1\nLine 2\nLine 3\nLine 4' }
    });

    expect(textarea.style.height).not.toBe(initialHeight);
  });

  it('resets textarea height after form submission', async () => {
    renderWithContext(<ChatInput {...defaultProps} />);
    const textarea = screen.getByPlaceholderText(
      'Click to send. Shift + Enter for a new line.'
    );
    fireEvent.change(textarea, { target: { value: 'Test message\nLine 2' } });

    const initialHeight = textarea.style.height;

    const submitButton = screen.getByLabelText('Send message');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(textarea.style.height).toBe('auto');
      expect(textarea.style.height).not.toBe(initialHeight);
    });
  });

  it('updates rows state when typing multiple lines', () => {
    renderWithContext(<ChatInput {...defaultProps} />);
    const textarea = screen.getByPlaceholderText(
      'Click to send. Shift + Enter for a new line.'
    );

    fireEvent.change(textarea, { target: { value: 'Line 1\nLine 2\nLine 3' } });

    expect((textarea as HTMLTextAreaElement).rows).toBe(3);
  });

  it('limits rows to a maximum of 8', () => {
    renderWithContext(<ChatInput {...defaultProps} />);
    const textarea = screen.getByPlaceholderText(
      'Click to send. Shift + Enter for a new line.'
    );

    fireEvent.change(textarea, { target: { value: 'Line 1\n'.repeat(10) } });

    expect((textarea as HTMLTextAreaElement).rows).toBe(8);
  });

  it('submits the form when Enter is pressed', () => {
    renderWithContext(<ChatInput {...defaultProps} />);
    const input = screen.getByPlaceholderText(
      'Click to send. Shift + Enter for a new line.'
    );
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    expect(mockOnSubmit).toHaveBeenCalledWith('Test message', []);
  });

  it('enables submit button when there is input', () => {
    renderWithContext(<ChatInput {...defaultProps} />);
    const input = screen.getByPlaceholderText(
      'Click to send. Shift + Enter for a new line.'
    );
    const submitButton = screen
      .getAllByRole('button')
      .find(button => (button as HTMLButtonElement).type === 'submit');
    fireEvent.change(input, { target: { value: 'Test message' } });
    expect(submitButton).not.toBeDisabled();
  });

  it('enables submit button when there are files but no text input', async () => {
    const user = userEvent.setup();
    renderWithContext(<ChatInput {...defaultProps} />);
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const input = screen.getByLabelText('Upload file', {
      selector: 'input[type="file"]'
    });

    await user.upload(input, file);

    const submitButton = screen.getByLabelText('Send message');
    expect(submitButton).not.toBeDisabled();
  });

  it('disables submit button when there is no input and no files', () => {
    renderWithContext(<ChatInput {...defaultProps} />);
    const submitButton = screen.getByLabelText('Send message');
    expect(submitButton).toBeDisabled();
  });

  it('handles file upload correctly', async () => {
    const user = userEvent.setup();
    renderWithContext(<ChatInput {...defaultProps} />);

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

    renderWithContext(<ChatInput {...defaultProps} />);
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
    renderWithContext(<ChatInput {...defaultProps} isVisionModel={false} />);

    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const input = screen.getByLabelText('Upload file', {
      selector: 'input[type="file"]'
    }) as HTMLInputElement;

    await user.upload(input, file);

    expect(
      await screen.findByText('The model only supports text messages.')
    ).toBeInTheDocument();
  });

  it('disables file upload when selectedModel.contextWindow is small', async () => {
    const user = userEvent.setup();
    const selectedModel = {
      ...mockContextValue.selectedModel,
      contextWindow: 4000
    };
    renderWithContext(<ChatInput {...defaultProps} />, { selectedModel });
    const uploadIcon = screen.getByLabelText('Upload File');
    expect(uploadIcon).toBeDisabled();

    const tooltip = screen.getByText(
      "ai-model's context window is too small to add a file"
    );
    expect(tooltip).toBeInTheDocument();
  });

  it('handles file deletion', async () => {
    const user = userEvent.setup();
    renderWithContext(<ChatInput {...defaultProps} />);
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

    renderWithContext(<ChatInput {...defaultProps} />);

    const captureButton = screen.getByLabelText('Capture Screenshot');
    fireEvent.click(captureButton);

    await waitFor(() => {
      const viewImageButton = screen.getByRole('button', {
        name: /Click to view larger file/i
      });
      expect(viewImageButton).toBeInTheDocument();
    });

    // check if the captured image is added to fileSrc
    expect(
      screen.getAllByRole('button', { name: /Click to view larger file/i })
    ).toHaveLength(1);
  });

  it('disables screen capture feature when isVisionModel is false', () => {
    renderWithContext(<ChatInput {...defaultProps} isVisionModel={false} />);

    expect(screen.getByLabelText('Capture Screenshot')).toBeDisabled();
  });

  it('handles screen capture error', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      json: () =>
        Promise.resolve({
          message: 'Failed to capture screenshot'
        })
    });

    renderWithContext(<ChatInput {...defaultProps} />);

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

    renderWithContext(<ChatInput {...defaultProps} />);

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
    isSupportedImage.mockReturnValueOnce(['Unsupported file format']);

    const user = userEvent.setup();

    renderWithContext(<ChatInput {...defaultProps} />);

    const file = new File(['dummy content'], 'test.bmp', { type: 'image/bmp' });
    const input = screen.getByLabelText('Upload file', {
      selector: 'input[type="file"]'
    }) as HTMLInputElement;

    await user.upload(input, file);

    expect(
      await screen.findByText('Unsupported file format')
    ).toBeInTheDocument();
  });

  it('handles file upload error when fileToDataURLBase64 fails', async () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    (fileToDataURLBase64 as jest.Mock).mockRejectedValueOnce(
      new Error('File conversion failed')
    );

    const user = userEvent.setup();

    renderWithContext(<ChatInput {...defaultProps} />);

    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const input = screen.getByLabelText('Upload file', {
      selector: 'input[type="file"]'
    });

    await user.upload(input, file);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error:', expect.any(Error));
      expect(
        screen.getByText('Error happened when extracting file data')
      ).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  it('matches snapshot', () => {
    const { asFragment } = renderWithContext(<ChatInput {...defaultProps} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('matches snapshot when isVisionModel is false', () => {
    const { asFragment } = renderWithContext(
      <ChatInput {...defaultProps} isVisionModel={false} />
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
