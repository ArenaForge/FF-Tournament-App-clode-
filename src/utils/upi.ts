/**
 * Manual UPI deep link builder.
 * No payment gateway involved — this simply opens the user's installed
 * UPI app with the payee, amount, and reference pre-filled. Verification
 * happens manually via UTR submission (see UtrForm).
 */

// Replace with the real receiving UPI ID before going live.
export const MERCHANT_UPI_ID = "ffmaxarena@upi";
export const MERCHANT_NAME = "FF MAX ARENA";

interface UpiLinkParams {
  amount: number;
  reference: string;
  note: string;
}

export function buildUpiDeepLink({ amount, reference, note }: UpiLinkParams): string {
  const params = new URLSearchParams({
    pa: MERCHANT_UPI_ID,
    pn: MERCHANT_NAME,
    am: amount.toFixed(2),
    cu: "INR",
    tr: reference,
    tn: note,
  });
  return `upi://pay?${params.toString()}`;
}

/**
 * Attempts to open the UPI deep link. On mobile with a UPI app installed,
 * this triggers the app chooser. On desktop / no UPI app, nothing visible
 * happens — the UI should always offer the UPI ID as a manual fallback.
 */
export function openUpiApp(link: string) {
  window.location.href = link;
}
