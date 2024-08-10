import DOMPurify from 'isomorphic-dompurify';

import CodeBlock from '@/src/components/CodeBlock';
import { decodeHTMLEntities } from '@/src/utils/htmlEntities';

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
export const sanitizeAndFormate = (text: string) => {
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

const AITextMessage: React.FC<{ content: string }> = ({ content }) => {
  // separate text and code
  const parts = [];

  const codeRegex =
    /<pre><code(?: class="language-(\w+)")?>([\s\S]*?)<\/code><\/pre>/g;
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

  // When there is zero codeblock in the text
  // Or when there is no more codeblocks found, but still have some text left
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
  return <>{parts}</>;
};

export default AITextMessage;
