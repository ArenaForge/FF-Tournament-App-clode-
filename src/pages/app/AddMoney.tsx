import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, Check, ExternalLink, Clock } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { AmountInput } from "@/components/wallet/AmountInput";
import { UtrForm } from "@/components/wallet/UtrForm";
import { useWallet } from "@/context/WalletContext";
import { buildUpiDeepLink, openUpiApp, MERCHANT_UPI_ID } from "@/utils/upi";
import { generateReference } from "@/utils/reference";

type Step = "amount" | "pay" | "submitted";

export default function AddMoney() {
  const navigate = useNavigate();
  const { submitDeposit } = useWallet();

  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [copied, setCopied] = useState(false);
  const [submittedTx, setSubmittedTx] = useState<{ reference: string; amount: number } | null>(
    null
  );

  const amountValue = Number(amount);
  const isValidAmount = amountValue >= 10;

  function proceedToPay() {
    if (!isValidAmount) return;
    setReference(generateReference("AM"));
    setStep("pay");
  }

  function handlePayWithUpi() {
    const link = buildUpiDeepLink({
      amount: amountValue,
      reference,
      note: `FF MAX ARENA Wallet Top-up ${reference}`,
    });
    openUpiApp(link);
  }

  function handleCopyUpiId() {
    navigator.clipboard?.writeText(MERCHANT_UPI_ID).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  function handleUtrSubmit(utr: string) {
    submitDeposit({ amount: amountValue, reference, utr });
    setSubmittedTx({ reference, amount: amountValue });
    setStep("submitted");
  }

  return (
    <AppShell title="Add Money" showBack hideNav>
      <div className="pb-8">
        {step === "amount" && (
          <>
            <p className="label-tag mb-3">Enter Amount</p>
            <GlassCard className="mb-6">
              <AmountInput value={amount} onChange={setAmount} />
            </GlassCard>
            <button
              onClick={proceedToPay}
              disabled={!isValidAmount}
              className="btn-orange"
            >
              Continue to Pay
            </button>
            <p className="text-xs text-ink-muted text-center mt-3">Minimum add amount is ₹10.</p>
          </>
        )}

        {step === "pay" && (
          <>
            <GlassCard className="mb-5 text-center py-6">
              <p className="label-tag mb-1">Amount to Pay</p>
              <p className="font-display font-black text-3xl text-ink mb-3">₹{amountValue}</p>
              <p className="font-mono text-xs text-ink-muted">Reference: {reference}</p>
            </GlassCard>

            <button
              onClick={handlePayWithUpi}
              className="btn-orange flex items-center justify-center gap-2 mb-3"
            >
              <ExternalLink size={16} />
              Pay with UPI
            </button>

            <GlassCard className="mb-6 flex items-center justify-between">
              <div>
                <p className="label-tag mb-1">Or pay manually to</p>
                <p className="font-mono text-sm text-ink">{MERCHANT_UPI_ID}</p>
              </div>
              <button onClick={handleCopyUpiId} className="icon-btn">
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </GlassCard>

            <p className="text-sm text-ink-muted mb-4 text-center">
              After completing the payment in your UPI app, submit the transaction ID below.
            </p>

            <UtrForm onSubmit={handleUtrSubmit} />
          </>
        )}

        {step === "submitted" && submittedTx && (
          <div className="flex flex-col items-center text-center pt-6">
            <div className="w-16 h-16 rounded-full bg-orange/10 border border-orange/30 flex items-center justify-center mb-4">
              <Clock size={26} className="text-orange" />
            </div>
            <h2 className="font-display font-bold text-xl text-ink mb-2">Payment Submitted</h2>
            <p className="text-sm text-ink-muted mb-5 max-w-xs">
              Your deposit of ₹{submittedTx.amount} is awaiting manual verification. Your
              wallet balance will update once it's approved.
            </p>
            <GlassCard className="w-full mb-6 flex items-center justify-between">
              <span className="text-sm text-ink-muted font-mono">{submittedTx.reference}</span>
              <Badge variant="orange">Pending</Badge>
            </GlassCard>
            <button onClick={() => navigate("/wallet")} className="btn-outline-orange">
              Back to Wallet
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
