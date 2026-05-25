const ALLOWED_TAGS = new Set([
  'p', 'br', 'strong', 'em', 'u', 's', 'a', 'ul', 'ol', 'li',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'blockquote', 'code', 'pre',
  'img', 'span', 'div', 'section', 'article',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'b', 'i', 'small', 'sub', 'sup',
])

const ALLOWED_ATTRS = new Set(['href', 'src', 'alt', 'title', 'target', 'rel', 'class', 'id', 'loading'])

const SAFE_URL_PATTERN = /^(?:(?:f|ht)tps?:|\/\/|mailto:|tel:|#|\/)/i

function cleanAttributes(tagName: string, attrs: string): string {
  const result: string[] = []
  const attrRegex = /([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+))/g
  let match: RegExpExecArray | null
  while ((match = attrRegex.exec(attrs)) !== null) {
    const attrName = match[1].toLowerCase()
    const attrValue = match[2] || match[3] || match[4] || ''
    if (!ALLOWED_ATTRS.has(attrName)) continue
    if ((attrName === 'href' || attrName === 'src') && !SAFE_URL_PATTERN.test(attrValue)) continue
    if (attrName === 'target' && !['_blank', '_self', '_parent', '_top'].includes(attrValue)) continue
    const escaped = attrValue.replace(/"/g, '&quot;')
    result.push(`${attrName}="${escaped}"`)
  }
  return result.length > 0 ? ' ' + result.join(' ') : ''
}

export function sanitizeHTML(html: string | undefined | null): string {
  if (!html) return ''

  let result = ''
  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)((?:\s[^>]*)?)\s*(\/?)>/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = tagRegex.exec(html)) !== null) {
    const textBefore = html.slice(lastIndex, match.index)
    result += textBefore.replace(/</g, '&lt;').replace(/>/g, '&gt;')

    const fullMatch = match[0]
    const isClosing = fullMatch.startsWith('</')
    const isSelfClosing = fullMatch.endsWith('/>')
    const tagName = match[1].toLowerCase()
    const attrsStr = match[2] || ''

    if (!ALLOWED_TAGS.has(tagName)) {
      lastIndex = match.index + fullMatch.length
      continue
    }

    if (isClosing) {
      result += `</${tagName}>`
    } else if (isSelfClosing) {
      const attrs = cleanAttributes(tagName, attrsStr)
      result += `<${tagName}${attrs} />`
    } else {
      const attrs = cleanAttributes(tagName, attrsStr)
      result += `<${tagName}${attrs}>`
    }

    lastIndex = match.index + fullMatch.length
  }

  result += html.slice(lastIndex).replace(/</g, '&lt;').replace(/>/g, '&gt;')

  result = result.replace(/<!--[\s\S]*?-->/g, '')
  result = result.replace(/javascript\s*:/gi, '')
  result = result.replace(/on\w+\s*=/gi, 'data-removed-')

  return result
}
