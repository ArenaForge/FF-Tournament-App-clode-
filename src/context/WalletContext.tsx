import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { limit, where, orderBy } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { subscribeToDocument, subscribeToCollection } from "@/services/firestoreService";
import { createPaymentDoc } from "@/services/paymentsService";
import { createWithdrawalDoc } from "@/services/withdrawalsService";
import type { WalletDoc, PaymentDoc, WithdrawalDoc } from "@/types/firestore";
import type { WalletTransaction } from "@/types/wallet";

interface SubmitDepositInput {
  amount: number;
  reference: string;
  utr: string;
}

interface SubmitWithdrawalInput {
  amount: number;
  upiId: string;
  reference: string;
}

interface SubmitTournamentPaymentInput {
  tournamentId: string;
  tournamentTitle: string;
  amount: number;
  reference: string;
  utr: string;
}

interface LedgerEntry {
  type: WalletTransaction["type"];
  label: string;
  amount: number;
  status: WalletTransaction["status"];
  reference?: string;
  utr?: string;
  createdAt: string;
}

interface WalletContextValue {
  balance: number;
  transactions: WalletTransaction[];
  submitDeposit: (input: SubmitDepositInput) => Promise<void>;
  submitWithdrawal: (input: SubmitWithdrawalInput) => Promise<void>;
  submitTournamentPayment: (input: SubmitTournamentPaymentInput) => Promise<void>;
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const uid = user?.uid ?? null;

  const [balance, setBalance] = useState(0);
  const [ledger, setLedger] = useState<(LedgerEntry & { id: string })[]>([]);
  const [payments, setPayments] = useState<(PaymentDoc & { id: string })[]>([]);
  const [withdrawals, setWithdrawals] = useState<(WithdrawalDoc & { id: string })[]>([]);

  useEffect(() => {
    if (!uid) {
      setBalance(0);
      setLedger([]);
      setPayments([]);
      setWithdrawals([]);
      return;
    }

    const unsubWallet = subscribeToDocument<WalletDoc>(`wallets/${uid}`, (doc) => {
      setBalance(doc?.balance ?? 0);
    });
    const unsubLedger = subscribeToCollection<LedgerEntry>(
      `wallets/${uid}/transactions`,
      setLedger,
      [orderBy("createdAt", "desc"), limit(100)]
    );
    const unsubPayments = subscribeToCollection<PaymentDoc>("payments", setPayments, [
      where("uid", "==", uid),
      limit(100),
    ]);
    const unsubWithdrawals = subscribeToCollection<WithdrawalDoc>(
      "withdrawals",
      setWithdrawals,
      [where("uid", "==", uid), limit(100)]
    );

    return () => {
      unsubWallet();
      unsubLedger();
      unsubPayments();
      unsubWithdrawals();
    };
  }, [uid]);

  // Approved payments/withdrawals already produce a ledger entry (written
  // by the approving Cloud Function) — only surface still-pending or
  // rejected requests here, merged with the real immutable ledger, so
  // nothing shows twice.
  const transactions = useMemo<WalletTransaction[]>(() => {
    const requestLines: WalletTransaction[] = [
      ...payments
        .filter((p) => p.status !== "approved")
        .map((p) => ({
          id: p.id,
          type: p.type as WalletTransaction["type"],
          label: p.type === "deposit" ? "UPI Deposit" : `Entry Fee — ${p.tournamentTitle ?? ""}`,
          amount: p.type === "deposit" ? p.amount : -p.amount,
          date: p.requestedAt.slice(0, 10),
          status: p.status as WalletTransaction["status"],
          reference: p.reference,
          utr: p.utr,
        })),
      ...withdrawals
        .filter((w) => w.status !== "approved")
        .map((w) => ({
          id: w.id,
          type: "withdraw" as const,
          label: `Withdrawal to ${w.upiId}`,
          amount: -w.amount,
          date: w.requestedAt.slice(0, 10),
          status: w.status as WalletTransaction["status"],
          reference: w.reference,
        })),
    ];

    const ledgerLines: WalletTransaction[] = ledger.map((entry) => ({
      id: entry.id,
      type: entry.type,
      label: entry.label,
      amount: entry.amount,
      date: entry.createdAt.slice(0, 10),
      status: entry.status,
      reference: entry.reference,
      utr: entry.utr,
    }));

    return [...requestLines, ...ledgerLines].sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [payments, withdrawals, ledger]);

  async function submitDeposit({ amount, reference, utr }: SubmitDepositInput): Promise<void> {
    if (!uid) return;
    const id = reference;
    await createPaymentDoc(id, {
      uid,
      username: user?.displayName ?? "Player",
      type: "deposit",
      amount,
      reference,
      utr,
      status: "pending",
      requestedAt: new Date().toISOString(),
    });
  }

  async function submitWithdrawal({ amount, upiId, reference }: SubmitWithdrawalInput): Promise<void> {
    if (!uid) return;
    const id = reference;
    await createWithdrawalDoc(id, {
      uid,
      username: user?.displayName ?? "Player",
      amount,
      upiId,
      reference,
      status: "pending",
      requestedAt: new Date().toISOString(),
    });
  }

  async function submitTournamentPayment({
    tournamentId,
    tournamentTitle,
    amount,
    reference,
    utr,
  }: SubmitTournamentPaymentInput): Promise<void> {
    if (!uid) return;
    const id = reference;
    await createPaymentDoc(id, {
      uid,
      username: user?.displayName ?? "Player",
      type: "entryFee",
      amount,
      reference,
      utr,
      tournamentId,
      tournamentTitle,
      status: "pending",
      requestedAt: new Date().toISOString(),
    });
  }

  const value: WalletContextValue = {
    balance,
    transactions,
    submitDeposit,
    submitWithdrawal,
    submitTournamentPayment,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within a WalletProvider");
  return ctx;
}
