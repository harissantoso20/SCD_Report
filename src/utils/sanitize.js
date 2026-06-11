/**
 * Utility functions for data sanitization and type coercion to improve security.
 */

export const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  // Strip potentially dangerous HTML tags
  return str.replace(/<[^>]*>?/gm, '').trim();
};

export const safeNumber = (value) => {
  const num = Number(value);
  return Number.isNaN(num) ? 0 : num;
};

export const safeString = (value) => {
  if (value === null || value === undefined) return '';
  return String(value);
};

