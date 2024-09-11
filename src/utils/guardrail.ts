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
export const decodeHTMLEntities = (input: string) => {
  const entityMap: { [key: string]: string } = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
    //LatinCharacters Symbols
    '&copy;': '©', //copy right
    '&reg;': '®', //registered trademark symbol
    '&trade;': '™', //trademark
    '&euro;': '€',
    '&pound;': '£',
    '&yen;': '¥',
    '&cent;': '¢',
    '&sect;': '§',
    '&deg;': '°', //degree symbol
    '&plusmn;': '±',
    '&frac12;': '½',
    '&frac14;': '¼',
    '&frac34;': '¾',
    //mathematical Symbols
    '&times;': '×',
    '&divide;': '÷',
    '&le;': '≤',
    '&ge;': '≥',
    '&ne;': '≠',
    'approx;': '≈',
    '&sup2;': '²',
    '&sup3;': '³',
    // Common Greek Letters
    '&alpha': 'α', //lowercase alpha
    '&beta;': 'β', //lowercase beta
    '&gamma;': 'γ', //lowercase gamma
    '&delta;': 'δ', //lowercase delta
    '&epsilon;': 'ε', //lowercase epsilon
    '&theta;': 'θ', //lowercase theta
    '&lambda;': 'λ', //lowercase lambda
    '&mu;': 'μ', //lowercase mu
    '&pi;': 'π', //lowercase pi
    '&sigma;': 'σ', //lowercase sigma
    '&omega;': 'ω', //lowercase omega
    //
    '&hellip;': '…',
    '&ndash;': '–',
    '&mdash;': '—',
    '&lsquo;': '‘',
    '&rsquo;': '’',
    '&ldquo;': '“',
    '&rdquo;': '”',
    '&bull;': '•',
    '&middot;': '·'
  };

  return input.replace(/&[a-zA-Z0-9#]+;/g, match => entityMap[match] || match);
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
export const sanitizeWithPreserveCode = (input: string): string => {
  const encodedInput = encodeHTMLEntities(input);

  const sanitizedInput = DOMPurify.sanitize(encodedInput);

  return decodeHTML(sanitizedInput);
};
