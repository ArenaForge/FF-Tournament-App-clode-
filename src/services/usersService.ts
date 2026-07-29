import { getDocument, setDocument, subscribeToDocument, updateDocument } from "@/services/firestoreService";
import type { UserDoc } from "@/types/firestore";
import type { Unsubscribe } from "firebase/firestore";

export function userPath(uid: string) {
  return `users/${uid}`;
}

export async function createUserProfile(profile: UserDoc): Promise<void> {
  await setDocument(userPath(profile.uid), profile);
}

export async function getUserProfile(uid: string): Promise<UserDoc | null> {
  return getDocument<UserDoc>(userPath(uid));
}

export function subscribeToUserProfile(uid: string, callback: (profile: UserDoc | null) => void): Unsubscribe {
  return subscribeToDocument<UserDoc>(userPath(uid), callback);
}

export async function updateUserProfile(uid: string, updates: Partial<UserDoc>): Promise<void> {
  await updateDocument(userPath(uid), updates);
}
