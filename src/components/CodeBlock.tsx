import React, { useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter/dist/cjs/prism';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { RiFileCopyLine, RiCheckLine, RiTextWrap } from 'react-icons/ri';

interface CodeBlockProps {
  code: string;
  language: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);
  const [wrapLine, setWrapLine] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const toggleWrap = () => {
    setWrapLine(!wrapLine);
  };

  return (
    <div className="relative border border-gray-200 rounded-md">
      <div className="flex justify-between items-center bg-gray-100 px-4 py-2 rounded-t-md">
        <span className="text-sm font-medium text-gray-600">
          {language || 'Code'}
        </span>
        <div className="flex space-x-2">
          <button
            onClick={toggleWrap}
            className="p-1 rounded-md hover:bg-gray-200 transition-colors"
            title={wrapLine ? 'Unwrap lines' : 'Wrap lines'}
          >
            <RiTextWrap
              size={18}
              className={wrapLine ? 'text-blue-500' : ''}
              role="img"
              aria-label="Wrap lines"
            />
          </button>
          <button
            onClick={handleCopy}
            className="p-1 rounded-md hover:bg-gray-200 transition-colors"
            title="Copy code"
          >
            {copied ? (
              <RiCheckLine
                size={18}
                className="text-green-500"
                role="img"
                aria-label="Copy code"
              />
            ) : (
              <RiFileCopyLine size={18} role="img" aria-label="Copy code" />
            )}
          </button>
        </div>
      </div>
      <div className="relative">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{
            padding: '1em',
            borderRadius: '5px',
            fontSize: '14px',
            maxWidth: '100%',
            overflowX: 'auto'
          }}
          wrapLongLines={wrapLine}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default CodeBlock;
