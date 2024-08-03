import React from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter/dist/cjs/prism';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface CodeBlockProps {
  code: string;
  language: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  return (
    <SyntaxHighlighter
      language={language}
      style={vscDarkPlus}
      customStyle={{
        padding: '1em',
        borderRadius: '5px',
        fontSize: '14px'
      }}
    >
      {code}
    </SyntaxHighlighter>
  );
};

export default CodeBlock;
