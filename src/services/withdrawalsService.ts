import { limit, orderBy, where } from "firebase/firestore";
import { getCollection, setDocument, updateDocument } from "@/services/firestoreService";
import type { WithdrawalDoc } from "@/types/firestore";

const COLLECTION = "withdrawals";
const RECENT_LIMIT = 200;

export async function getAllWithdrawals(): Promise<(WithdrawalDoc & { id: string })[]> {
  return getCollection<WithdrawalDoc>(COLLECTION, [orderBy("requestedAt", "desc"), limit(RECENT_LIMIT)]);
}

export async function getWithdrawalsForUser(uid: string): Promise<(WithdrawalDoc & { id: string })[]> {
  return getCollection<WithdrawalDoc>(COLLECTION, [
    where("uid", "==", uid),
    orderBy("requestedAt", "desc"),
    limit(RECENT_LIMIT),
  ]);
}

export async function createWithdrawalDoc(id: string, data: WithdrawalDoc): Promise<void> {
  await setDocument(`${COLLECTION}/${id}`, data);
}

export async function setWithdrawalStatus(
  id: string,
  status: WithdrawalDoc["status"]
): Promise<void> {
  await updateDocument(`${COLLECTION}/${id}`, { status });
}
