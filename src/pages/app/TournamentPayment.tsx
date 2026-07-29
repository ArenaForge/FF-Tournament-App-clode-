import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ExternalLink, Copy, Check, Clock } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { UtrForm } from "@/components/wallet/UtrForm";
import { useWallet } from "@/context/WalletContext";
import { useTournaments } from "@/context/TournamentContext";
import { buildUpiDeepLink, openUpiApp, MERCHANT_UPI_ID } from "@/utils/upi";
import { generateReference } from "@/utils/reference";

type Step = "pay" | "submitted";

export default function TournamentPayment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { submitTournamentPayment } = useWallet();
  const { tournaments } = useTournaments();
  const tournament = id ? tournaments.find((t) => t.id === id) : undefined;

  const [step, setStep] = useState<Step>("pay");
  const [copied, setCopied] = useState(false);
  const [reference] = useState(() => generateReference("TP"));

  if (!tournament) {
    return (
      <AppShell title="Tournament Payment" showBack hideNav>
        <p className="text-ink-muted text-center py-16">Tournament not found.</p>
      </AppShell>
    );
  }

  function handlePayWithUpi() {
    const link = buildUpiDeepLink({
      amount: tournament!.entryFee,
      reference,
      note: `Entry Fee ${tournament!.title} ${reference}`,
    });
    openUpiApp(link);
  }

  function handleCopyUpiId() {
    navigator.clipboard?.writeText(MERCHANT_UPI_ID).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  function handleUtrSubmit(utr: string) {
    submitTournamentPayment({
      tournamentId: tournament!.id,
      tournamentTitle: tournament!.title,
      amount: tournament!.entryFee,
      reference,
      utr,
    });
    setStep("submitted");
  }

  return (
    <AppShell title="Entry Payment" showBack hideNav>
      {step === "pay" ? (
        <>
          <GlassCard className="mb-5 text-center py-6">
            <p className="label-tag mb-1">{tournament.title}</p>
            <p className="font-display font-black text-3xl text-orange mb-3">
              ₹{tournament.entryFee}
            </p>
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
            After paying, submit your UTR / Transaction ID to request your slot.
          </p>

          <UtrForm onSubmit={handleUtrSubmit} />
        </>
      ) : (
        <div className="flex flex-col items-center text-center pt-6">
          <div className="w-16 h-16 rounded-full bg-orange/10 border border-orange/30 flex items-center justify-center mb-4">
            <Clock size={26} className="text-orange" />
          </div>
          <h2 className="font-display font-bold text-xl text-ink mb-2">Join Request Submitted</h2>
          <p className="text-sm text-ink-muted mb-5 max-w-xs">
            Your entry for <span className="text-ink font-semibold">{tournament.title}</span>{" "}
            is pending approval. You'll be notified once your slot is confirmed.
          </p>
          <GlassCard className="w-full mb-6 flex items-center justify-between">
            <span className="text-sm text-ink-muted font-mono">{reference}</span>
            <Badge variant="orange">Pending</Badge>
          </GlassCard>
          <button onClick={() => navigate("/tournaments")} className="btn-outline-orange">
            Back to Tournaments
          </button>
        </div>
      )}
    </AppShell>
  );
}
