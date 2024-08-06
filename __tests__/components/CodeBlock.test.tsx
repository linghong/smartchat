import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CodeBlock from '@/src/components/CodeBlock';

// Mock the SyntaxHighlighter component
jest.mock('react-syntax-highlighter/dist/cjs/prism', () => {
  const MockSyntaxHighlighter: React.FC<{
    children: string;
    language: string;
    style: any;
    customStyle: React.CSSProperties;
  }> = ({ children, language, customStyle }) => (
    <pre
      data-testid="mock-syntax-highlighter"
      data-language={language}
      style={customStyle}
    >
      {children}
    </pre>
  );
  MockSyntaxHighlighter.displayName = 'MockSyntaxHighlighter';
  return MockSyntaxHighlighter;
});

describe('CodeBlock', () => {
  const testCode = 'const greeting = "Hello, World!";';
  const testLanguage = 'javascript';

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
      borderRadius: '5px',
      fontSize: '14px'
    });
  });

  it('renders different languages correctly', () => {
    const pythonCode = 'print("Hello, World!")';
    render(<CodeBlock code={pythonCode} language="python" />);
    const syntaxHighlighter = screen.getByTestId('mock-syntax-highlighter');

    expect(syntaxHighlighter).toHaveAttribute('data-language', 'python');
    expect(syntaxHighlighter).toHaveTextContent(pythonCode);
  });

  it('matches snapshot', () => {
    const { asFragment } = render(
      <CodeBlock code={testCode} language={testLanguage} />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
