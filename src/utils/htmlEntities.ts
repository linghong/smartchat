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
 * Decodes HTML entities back into their corresponding characters.
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

export const stripPreCodeTags = (input: string) => {
  return input.replace(/<\/?pre>/g, '').replace(/<\/?code>/g, '');
};
