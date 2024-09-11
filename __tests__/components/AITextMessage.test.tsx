import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import AITextMessage, { format } from '@/src/components/AITextMessage';

describe('AITextMessage Component', () => {
  it('renders plain text correctly', () => {
    render(<AITextMessage content="Hello, World!" />);
    expect(screen.getByText('Hello, World!')).toBeInTheDocument();
  });

  it('formats inline code correctly', () => {
    render(
      <AITextMessage content="Use <code>console.log()</code> function." />
    );
    const inlineCode = screen.getByText('console.log()');
    expect(inlineCode).toBeInTheDocument();
    expect(inlineCode.tagName).toBe('CODE');
    expect(inlineCode).toHaveClass('inline-code');
  });

  it('formats code blocks correctly', () => {
    const content = "```python\ndef hello():\n    print('Hello, World!')\n```";
    render(<AITextMessage content={content} />);
    const codeBlock = screen.getByRole('code');
    expect(codeBlock).toBeInTheDocument();
    expect(codeBlock).toHaveClass('language-python');
    expect(codeBlock).toHaveTextContent(/def hello\(\):/);
    expect(codeBlock).toHaveTextContent(/print\('Hello, World!'\)/);
  });

  it('handles multiple code blocks and text content', () => {
    const content = `
      Here's some Python code:
      \`\`\`python
      print('Hello')
      \`\`\`
      And here's some JavaScript:
      \`\`\`javascript
      console.log('Hello');
      \`\`\`
    `;
    render(<AITextMessage content={content} />);

    expect(screen.getByText(/Here's some Python code:/)).toBeInTheDocument();
    expect(screen.getByText(/And here's some JavaScript:/)).toBeInTheDocument();

    const codeBlocks = screen.getAllByRole('code');
    expect(codeBlocks).toHaveLength(2);

    const pythonCode = codeBlocks[0];
    expect(pythonCode).toHaveTextContent("print('Hello')");
    expect(pythonCode).toHaveClass('language-python');

    const jsCode = codeBlocks[1];
    expect(jsCode).toHaveTextContent("console.log('Hello');");
    expect(jsCode).toHaveClass('language-javascript');
  });

  it('handles code blocks without language specification', () => {
    const content = "```\nconsole.log('Hello');\n```";
    render(<AITextMessage content={content} />);
    const codeBlock = screen.getByText(
      (content, element) =>
        element?.tagName.toLowerCase() === 'code' &&
        content.includes("console.log('Hello');")
    );
    expect(codeBlock).toBeInTheDocument();
    expect(codeBlock.closest('code')).not.toHaveAttribute('class');
  });

  it('handles mixed content with text, inline code, and code blocks', () => {
    const content = `
      Here's some text with <code class="inline-code">inline code</code>.
      \`\`\`python
      def greet(name):
          print(f"Hello, {name}!")
      \`\`\`
      And more text after the code block.
    `;
    render(<AITextMessage content={content} />);

    // Check for the initial text
    expect(screen.getByText(/Here's some text with/)).toBeInTheDocument();

    // Check for inline code
    const inlineCode = screen.getByText('inline code');
    expect(inlineCode).toHaveClass('inline-code');

    // Check for the code block
    const codeBlock = screen.getByText((_, element) => {
      return (
        element.tagName.toLowerCase() === 'code' &&
        element.textContent.includes('def greet(name):')
      );
    });
    expect(codeBlock).toBeInTheDocument();
    expect(codeBlock.closest('pre')).toBeInTheDocument();
    expect(codeBlock).toHaveTextContent(/def greet\(name\):/);
    expect(codeBlock).toHaveTextContent(/print\(f"Hello, {name}!"\)/);
    expect(codeBlock).toHaveClass('language-python');

    // Check for the text after the code block
    expect(
      screen.getByText(/And more text after the code block./)
    ).toBeInTheDocument();
  });
});

describe('format function', () => {
  it('converts newlines to <br> tags', () => {
    const input = 'Line 1\nLine 2';
    const result = format(input);
    expect(result).toBe('Line 1<br>Line 2');
  });

  it('adds inline-code class to inline code', () => {
    const input = 'Use <code>console.log()</code>';
    const result = format(input);
    expect(result).toContain('<code class="inline-code">console.log()</code>');
  });

  it('formats code blocks correctly', () => {
    const input = '```javascript\nconsole.log("Hello");\n```';
    const result = format(input);
    expect(result).toContain(
      '<pre><code class="language-javascript">console.log("Hello");</code></pre>'
    );
  });

  it('handles code blocks without language specification', () => {
    const input = '```\nconsole.log("Hello");\n```';
    const result = format(input);
    expect(result).toContain('<pre><code >console.log("Hello");</code></pre>');
  });

  it('handles multiple code blocks with different languages', () => {
    const input =
      '```python\nprint("Hello")\n```\nSome text\n```javascript\nconsole.log("World");\n```';
    const result = format(input);
    expect(result).toContain(
      '<pre><code class="language-python">print("Hello")</code></pre>'
    );
    expect(result).toContain('Some text');
    expect(result).toContain(
      '<pre><code class="language-javascript">console.log("World");</code></pre>'
    );
  });

  it('preserves existing <br> tags', () => {
    const input = 'Line 1<br>Line 2';
    const result = format(input);
    expect(result).toBe('Line 1<br>Line 2');
  });
});
