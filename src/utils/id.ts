/**
 * Generates a unique-enough client-side ID for new Firestore documents
 * (FAQ/rule items, support tickets, tournaments, admin-side records).
 * Not for user-facing reference codes — see generateReference() in
 * reference.ts for those (UPI payment references, which are
 * uppercased for readability when a player has to type/verify them).
 */
export function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}
