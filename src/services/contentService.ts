import {
  getCollection,
  setDocument,
  deleteDocument,
  subscribeToCollection,
} from "@/services/firestoreService";
import { generateId } from "@/utils/id";
import type { FaqDoc, RuleDoc } from "@/types/firestore";
import type { Unsubscribe } from "firebase/firestore";

// --- FAQ ---
export async function getFaqItems(): Promise<(FaqDoc & { id: string })[]> {
  return getCollection<FaqDoc>("faq");
}

export function subscribeToFaqItems(
  callback: (items: (FaqDoc & { id: string })[]) => void
): Unsubscribe {
  return subscribeToCollection<FaqDoc>("faq", callback);
}

export async function addFaqDoc(item: FaqDoc): Promise<void> {
  await setDocument(`faq/${generateId("faq")}`, item);
}

export async function deleteFaqDoc(id: string): Promise<void> {
  await deleteDocument(`faq/${id}`);
}

// --- Rules ---
export async function getRuleItems(): Promise<(RuleDoc & { id: string })[]> {
  return getCollection<RuleDoc>("rules");
}

export function subscribeToRuleItems(
  callback: (items: (RuleDoc & { id: string })[]) => void
): Unsubscribe {
  return subscribeToCollection<RuleDoc>("rules", callback);
}

export async function addRuleDoc(item: RuleDoc): Promise<void> {
  await setDocument(`rules/${generateId("rule")}`, item);
}

export async function deleteRuleDoc(id: string): Promise<void> {
  await deleteDocument(`rules/${id}`);
}
