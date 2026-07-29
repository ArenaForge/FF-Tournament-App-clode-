import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Clock } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { AmountInput } from "@/components/wallet/AmountInput";
import { FormField } from "@/components/common/FormField";
import { AlertBanner } from "@/components/common/AlertBanner";
import { useWallet } from "@/context/WalletContext";
import { generateReference } from "@/utils/reference";

export default function WithdrawRequest() {
  const navigate = useNavigate();
  const { balance, submitWithdrawal } = useWallet();

  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState<{ reference: string; amount: number } | null>(null);

  const amountValue = Number(amount);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (amountValue < 50) {
      setError("Minimum withdrawal amount is ₹50.");
      return;
    }
    if (amountValue > balance) {
      setError("Withdrawal amount cannot exceed your wallet balance.");
      return;
    }
    if (!/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(upiId)) {
      setError("Enter a valid UPI ID (e.g. yourname@bank).");
      return;
    }

    const reference = generateReference("WD");
    submitWithdrawal({ amount: amountValue, upiId, reference });
    setSubmitted({ reference, amount: amountValue });
  }

  if (submitted) {
    return (
      <AppShell title="Withdraw" showBack hideNav>
        <div className="flex flex-col items-center text-center pt-6">
          <div className="w-16 h-16 rounded-full bg-orange/10 border border-orange/30 flex items-center justify-center mb-4">
            <Clock size={26} className="text-orange" />
          </div>
          <h2 className="font-display font-bold text-xl text-ink mb-2">Request Submitted</h2>
          <p className="text-sm text-ink-muted mb-5 max-w-xs">
            Your withdrawal of ₹{submitted.amount} is pending manual review. Approved
            withdrawals are paid out to your UPI ID within 24 hours.
          </p>
          <GlassCard className="w-full mb-6 flex items-center justify-between">
            <span className="text-sm text-ink-muted font-mono">{submitted.reference}</span>
            <Badge variant="orange">Pending</Badge>
          </GlassCard>
          <button onClick={() => navigate("/wallet")} className="btn-outline-orange">
            Back to Wallet
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Withdraw" showBack hideNav>
      <GlassCard className="mb-5 text-center py-5">
        <p className="label-tag mb-1">Available Balance</p>
        <p className="font-display font-black text-2xl text-ink">₹{balance}</p>
      </GlassCard>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && <AlertBanner variant="error" message={error} />}

        <div>
          <p className="label-tag mb-3">Amount to Withdraw</p>
          <AmountInput value={amount} onChange={setAmount} quickAmounts={[100, 250, 500, 1000]} />
        </div>

        <FormField
          label="Your UPI ID"
          value={upiId}
          onChange={(e) => setUpiId(e.target.value)}
          placeholder="yourname@bank"
        />

        <button type="submit" className="btn-orange">
          Request Withdrawal
        </button>
        <p className="text-xs text-ink-muted text-center -mt-2">
          Withdrawals are reviewed manually and are not processed automatically.
        </p>
      </form>
    </AppShell>
  );
}
