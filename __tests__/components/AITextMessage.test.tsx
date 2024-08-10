import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AITextMessage, {
  sanitizeAndFormate
} from '@/src/components/AITextMessage';

describe('AITextMessage Component', () => {
  it('renders plain text correctly', () => {
    render(<AITextMessage content="Hello, World!" />);
    expect(screen.getByText('Hello, World!')).toBeInTheDocument();
  });

  it('sanitizes HTML content', () => {
    render(
      <AITextMessage content="<script>alert('XSS')</script>Safe content" />
    );
    expect(screen.queryByText("alert('XSS')")).not.toBeInTheDocument();
    expect(screen.getByText('Safe content')).toBeInTheDocument();
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

    // Updated Assertion
    const codeBlock = screen.getByText((content, element) => {
      return (
        element?.tagName.toLowerCase() === 'code' &&
        content.includes(`print('Hello, World!')`)
      );
    });
    expect(codeBlock).toBeInTheDocument();
    expect(codeBlock.closest('code')).toHaveClass('language-python');
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

    expect(
      screen.getByText((content, element) =>
        content.includes("Here's some Python code:")
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText((content, element) =>
        content.includes("And here's some JavaScript:")
      )
    ).toBeInTheDocument();

    const pythonCode = screen.getByText((content, element) => {
      return (
        element?.tagName.toLowerCase() === 'code' &&
        content.includes("print('Hello')")
      );
    });
    expect(pythonCode).toBeInTheDocument();
    expect(pythonCode.className).toContain('language-python');

    const jsCode = screen.getByText((content, element) => {
      return (
        element?.tagName.toLowerCase() === 'code' &&
        content.includes("console.log('Hello');")
      );
    });
    expect(jsCode).toBeInTheDocument();
    expect(jsCode.className).toContain('language-javascript');
  });

  it('handles code blocks without language specification', () => {
    const content = "```\nconsole.log('Hello');\n```";
    render(<AITextMessage content={content} />);
    const codeBlock = screen.getByText((content, element) => {
      return (
        element?.tagName.toLowerCase() === 'code' &&
        content.includes("console.log('Hello');")
      );
    });
    expect(codeBlock).toBeInTheDocument();
    expect(codeBlock.className).toContain('language-undefined');
  });
});

describe('sanitizeAndFormate function', () => {
  it('sanitizes HTML content', () => {
    const input = '<script>alert("XSS")</script><p>Safe content</p>';
    const result = sanitizeAndFormate(input);
    expect(result).not.toContain('<script>');
    expect(result).toContain('<p>Safe content</p>');
  });

  it('converts newlines to <br> tags', () => {
    const input = 'Line 1\nLine 2';
    const result = sanitizeAndFormate(input);
    expect(result).toBe('Line 1<br>Line 2');
  });

  it('adds inline-code class to inline code', () => {
    const input = 'Use <code>console.log()</code>';
    const result = sanitizeAndFormate(input);
    expect(result).toContain('<code class="inline-code">console.log()</code>');
  });

  it('formats code blocks correctly', () => {
    const input = '```javascript\nconsole.log("Hello");\n```';
    const result = sanitizeAndFormate(input);
    expect(result).toContain(
      '<pre><code class="language-javascript">console.log("Hello");</code></pre>'
    );
  });

  it('handles code blocks without language specification', () => {
    const input = '```\nconsole.log("Hello");\n```';
    const result = sanitizeAndFormate(input);
    expect(result).toContain(
      '<pre><code class="language-undefined">console.log("Hello");</code></pre>'
    );
  });
});
