import sanitizeHtml from 'sanitize-html'

/**
 * Sanitiza HTML proveniente del CMS/WooCommerce antes de renderizarlo con
 * `set:html`. Usa la librería `sanitize-html` (parser real, no regex) para
 * evitar bypasses de mutation-XSS que afectan a los saneadores caseros.
 */
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'p', 'br', 'strong', 'em', 'u', 's', 'a', 'ul', 'ol', 'li',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'blockquote', 'code', 'pre',
    'img', 'span', 'div', 'section', 'article',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'b', 'i', 'small', 'sub', 'sup',
  ],
  allowedAttributes: {
    '*': ['class', 'id', 'title'],
    a: ['href', 'target', 'rel'],
    img: ['src', 'alt', 'loading'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowProtocolRelative: true,
  // Fuerza rel seguro en enlaces que abren en pestaña nueva.
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer nofollow' }),
  },
  disallowedTagsMode: 'discard',
}

export function sanitizeHTML(html: string | undefined | null): string {
  if (!html) return ''
  return sanitizeHtml(html, OPTIONS)
}
