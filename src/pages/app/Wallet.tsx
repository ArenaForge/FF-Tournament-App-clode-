import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowDownCircle, ArrowUpCircle, TrendingUp, Landmark, RotateCcw, SlidersHorizontal, Users2, Gift } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { useWallet } from "@/context/WalletContext";
import { MOCK_WALLET } from "@/mock/content";
import type { TransactionType } from "@/types/wallet";

const TX_ICON: Record<string, JSX.Element> = {
  deposit: <ArrowDownCircle size={18} className="text-success" />,
  withdraw: <ArrowUpCircle size={18} className="text-danger" />,
  prize: <TrendingUp size={18} className="text-orange" />,
  entryFee: <Landmark size={18} className="text-ink-muted" />,
  refund: <RotateCcw size={18} className="text-success" />,
  adjustment: <SlidersHorizontal size={18} className="text-ink-muted" />,
  reward: <Gift size={18} className="text-orange" />,
  referral: <Users2 size={18} className="text-orange" />,
};

type HistoryFilter = "all" | "deposit" | "withdraw";

export default function Wallet() {
  const navigate = useNavigate();
  const { balance, transactions } = useWallet();
  const [filter, setFilter] = useState<HistoryFilter>("all");

  const filteredTransactions = useMemo(() => {
    if (filter === "all") return transactions;
    return transactions.filter((tx) => tx.type === (filter as TransactionType));
  }, [transactions, filter]);

  return (
    <AppShell title="Wallet">
      <GlassCard className="mb-5 text-center py-8">
        <p className="label-tag mb-2">Total Balance</p>
        <p className="font-display font-black text-4xl text-ink mb-1">₹{balance}</p>
        <p className="text-xs text-ink-muted font-mono">Verified balance — pending items shown below</p>
      </GlassCard>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <button onClick={() => navigate("/wallet/add-money")} className="btn-orange">
          Add Money
        </button>
        <button onClick={() => navigate("/wallet/withdraw")} className="btn-outline-orange">
          Withdraw
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <GlassCard className="text-center">
          <p className="label-tag mb-1">Total Winnings</p>
          <p className="font-display font-bold text-lg text-orange">
            ₹{MOCK_WALLET.winnings}
          </p>
        </GlassCard>
        <GlassCard className="text-center">
          <p className="label-tag mb-1">Total Deposited</p>
          <p className="font-display font-bold text-lg text-ink">
            ₹{MOCK_WALLET.deposits}
          </p>
        </GlassCard>
      </div>

      <SectionHeader title="Transaction History" />
      <div className="mb-4">
        <Tabs
          value={filter}
          onChange={setFilter}
          options={[
            { label: "All", value: "all" },
            { label: "Deposits", value: "deposit" },
            { label: "Withdrawals", value: "withdraw" },
          ]}
        />
      </div>

      {filteredTransactions.length === 0 ? (
        <EmptyState
          icon={<Landmark size={24} />}
          title="No transactions yet"
          message="Deposits, withdrawals, and entry fees will show up here."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {filteredTransactions.map((tx) => (
            <GlassCard key={tx.id} className="flex items-center justify-between !p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  {TX_ICON[tx.type]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">{tx.label}</p>
                  <p className="text-xs text-ink-muted font-mono">
                    {tx.date}
                    {tx.reference ? ` · ${tx.reference}` : ""}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`font-display font-bold ${
                    tx.amount > 0 ? "text-success" : "text-ink"
                  }`}
                >
                  {tx.amount > 0 ? "+" : ""}
                  ₹{Math.abs(tx.amount)}
                </p>
                {tx.status === "pending" && <Badge variant="orange">Pending</Badge>}
                {tx.status === "rejected" && <Badge variant="danger">Rejected</Badge>}
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </AppShell>
  );
}
