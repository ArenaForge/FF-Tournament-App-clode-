import { httpsCallable } from "firebase/functions";
import { functions } from "@/firebase/config";

export async function callApprovePayment(paymentId: string): Promise<void> {
  await httpsCallable(functions, "approvePayment")({ paymentId });
}

export async function callRejectPayment(paymentId: string): Promise<void> {
  await httpsCallable(functions, "rejectPayment")({ paymentId });
}

export async function callApproveWithdrawal(withdrawalId: string): Promise<void> {
  await httpsCallable(functions, "approveWithdrawal")({ withdrawalId });
}

export async function callRejectWithdrawal(withdrawalId: string): Promise<void> {
  await httpsCallable(functions, "rejectWithdrawal")({ withdrawalId });
}

export async function callJoinTournamentWithWallet(tournamentId: string): Promise<void> {
  await httpsCallable(functions, "joinTournamentWithWallet")({ tournamentId });
}

export async function callLeaveTournament(tournamentId: string): Promise<void> {
  await httpsCallable(functions, "leaveTournament")({ tournamentId });
}

export async function callCreditPrize(uid: string, amount: number, label?: string): Promise<void> {
  await httpsCallable(functions, "creditPrize")({ uid, amount, label });
}

export async function callResetWallet(uid: string): Promise<void> {
  await httpsCallable(functions, "resetWallet")({ uid });
}

export interface ClaimDailyRewardResult {
  success: true;
  streak: number;
  dayIndex: number;
  amount: number;
}

export async function callClaimDailyReward(): Promise<ClaimDailyRewardResult> {
  const result = await httpsCallable<unknown, ClaimDailyRewardResult>(functions, "claimDailyReward")();
  return result.data;
}

export async function callRedeemReferralCode(code: string): Promise<void> {
  await httpsCallable(functions, "redeemReferralCode")({ code });
}

export interface BroadcastNotificationResult {
  success: true;
  recipientCount: number;
}

export async function callBroadcastNotification(
  title: string,
  body: string,
  audience: "all" | "selected",
  uids?: string[]
): Promise<BroadcastNotificationResult> {
  const result = await httpsCallable<unknown, BroadcastNotificationResult>(
    functions,
    "broadcastNotification"
  )({ title, body, audience, uids });
  return result.data;
}
