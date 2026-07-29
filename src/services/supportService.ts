import { limit, orderBy, where } from "firebase/firestore";
import {
  getCollection,
  setDocument,
  updateDocument,
  subscribeToCollection,
} from "@/services/firestoreService";
import { generateId } from "@/utils/id";
import type { SupportTicketDoc } from "@/types/firestore";
import type { Unsubscribe } from "firebase/firestore";

const COLLECTION = "supportTickets";
const RECENT_LIMIT = 200;

export async function createSupportTicket(ticket: SupportTicketDoc): Promise<void> {
  await setDocument(`${COLLECTION}/${generateId("tkt")}`, ticket);
}

export function subscribeToOwnTickets(
  uid: string,
  callback: (items: (SupportTicketDoc & { id: string })[]) => void
): Unsubscribe {
  return subscribeToCollection<SupportTicketDoc>(COLLECTION, callback, [
    where("uid", "==", uid),
    orderBy("createdAt", "desc"),
    limit(RECENT_LIMIT),
  ]);
}

export async function getAllTickets(): Promise<(SupportTicketDoc & { id: string })[]> {
  return getCollection<SupportTicketDoc>(COLLECTION, [orderBy("createdAt", "desc"), limit(RECENT_LIMIT)]);
}

export function subscribeToAllTickets(
  callback: (items: (SupportTicketDoc & { id: string })[]) => void
): Unsubscribe {
  return subscribeToCollection<SupportTicketDoc>(COLLECTION, callback, [
    orderBy("createdAt", "desc"),
    limit(RECENT_LIMIT),
  ]);
}

export async function replyToTicket(id: string, reply: string): Promise<void> {
  await updateDocument(`${COLLECTION}/${id}`, {
    reply,
    repliedAt: new Date().toISOString(),
  });
}

export async function closeSupportTicket(id: string): Promise<void> {
  await updateDocument(`${COLLECTION}/${id}`, { status: "closed" });
}
