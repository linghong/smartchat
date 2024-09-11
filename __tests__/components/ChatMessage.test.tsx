import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import ChatMessage from '@/src/components/ChatMessage';
import { format } from '@/src/components/AITextMessage';
import { encodeHTMLEntities } from '@/src/utils/guardrail';
import { Message, FileData } from '@/src/types/chat';
import { OptionType } from '@/src/types/common';

// Mock the console methods to suppress output during tests
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('ChatMessage Component', () => {
  let message: Message;
  let loading: boolean;
  let lastIndex: boolean;
  let fileSrc: FileData[];
  let handleFileDelete: jest.Mock;
  let selectedModel: OptionType;
  let handleModelChange: jest.Mock;
  let modelOptions: OptionType[];
  let handleRetry: jest.Mock;
  let handleCopy: jest.Mock;

  beforeEach(() => {
    message = {
      question: 'What is AI?',
      answer: 'AI stands for Artificial Intelligence.',
      model: 'gpt-4'
    };
    loading = false;
    lastIndex = true;
    handleFileDelete = jest.fn();
    fileSrc = [
      {
        base64Content: '/path/to/image1.png',
        type: 'image/png',
        size: 5000,
        name: 'image1'
      },
      {
        base64Content: 'path/to/image2.png',
        type: 'image/png',
        size: 8000,
        name: 'image2'
      }
    ];
    selectedModel = { value: 'gpt-4', label: 'GPT-4' };
    handleModelChange = jest.fn();
    modelOptions = [
      { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
      { value: 'gpt-4', label: 'GPT-4' }
    ];
    handleRetry = jest.fn();
    handleCopy = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders ChatMessage component correctly with question and answer', () => {
    render(
      <ChatMessage
        isNew={false}
        message={message}
        lastIndex={lastIndex}
        loading={loading}
        fileSrc={fileSrc}
        selectedModel={selectedModel}
        handleModelChange={handleModelChange}
        modelOptions={modelOptions}
        handleFileDelete={handleFileDelete}
        handleRetry={handleRetry}
        handleCopy={handleCopy}
      />
    );
    expect(screen.getByText('What is AI?')).toBeInTheDocument();
    expect(
      screen.getByText('AI stands for Artificial Intelligence.')
    ).toBeInTheDocument();
  });

  it('renders the user and AI avatars', () => {
    render(
      <ChatMessage
        isNew={false}
        message={message}
        lastIndex={lastIndex}
        loading={loading}
        fileSrc={fileSrc}
        selectedModel={selectedModel}
        handleModelChange={handleModelChange}
        modelOptions={modelOptions}
        handleFileDelete={handleFileDelete}
        handleRetry={handleRetry}
        handleCopy={handleCopy}
      />
    );
    expect(screen.getByAltText('User avatar')).toBeInTheDocument();
    expect(screen.getByAltText('AI avatar')).toBeInTheDocument();
  });

  it('applies animate-pulse class when loading and is the last index', () => {
    act(() => {
      render(
        <ChatMessage
          isNew={false}
          message={message}
          lastIndex={true}
          loading={true}
          fileSrc={fileSrc}
          selectedModel={selectedModel}
          handleModelChange={handleModelChange}
          modelOptions={modelOptions}
          handleFileDelete={handleFileDelete}
          handleRetry={handleRetry}
          handleCopy={handleCopy}
        />
      );
    });
    const botImages = screen.getAllByAltText('AI avatar') as HTMLElement[];
    expect(botImages[botImages.length - 1]).toHaveClass('animate-pulse');
  });

  it('does not apply animate-pulse class when not loading', () => {
    act(() => {
      render(
        <ChatMessage
          isNew={true}
          message={message}
          lastIndex={true}
          loading={false}
          fileSrc={fileSrc}
          selectedModel={selectedModel}
          handleModelChange={handleModelChange}
          modelOptions={modelOptions}
          handleFileDelete={handleFileDelete}
          handleRetry={handleRetry}
          handleCopy={handleCopy}
        />
      );
    });

    const botImage = screen.getByAltText('AI avatar');
    expect(botImage).not.toHaveClass('animate-pulse');
  });

  it('does not render user message when isNew is true', () => {
    render(
      <ChatMessage
        isNew={true}
        message={message}
        lastIndex={lastIndex}
        loading={loading}
        fileSrc={fileSrc}
        selectedModel={selectedModel}
        handleModelChange={handleModelChange}
        modelOptions={modelOptions}
        handleFileDelete={handleFileDelete}
        handleRetry={handleRetry}
        handleCopy={handleCopy}
      />
    );
    expect(screen.queryByText('What is AI?')).not.toBeInTheDocument();
  });

  it('sanitizes and formats messages correctly', () => {
    const userMessage = `Is <script>alert("XSS")</script> sanitized? 
    it is <strong>sanitized</strong>`;
    const messageWithHtml = {
      ...message,
      question: userMessage,
      answer:
        'Yes, it is <strong>sanitized</strong> and <code>formatted</code>.'
    };
    render(
      <ChatMessage
        isNew={false}
        message={messageWithHtml}
        lastIndex={lastIndex}
        loading={loading}
        fileSrc={fileSrc}
        selectedModel={selectedModel}
        handleModelChange={handleModelChange}
        modelOptions={modelOptions}
        handleFileDelete={handleFileDelete}
        handleRetry={handleRetry}
        handleCopy={handleCopy}
      />
    );
    const result = format(encodeHTMLEntities(userMessage));
    expect(result).not.toContain('<script>');
    expect(result).toContain('sanitized');

    const codeElement = screen.getByText('formatted');
    expect(codeElement.tagName).toBe('CODE');
    expect(codeElement).toHaveClass('inline-code');
  });

  it('renders file thumbnails when fileSrc is provided', () => {
    render(
      <ChatMessage
        isNew={false}
        message={message}
        lastIndex={lastIndex}
        loading={loading}
        fileSrc={fileSrc}
        selectedModel={selectedModel}
        handleModelChange={handleModelChange}
        modelOptions={modelOptions}
        handleFileDelete={handleFileDelete}
        handleRetry={handleRetry}
        handleCopy={handleCopy}
      />
    );
    expect(
      screen.getByTitle('Thumbnail for uploaded file 1')
    ).toBeInTheDocument();
    expect(
      screen.getByTitle('Thumbnail for uploaded file 2')
    ).toBeInTheDocument();
  });

  it('does not render image thumbnails for new messages', () => {
    render(
      <ChatMessage
        isNew={true}
        message={message}
        lastIndex={lastIndex}
        loading={loading}
        fileSrc={fileSrc}
        selectedModel={selectedModel}
        handleModelChange={handleModelChange}
        modelOptions={modelOptions}
        handleFileDelete={handleFileDelete}
        handleRetry={handleRetry}
        handleCopy={handleCopy}
      />
    );
    expect(
      screen.queryByTitle('Uploaded image thumbnail 1')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTitle('Uploaded image thumbnail 2')
    ).not.toBeInTheDocument();
  });

  it('renders FileListWithModal when fileSrc is not empty', () => {
    render(
      <ChatMessage
        isNew={false}
        message={message}
        lastIndex={true}
        loading={false}
        fileSrc={fileSrc}
        selectedModel={selectedModel}
        handleModelChange={handleModelChange}
        modelOptions={modelOptions}
        handleFileDelete={handleFileDelete}
        handleRetry={handleRetry}
        handleCopy={handleCopy}
      />
    );
    expect(
      screen.getByTitle('Thumbnail for uploaded file 1')
    ).toBeInTheDocument();
    expect(
      screen.getByTitle('Thumbnail for uploaded file 2')
    ).toBeInTheDocument();
  });

  it('does not render FileListWithModal when fileSrc is empty', () => {
    render(
      <ChatMessage
        isNew={false}
        message={message}
        lastIndex={true}
        loading={false}
        fileSrc={[]}
        selectedModel={selectedModel}
        handleModelChange={handleModelChange}
        modelOptions={modelOptions}
        handleFileDelete={handleFileDelete}
        handleRetry={handleRetry}
        handleCopy={handleCopy}
      />
    );
    expect(
      screen.queryByTitle('Thumbnail for uploaded file 1')
    ).not.toBeInTheDocument();
  });

  it('renders code blocks in ai answer correctly', () => {
    const messageWithCode = {
      question: 'Give me a code example.',
      answer:
        'Here\'s a code example:\n<pre>><code class="python">print("Hello, World!")\n</code></pre>',
      model: 'gpt-4'
    };
    render(
      <ChatMessage
        isNew={false}
        message={messageWithCode}
        lastIndex={lastIndex}
        loading={loading}
        fileSrc={fileSrc}
        selectedModel={selectedModel}
        handleModelChange={handleModelChange}
        modelOptions={modelOptions}
        handleFileDelete={handleFileDelete}
        handleRetry={handleRetry}
        handleCopy={handleCopy}
      />
    );
    expect(screen.getByText("Here's a code example:")).toBeInTheDocument();
    expect(screen.getByText('print("Hello, World!")')).toBeInTheDocument();
    const codeBlock = screen.getByText('print("Hello, World!")');
    expect(codeBlock.closest('pre')).toBeInTheDocument();
    expect(codeBlock.closest('code')).toHaveClass('python');
  });

  it('renders retry and copy buttons when lastIndex is true', () => {
    render(
      <ChatMessage
        isNew={false}
        message={message}
        lastIndex={true}
        loading={false}
        fileSrc={fileSrc}
        selectedModel={selectedModel}
        handleModelChange={handleModelChange}
        modelOptions={modelOptions}
        handleFileDelete={handleFileDelete}
        handleRetry={handleRetry}
        handleCopy={handleCopy}
      />
    );
    expect(screen.getByText('Retry')).toBeInTheDocument();
    expect(screen.getByText('Copy')).toBeInTheDocument();
  });

  it('renders model selector with selected model when lastIndex is true', () => {
    render(
      <ChatMessage
        isNew={false}
        message={message}
        lastIndex={true}
        loading={false}
        fileSrc={fileSrc}
        selectedModel={selectedModel}
        handleModelChange={handleModelChange}
        modelOptions={modelOptions}
        handleFileDelete={handleFileDelete}
        handleRetry={handleRetry}
        handleCopy={handleCopy}
      />
    );
    // Check if the selected model text is present
    expect(screen.getByText('GPT-4')).toBeInTheDocument();

    // Check if the model selector button is present
    const modelSelectorButton = screen.getByLabelText('Change Model');
    expect(modelSelectorButton).toBeInTheDocument();
  });

  it('calls handleRetry when retry button is clicked', () => {
    render(
      <ChatMessage
        isNew={false}
        message={message}
        lastIndex={true}
        loading={false}
        fileSrc={fileSrc}
        selectedModel={selectedModel}
        handleModelChange={handleModelChange}
        modelOptions={modelOptions}
        handleFileDelete={handleFileDelete}
        handleRetry={handleRetry}
        handleCopy={handleCopy}
      />
    );
    const retryButton = screen.getByText('Retry');
    fireEvent.click(retryButton);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('calls handleCopy when copy button is clicked', () => {
    render(
      <ChatMessage
        isNew={false}
        message={message}
        lastIndex={true}
        loading={false}
        fileSrc={fileSrc}
        selectedModel={selectedModel}
        handleModelChange={handleModelChange}
        modelOptions={modelOptions}
        handleFileDelete={handleFileDelete}
        handleRetry={handleRetry}
        handleCopy={handleCopy}
      />
    );
    const copyButton = screen.getByText('Copy');
    fireEvent.click(copyButton);
    expect(handleCopy).toHaveBeenCalledTimes(1);
  });

  it('calls handleModelChange when a new model is selected', () => {
    render(
      <ChatMessage
        isNew={false}
        message={message}
        lastIndex={true}
        loading={false}
        fileSrc={fileSrc}
        selectedModel={selectedModel}
        handleModelChange={handleModelChange}
        modelOptions={modelOptions}
        handleFileDelete={handleFileDelete}
        handleRetry={handleRetry}
        handleCopy={handleCopy}
      />
    );

    const customSelectTrigger = screen.getByText('GPT-4');

    // Simulate clicking the select trigger to open the dropdown
    fireEvent.click(customSelectTrigger);

    const gpt35Option = screen.getByText('GPT-3.5 Turbo');
    fireEvent.click(gpt35Option);

    expect(handleModelChange).toHaveBeenCalledWith(modelOptions[0]);
  });

  it('does not render retry and copy buttons when lastIndex is false', () => {
    render(
      <ChatMessage
        isNew={false}
        message={message}
        lastIndex={false}
        loading={false}
        fileSrc={fileSrc}
        selectedModel={selectedModel}
        handleModelChange={handleModelChange}
        modelOptions={modelOptions}
        handleFileDelete={handleFileDelete}
        handleRetry={handleRetry}
        handleCopy={handleCopy}
      />
    );
    expect(screen.queryByText('Retry')).not.toBeInTheDocument();
    expect(screen.queryByText('Copy')).not.toBeInTheDocument();
  });

  it('ChatMessage component snapshot', () => {
    const { asFragment } = render(
      <ChatMessage
        isNew={false}
        message={message}
        lastIndex={lastIndex}
        loading={loading}
        fileSrc={fileSrc}
        selectedModel={selectedModel}
        handleModelChange={handleModelChange}
        modelOptions={modelOptions}
        handleFileDelete={handleFileDelete}
        handleRetry={handleRetry}
        handleCopy={handleCopy}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
