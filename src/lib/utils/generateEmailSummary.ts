export function generateEmailSummary(html: string, maxLength: number = 300): string {
  const strippedText = html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // remove style tags
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // remove script tags
    .replace(/<\/?[^>]+(>|$)/g, '') // remove HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

  if (strippedText.length > maxLength) {
    return strippedText.slice(0, maxLength).trim() + '...';
  }

  return strippedText;
}
