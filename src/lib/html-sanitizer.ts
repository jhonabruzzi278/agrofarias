const ALLOWED_TAGS = new Set([
  'p', 'br', 'strong', 'em', 'u', 's', 'a', 'ul', 'ol', 'li',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'blockquote', 'code', 'pre',
  'img', 'span', 'div', 'section', 'article',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'b', 'i', 'small', 'sub', 'sup',
])

const ALLOWED_ATTRS = new Set(['href', 'src', 'alt', 'title', 'target', 'rel', 'class', 'id', 'loading'])

const URI_REGEX = /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i

function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}

export function sanitizeHTML(html: string | undefined | null): string {
  if (!html) return ''

  let result = html

  result = result.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  result = result.replace(/<script[^>]*\/>/gi, '')
  result = result.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
  result = result.replace(/on\w+\s*=\s*\S+/gi, '')
  result = result.replace(/javascript\s*:/gi, '')
  result = result.replace(/vbscript\s*:/gi, '')
  result = result.replace(/data\s*:/gi, '')

  result = result.replace(/<!--[\s\S]*?-->/g, '')

  return result
}
