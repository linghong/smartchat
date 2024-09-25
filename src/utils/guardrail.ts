import DOMPurify from 'dompurify';

/**
 * Encodes special characters into their corresponding HTML entities.
 * This function is useful for safely displaying user input in HTML,
 * preventing characters like <, >, &, ", and ' from being interpreted as HTML tags or attributes.
 *
 * @param input - The string containing characters to be encoded.
 * @returns The encoded string where special characters are replaced with HTML entities.
 */
export const encodeHTMLEntities = (input: string) => {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Decodes HTML entities back to their corresponding characters.
 * This function is useful for converting encoded HTML entities like &lt;, &gt;, &amp;, etc.,
 * back into their plain text equivalents for display or processing.
 *
 * @param input - The string containing HTML entities to be decoded.
 * @returns The decoded string where HTML entities are replaced with their corresponding characters.
 */
export const decodeHTMLEntitiesAndReferences = (input: string) => {
  const entityMap: { [key: string]: string } = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
    // Latin Characters Symbols
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™',
    '&euro;': '€',
    '&pound;': '£',
    '&yen;': '¥',
    '&cent;': '¢',
    '&sect;': '§',
    '&deg;': '°',
    '&plusmn;': '±',
    '&frac12;': '½',
    '&frac14;': '¼',
    '&frac34;': '¾',
    // Mathematical Symbols
    '&times;': '×',
    '&divide;': '÷',
    '&le;': '≤',
    '&ge;': '≥',
    '&ne;': '≠',
    '&approx;': '≈',
    '&sup2;': '²',
    '&sup3;': '³',
    // Common Greek Letters
    '&alpha;': 'α',
    '&beta;': 'β',
    '&gamma;': 'γ',
    '&delta;': 'δ',
    '&epsilon;': 'ε',
    '&theta;': 'θ',
    '&lambda;': 'λ',
    '&mu;': 'μ',
    '&pi;': 'π',
    '&sigma;': 'σ',
    '&omega;': 'ω',
    // Punctuation and Typography
    '&hellip;': '…',
    '&ndash;': '–',
    '&mdash;': '—',
    '&lsquo;': '\u2018', // Since the left single quotation mark character causes a type error, hence, replace it with Unicode Escape Sequence
    '&rsquo;': '\u2019',
    '&ldquo;': '“', // \u201C
    '&rdquo;': '”', // \u201D
    '&bull;': '•',
    '&middot;': '·'
  };

  let decodedStr = input.replace(
    /&[a-zA-Z0-9#]+;/g,
    match => entityMap[match] || match
  );

  // Now, handle numeric entities (decimal and hexadecimal)
  decodedStr = decodedStr.replace(/&#(\d+);/g, (match, dec) =>
    String.fromCharCode(parseInt(dec, 10))
  );
  decodedStr = decodedStr.replace(/&#x([a-fA-F0-9]+);/g, (match, hex) =>
    String.fromCharCode(parseInt(hex, 16))
  );

  return decodedStr;
};
/**
 * Decodes HTML entities back to their original characters.
 * @param input - The string with HTML entities to be decoded.
 * @returns The input string with HTML entities converted back to characters.
 */
function decodeHTML(input: string): string {
  return input
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&');
}

export const stripPreCodeTags = (input: string) => {
  return input.replace(/<\/?pre>/g, '').replace(/<\/?code>/g, '');
};

/**
 * Sanitizes and preserves HTML/JSX code in the input.
 * This function is safe to use for user input, AI-generated messages, and displaying text.
 * @param input - The string containing HTML/JSX to be sanitized.
 * @returns A sanitized version of the input with HTML/JSX structure preserved.
 */
export const sanitizeWithPreserveHTML = (input: string): string => {
  const config = {
    ALLOWED_TAGS: [
      'p',
      'strong',
      'em',
      'u',
      'pre',
      'code',
      'br',
      'img',
      'a',
      'svg',
      'figure',
      'table',
      'caption',
      'thead',
      'tr',
      'th',
      'tbody',
      'td',
      'span',
      'div',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'textarea',
      'ul',
      'li',
      'ol',
      'button',
      'select',
      'option',
      'article',
      'section',
      'form',
      'input',
      'label'
    ],
    ALLOWED_ATTR: [
      'href',
      'src',
      'alt',
      'class',
      'rel',
      'id',
      'name',
      'type',
      'value',
      'placeholder',
      'for'
    ]
  };
  const sanitizedInput = DOMPurify.sanitize(input, config);

  return `${sanitizedInput}`;
};
