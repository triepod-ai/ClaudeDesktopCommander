/**
 * Utility functions for handling markdown content
 */

/**
 * Extract code blocks from markdown text
 * Returns an array of objects with language and code properties
 */
export const extractCodeBlocks = (markdown: string): { language: string; code: string }[] => {
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  const codeBlocks: { language: string; code: string }[] = [];
  
  let match;
  while ((match = codeBlockRegex.exec(markdown)) !== null) {
    codeBlocks.push({
      language: match[1] || 'text',
      code: match[2].trim(),
    });
  }
  
  return codeBlocks;
};

/**
 * Convert plain text with URLs to markdown links
 */
export const convertUrlsToLinks = (text: string): string => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, (url) => `[${url}](${url})`);
};

/**
 * Sanitize markdown to prevent XSS
 */
export const sanitizeMarkdown = (markdown: string): string => {
  // Remove script tags and their content
  let sanitized = markdown.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Replace potentially harmful HTML tags with safe alternatives
  sanitized = sanitized.replace(/<iframe/gi, '&lt;iframe');
  sanitized = sanitized.replace(/<embed/gi, '&lt;embed');
  sanitized = sanitized.replace(/<object/gi, '&lt;object');
  
  return sanitized;
};

/**
 * Convert a plain text block to markdown-friendly format
 * - Adds proper line breaks
 * - Escapes special characters
 * - Converts URLs to links
 */
export const textToMarkdown = (text: string): string => {
  // Escape special markdown characters
  let markdown = text
    .replace(/\*/g, '\\*')
    .replace(/\#/g, '\\#')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
  
  // Convert URLs to links
  markdown = convertUrlsToLinks(markdown);
  
  // Ensure proper line breaks (two spaces at the end of a line for markdown line break)
  markdown = markdown.replace(/\n/g, '  \n');
  
  return markdown;
};
