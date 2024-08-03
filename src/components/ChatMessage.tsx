import Image from 'next/image';
import DOMPurify from 'isomorphic-dompurify';

import CodeBlock from '@/src/components/CodeBlock';
import { Message, ImageFile } from '@/src/types/chat';
import ImageListWithModal from '@/src/components/ImageListWithModal';
import {
  encodeHTMLEntities,
  decodeHTMLEntities
} from '@/src/utils/htmlEntities';

type ChatMessageProps = {
  isNew: boolean;
  message: Message;
  lastIndex: boolean;
  loading: boolean;
  imageSrc: ImageFile[];
  handleImageDelete: (e: any) => void;
};

const ChatMessage: React.FC<ChatMessageProps> = ({
  isNew,
  message,
  imageSrc,
  lastIndex,
  loading,
  handleImageDelete
}) => {
  /**
   * Function to process a text message
   * This functions do the following things:
   * sanitize the string
   * convert new line to <br>
   * add class="inline-code" in <code /> tag
   * - Adds <pre><code class="language-xxx"></code></pre> tags around code blocks with language
   * @param text - The string.
   * @returns The processed string.
   */
  const sanitizeAndFormate = (text: string) => {
    const sanitizedText = DOMPurify.sanitize(text);

    // Protect code blocks with language specifier by replacing newlines within them
    let formatted = sanitizedText.replace(
      /```(\w+)?\n([\s\S]*?)```/g,
      (match, lang, code) => {
        const protectedCode = code.replace(/\n/g, '&!newline!&');
        return `\`\`\`${lang}&!newline!&${protectedCode}&!newline!&\`\`\``;
      }
    );

    // Then, replace newlines with <br> tags
    formatted = formatted.replace(/\n/g, '<br>');

    // Add a consistent class to inline <code> tags
    formatted = formatted.replace(
      /<code>(.*?)<\/code>/g,
      (match, p1) => `<code class="inline-code">${p1}</code>`
    );

    // Restore the newlines within code blocks and add appropriate tags
    formatted = formatted.replace(
      /```(\w+)?&!newline!&([\s\S]*?)&!newline!&```/g,
      (match, lang, code) => {
        const cleanCode = code.replace(/&!newline!&/g, '\n').trim();
        const languageClass = lang ? `class="language-${lang}"` : '';
        return `<pre><code ${languageClass}>${cleanCode}</code></pre>`;
      }
    );
    return formatted;
  };

  const renderMessage = (content: string) => {
    // separate text and code
    const parts = [];

    const codeRegex =
      /<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g;
    let lastIndex = 0;
    let match;

    while ((match = codeRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <span
            key={lastIndex}
            dangerouslySetInnerHTML={{
              __html: sanitizeAndFormate(content.slice(lastIndex, match.index))
            }}
          />
        );
      }

      const [, language, code] = match;
      parts.push(
        <CodeBlock
          key={match.index}
          code={decodeHTMLEntities(DOMPurify.sanitize(code))}
          language={language}
        />
      );

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push(
        <span
          key={lastIndex}
          dangerouslySetInnerHTML={{
            __html: sanitizeAndFormate(content.slice(lastIndex))
          }}
        />
      );
    }

    // return an array of components
    return parts;
  };

  return (
    <>
      {!isNew && (
        <article
          className="flex px-3 py-2 text-black"
          aria-label="user-message"
        >
          <div className="w-16 px-2 flex flex-col justify-start items-center user">
            <Image
              src="/user.png"
              alt="User avatar"
              width="30"
              height="30"
              className="h-8 w-8 mr-4 rounded-sm"
              priority
            />
          </div>
          <div className="flex-1 user-question">
            <div
              className="user-question styledComponent space-wrap"
              dangerouslySetInnerHTML={{
                __html: sanitizeAndFormate(encodeHTMLEntities(message.question))
              }}
            />
            {
              <ImageListWithModal
                imageSrc={imageSrc}
                handleImageDelete={handleImageDelete}
              />
            }
          </div>
        </article>
      )}
      <article
        className="flex px-3 py-2 bg-slate-100 text-black ease-in duration-300"
        aria-labelledby="ai-response"
      >
        <div className="w-16 px-2 flex flex-col justify-start items-center ai">
          <Image
            src="/bot.png"
            alt="AI avatar"
            width="30"
            height="30"
            className={`h-8 w-8 mr-4 rounded-sm ${loading && lastIndex && 'animate-pulse'}`}
            priority
          />
          <label className="text-xs">{message.model}</label>
        </div>
        <div className="flex-1 styledContent ai-answer space-wrap">
          {renderMessage(message.answer)}
        </div>
      </article>
    </>
  );
};

export default ChatMessage;
