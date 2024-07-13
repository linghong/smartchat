import React, { useState } from 'react';
import Link from 'next/link';
import {
  AiFillCaretDown,
  AiFillCaretUp,
  AiOutlineRobot,
  AiOutlineBulb
} from 'react-icons/ai';

interface AIHubLink {
  title: string;
  href: string;
  external?: boolean;
}

const links: AIHubLink[] = [
  { title: 'Model List', href: '#' },
  { title: 'Prompt Templates', href: '#' }
];

const AIHub: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`w-full ${isOpen ? 'bg-slate-300 ' : 'bg-slate-400'} border-t border-gray-700`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="ai-hub-menu"
        className="flex items-center justify-between w-full px-4 py-2 text-left text-gray-600 hover:bg-gray-300 hover:text-gray-600 transition-colors duration-200"
      >
        <span className="flex items-center">
          <AiOutlineBulb size={20} className="mr-2" />
          <span className="font-medium">AI Hub</span>
        </span>
        {isOpen ? (
          <AiFillCaretDown size={20} aria-label="caret-down" />
        ) : (
          <AiFillCaretUp size={20} aria-label="caret-up" />
        )}
      </button>
      {isOpen && (
        <div
          role="menu"
          aria-labelledby="ai-hub-button"
          className="bg-slate-500 border-t border-gray-700"
        >
          {links.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className="flex items-center justify-between px-4 py-2 text-sm text-gray-300 border-t border-gray-400 hover:bg-gray-600 transition-colors duration-200"
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
              role="menuitem"
            >
              {link.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIHub;
