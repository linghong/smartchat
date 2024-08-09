import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act
} from '@testing-library/react';
import '@testing-library/jest-dom';
import CodeBlock from '@/src/components/CodeBlock';

// Mock the SyntaxHighlighter component
jest.mock('react-syntax-highlighter/dist/cjs/prism', () => {
  const MockSyntaxHighlighter: React.FC<{
    children: string;
    language: string;
    style: any;
    customStyle: React.CSSProperties;
    wrapLongLines: boolean;
  }> = ({ children, language, customStyle, wrapLongLines }) => (
    <pre
      data-testid="mock-syntax-highlighter"
      data-language={language}
      style={customStyle}
      data-wrap-lines={wrapLongLines || undefined}
    >
      {children}
    </pre>
  );
  MockSyntaxHighlighter.displayName = 'MockSyntaxHighlighter';
  return MockSyntaxHighlighter;
});

// Mock clipboard API
const mockClipboard = {
  writeText: jest.fn(() => Promise.resolve())
};
Object.assign(navigator, { clipboard: mockClipboard });

describe('CodeBlock', () => {
  const testCode = 'const greeting = "Hello, World!";';
  const testLanguage = 'javascript';

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('renders the CodeBlock component', () => {
    render(<CodeBlock code={testCode} language={testLanguage} />);
    const syntaxHighlighter = screen.getByTestId('mock-syntax-highlighter');
    expect(syntaxHighlighter).toBeInTheDocument();
  });

  it('passes the correct props to SyntaxHighlighter', () => {
    render(<CodeBlock code={testCode} language={testLanguage} />);
    const syntaxHighlighter = screen.getByTestId('mock-syntax-highlighter');

    expect(syntaxHighlighter).toHaveAttribute('data-language', testLanguage);
    expect(syntaxHighlighter).toHaveTextContent(testCode);
  });

  it('applies custom styles to SyntaxHighlighter', () => {
    render(<CodeBlock code={testCode} language={testLanguage} />);
    const syntaxHighlighter = screen.getByTestId('mock-syntax-highlighter');

    expect(syntaxHighlighter).toHaveStyle({
      padding: '1em',
      fontSize: '14px',
      maxWidth: '100%',
      overflowX: 'auto'
    });
  });

  it('toggles code wrapping', async () => {
    render(<CodeBlock code={testCode} language={testLanguage} />);
    const syntaxHighlighter = screen.getByTestId('mock-syntax-highlighter');
    const wrapButton = screen.getByTitle('Wrap lines');

    expect(syntaxHighlighter).not.toHaveAttribute('data-wrap-lines');

    await act(async () => {
      fireEvent.click(wrapButton);
    });

    expect(syntaxHighlighter).toHaveAttribute('data-wrap-lines', 'true');

    await act(async () => {
      fireEvent.click(wrapButton);
    });

    expect(syntaxHighlighter).not.toHaveAttribute('data-wrap-lines');
  });

  it('copies code to clipboard and shows confirmation', async () => {
    render(<CodeBlock code={testCode} language={testLanguage} />);
    const copyButton = screen.getByTitle('Copy code');

    // Assert the initial state
    const checkIcon = screen.getByRole('img', { name: /copy code/i });
    expect(checkIcon).not.toHaveClass('text-green-500');

    await act(async () => {
      fireEvent.click(copyButton);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(testCode);

    // Assert the state after clicking the "Copy code" button
    const updatedCheckIcon = screen.getByRole('img', { name: /copy code/i });
    expect(updatedCheckIcon).toHaveClass('text-green-500');

    await waitFor(
      () => {
        const finalCheckIcon = screen.getByRole('img', { name: /copy code/i });
        expect(finalCheckIcon).not.toHaveClass('text-green-500');
      },
      { timeout: 3000 }
    );
  });

  it('displays the correct language in the header', () => {
    render(<CodeBlock code={testCode} language={testLanguage} />);
    expect(screen.getByText(testLanguage)).toBeInTheDocument();
  });

  it('displays "Code" in the header when language is not provided', () => {
    render(<CodeBlock code={testCode} language="" />);
    expect(screen.getByText('Code')).toBeInTheDocument();
  });
});
