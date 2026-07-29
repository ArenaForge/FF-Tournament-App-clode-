export type TransactionType = "deposit" | "withdraw" | "entryFee" | "prize" | "refund" | "adjustment" | "reward" | "referral";
export type TransactionStatus = "pending" | "success" | "rejected";

export interface WalletTransaction {
  id: string;
  type: TransactionType;
  label: string;
  amount: number; // positive = credit, negative = debit
  date: string;
  status: TransactionStatus;
  reference?: string;
  utr?: string;
}
