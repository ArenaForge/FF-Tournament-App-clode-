import { getDocument, setDocument } from "@/services/firestoreService";
import type { WalletDoc } from "@/types/firestore";

function walletPath(uid: string) {
  return `wallets/${uid}`;
}

/**
 * Creates the wallet document with a zero balance. This is infrastructure
 * only — actual deposit/withdraw/entry-fee logic is intentionally out of
 * scope for this phase and remains in the mock WalletContext.
 */
export async function ensureWalletDoc(uid: string): Promise<void> {
  await setDocument(walletPath(uid), { balance: 0, updatedAt: new Date().toISOString() } satisfies WalletDoc);
}

export async function getWalletDoc(uid: string): Promise<WalletDoc | null> {
  return getDocument<WalletDoc>(walletPath(uid));
}
