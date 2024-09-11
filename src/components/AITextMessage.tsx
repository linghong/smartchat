import CodeBlock from '@/src/components/CodeBlock';
import { decodeHTMLEntities } from '@/src/utils/guardrail';
import { marked } from 'marked';

/**
 * Function to process a text message
 * This functions do the following things:
 * convert new line to <br>
 * add class="inline-code" in <code /> tag
 * - Adds <pre><code class="language-xxx"></code></pre> tags around code blocks with language
 * @param text - The string.
 * @returns The processed string.
 */
export const format = (text: string) => {
  // First handle the case where <br> tags are already present, for example, gpt4-o's message has <br>
  let formatted = text.replace(/<br>/g, '\n');

  // Protect code blocks with language specifier by replacing newlines within them
  formatted = formatted.replace(
    /```(\w+)?\n([\s\S]*?)```/g,
    (match, lang, code) => {
      const protectedCode = code.replace(/\n/g, '&!newline!&');
      return `\`\`\`${lang || ''}&!newline!&${protectedCode}&!newline!&\`\`\``;
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
  const formattedContent = format(content);
  // separate text and code
  const parts = [];

  const codeRegex =
    /<pre><code(?: class="language-(\w+)")?>([\s\S]*?)<\/code><\/pre>/g;
  let lastIndex = 0;
  let match;

  while ((match = codeRegex.exec(formattedContent)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <span
          key={lastIndex}
          dangerouslySetInnerHTML={{
            __html: marked(
              formattedContent.slice(lastIndex, match.index)
            ) as string
          }}
        />
      );
    }

    const [, language, code] = match;
    parts.push(
      <CodeBlock
        key={match.index}
        code={decodeHTMLEntities(code)}
        language={language}
      />
    );

    lastIndex = match.index + match[0].length;
  }

  // When there is zero codeblock in the text
  // Or when there is no more codeblocks found, but still have some text left
  if (lastIndex < formattedContent.length) {
    parts.push(
      <span
        key={lastIndex}
        dangerouslySetInnerHTML={{
          __html: marked(formattedContent.slice(lastIndex)) as string
        }}
      />
    );
  }

  // return an array of components
  return <>{parts}</>;
};

export default AITextMessage;
