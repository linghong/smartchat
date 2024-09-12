import {
  encodeHTMLEntities,
  decodeHTMLEntitiesAndReferences,
  stripPreCodeTags,
  sanitizeWithPreserveCode
} from '@/src/utils/guardrail';

describe('Guardrail Functions', () => {
  describe('encodeHTMLEntities', () => {
    it('should encode special HTML characters', () => {
      const input = '<div>Hello & "World" \'Test\'</div>';
      const expected =
        '&lt;div&gt;Hello &amp; &quot;World&quot; &#039;Test&#039;&lt;/div&gt;';
      expect(encodeHTMLEntities(input)).toBe(expected);
    });

    it('should not modify regular text', () => {
      const input = 'Regular text without special characters';
      expect(encodeHTMLEntities(input)).toBe(input);
    });
  });

  describe('decodeHTMLEntities', () => {
    it('should decode HTML entities back to characters', () => {
      const input = '<div>Hello & "World"</div>';
      const expected = '<div>Hello & "World"</div>';
      expect(decodeHTMLEntitiesAndReferences(input)).toBe(expected);
    });

    it('should decode additional HTML entities', () => {
      const input = '© ® ™';
      const expected = '© ® ™';
      expect(decodeHTMLEntitiesAndReferences(input)).toBe(expected);
    });

    it('should decode mathematical symbols', () => {
      const input = '&times; &divide; &le; &ge; &ne; &approx; &sup2; &sup3;';
      const expected = '× ÷ ≤ ≥ ≠ ≈ ² ³';
      expect(decodeHTMLEntitiesAndReferences(input)).toBe(expected);
    });

    it('should decode Greek letters', () => {
      const input =
        '&alpha; &beta; &gamma; &delta; &epsilon; &theta; &lambda; &mu; &pi; &sigma; &omega;';
      const expected = 'α β γ δ ε θ λ μ π σ ω';
      expect(decodeHTMLEntitiesAndReferences(input)).toBe(expected);
    });

    it('should decode punctuation and typography entities', () => {
      const input =
        '&hellip; &ndash; &mdash; &lsquo; &rsquo; &ldquo; &rdquo; &bull; &middot;';
      const expected = `… – — \u2018 \u2019 \u201C \u201D • ·`;
      expect(decodeHTMLEntitiesAndReferences(input)).toBe(expected);
    });

    it('should not modify unrecognized entities', () => {
      const input = '&unknown; entity';
      expect(decodeHTMLEntitiesAndReferences(input)).toBe(input);
    });

    it('should correctly decode curly quotes', () => {
      const input = '&ldquo;Hello&rdquo;';
      const decoded = decodeHTMLEntitiesAndReferences(input);
      expect(decoded.charCodeAt(0)).toBe(8220); //Decimal Code Point.  &#8220; will render “ (left double quotation mark). Use this in HTML when specifying a numeric character reference.
      expect(decoded.charCodeAt(decoded.length - 1)).toBe(8221); // Right double quotation mark
    });

    it('decodes decimal numeric HTML entities', () => {
      const input = '&#8220;Hello&#8221; &#169; &#8364;';
      const expected = '“Hello” © €';
      const result = decodeHTMLEntitiesAndReferences(input);
      expect(result).toBe(expected);
    });

    it('decodes hexadecimal numeric HTML entities', () => {
      const input = '&#x201C;Hello&#x201D; &#xA9; &#x20AC;';
      const expected = '“Hello” © €';
      const result = decodeHTMLEntitiesAndReferences(input);
      expect(result).toBe(expected);
    });

    it('decodes mixed HTML entities', () => {
      const input = '&ldquo;Hello&#8221; &#xA9; &euro;';
      const expected = '“Hello” © €';
      const result = decodeHTMLEntitiesAndReferences(input);
      expect(result).toBe(expected);
    });
  });

  describe('stripPreCodeTags', () => {
    it('should handle nested tags', () => {
      const input = '<pre>Outer <code>Inner</code> Text</pre>';
      const expected = 'Outer Inner Text';
      expect(stripPreCodeTags(input)).toBe(expected);
    });

    it('should handle input without <pre> or <code class="inline-code"> tags', () => {
      const input = 'No tags here!';
      expect(stripPreCodeTags(input)).toBe(input);
    });

    it('should handle input without <pre> or <code> tags', () => {
      const input = 'No tags here!';
      expect(stripPreCodeTags(input)).toBe(input);
    });
  });

  describe('sanitizeWithPreserveCode', () => {
    it('should sanitize and preserve HTML structure', () => {
      const input =
        '<p>Hello <strong>World</strong></p><script>alert("XSS");</script>';
      const expected = '<p>Hello <strong>World</strong></p>';
      expect(sanitizeWithPreserveCode(input)).toBe(expected);
    });

    it('should handle plain text input', () => {
      const input = 'Just some plain text.';
      const expected = 'Just some plain text.';
      expect(sanitizeWithPreserveCode(input)).toBe(expected);
    });

    it('should preserve code blocks', () => {
      const input = '<pre><code>const x = 5;</code></pre>';
      expect(sanitizeWithPreserveCode(input)).toBe(input);
    });

    it('should handle potentially malicious input', () => {
      const input =
        '<img src="x" onerror="alert(\'XSS\')"> <a href="javascript:alert(\'XSS\')">Click me</a>';
      const expected = '<img src="x"> <a>Click me</a>';
      expect(sanitizeWithPreserveCode(input)).toBe(expected);
    });
  });
});
