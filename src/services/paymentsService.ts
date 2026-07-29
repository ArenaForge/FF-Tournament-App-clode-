import { limit, orderBy, where } from "firebase/firestore";
import { getCollection, setDocument, updateDocument } from "@/services/firestoreService";
import type { PaymentDoc } from "@/types/firestore";

const COLLECTION = "payments";
const RECENT_LIMIT = 200;

export async function getAllPayments(): Promise<(PaymentDoc & { id: string })[]> {
  return getCollection<PaymentDoc>(COLLECTION, [orderBy("requestedAt", "desc"), limit(RECENT_LIMIT)]);
}

export async function getPaymentsForUser(uid: string): Promise<(PaymentDoc & { id: string })[]> {
  return getCollection<PaymentDoc>(COLLECTION, [
    where("uid", "==", uid),
    orderBy("requestedAt", "desc"),
    limit(RECENT_LIMIT),
  ]);
}

export async function createPaymentDoc(id: string, data: PaymentDoc): Promise<void> {
  await setDocument(`${COLLECTION}/${id}`, data);
}

export async function setPaymentStatus(id: string, status: PaymentDoc["status"]): Promise<void> {
  await updateDocument(`${COLLECTION}/${id}`, { status });
}
