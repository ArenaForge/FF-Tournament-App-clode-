import { getCollection, getDocument, subscribeToCollection, subscribeToDocument } from "@/services/firestoreService";
import type { ReferralRedemptionDoc, UserDoc } from "@/types/firestore";
import type { Unsubscribe } from "firebase/firestore";

export async function getReferralProfile(uid: string): Promise<UserDoc | null> {
  return getDocument<UserDoc>(`users/${uid}`);
}

export function subscribeToReferralProfile(
  uid: string,
  callback: (profile: UserDoc | null) => void
): Unsubscribe {
  return subscribeToDocument<UserDoc>(`users/${uid}`, callback);
}

export async function getReferredUsers(
  uid: string
): Promise<(ReferralRedemptionDoc & { id: string })[]> {
  return getCollection<ReferralRedemptionDoc>(`referrals/${uid}/referred`);
}

export function subscribeToReferredUsers(
  uid: string,
  callback: (items: (ReferralRedemptionDoc & { id: string })[]) => void
): Unsubscribe {
  return subscribeToCollection<ReferralRedemptionDoc>(`referrals/${uid}/referred`, callback);
}
