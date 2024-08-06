import React, { useState, useRef, useEffect } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter/dist/cjs/prism';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { RiFileCopyLine, RiCheckLine, RiTextWrap } from 'react-icons/ri';

interface CodeBlockProps {
  code: string;
  language: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [wrapLine, setWrapLine] = useState(true);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const toggleExpand = () => {
    setWrapLine(!wrapLine);
    setExpanded(!expanded);
  };

  return (
    <div className="relative border border-gray-200 rounded-md">
      <div className="flex justify-between items-center bg-gray-100 px-4 py-2 rounded-t-md">
        <span className="text-sm font-medium text-gray-600">
          {language || 'Code'}
        </span>
        <div className="flex space-x-2">
          <button
            onClick={toggleExpand}
            className="p-1 rounded-md hover:bg-gray-200 transition-colors"
            title={wrapLine ? 'Unwrap lines' : 'Wrap lines'}
          >
            <RiTextWrap size={18} className={wrapLine ? 'text-blue-500' : ''} />
          </button>
          <button
            onClick={handleCopy}
            className="p-1 rounded-md hover:bg-gray-200 transition-colors"
            title="Copy code"
          >
            {copied ? (
              <RiCheckLine size={18} className="text-green-500" />
            ) : (
              <RiFileCopyLine size={18} />
            )}
          </button>
        </div>
      </div>
      <div className={`relative overflow-x-auto`}>
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{
            padding: '1em',
            fontSize: '14px'
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
