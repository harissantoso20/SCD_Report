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

/**
 * Safely converts a value to an integer (rounds to nearest whole number).
 * Use for columns with type bigint/integer in the database to prevent
 * "invalid input syntax for type bigint" errors when decimal values are entered.
 */
export const safeInteger = (value) => {
  const num = Number(value);
  return Number.isNaN(num) ? 0 : Math.round(num);
};

export const safeString = (value) => {
  if (value === null || value === undefined) return '';
  return String(value);
};

