/**
 * Generates a unique-enough client-side payment reference for manual
 * UPI transactions. Format: PREFIX-<base36 timestamp>-<random 4 chars>
 * e.g. AM-M1F2G3H4-K9X2
 */
export function generateReference(prefix: string): string {
  const time = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${time}-${random}`;
}
