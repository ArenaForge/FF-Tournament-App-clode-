import { Bell, Wallet as WalletIcon, Gift, Users2, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TournamentCard } from "@/components/tournament/TournamentCard";
import { useTournaments } from "@/context/TournamentContext";
import { MOCK_WALLET } from "@/mock/content";
import { useAuth } from "@/context/AuthContext";

const QUICK_ACTIONS = [
  { label: "Wallet", icon: WalletIcon, to: "/wallet" },
  { label: "Rewards", icon: Gift, to: "/rewards" },
  { label: "Referral", icon: Users2, to: "/referral" },
];

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { tournaments } = useTournaments();
  const liveOrUpcoming = tournaments.filter((t) => t.status !== "completed").slice(0, 3);

  return (
    <AppShell
      title={`Hey, ${user?.displayName ?? "Player"}`}
      trailing={
        <button
          onClick={() => navigate("/notifications")}
          className="icon-btn relative"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange" />
        </button>
      }
    >
      {/* Wallet snapshot */}
      <GlassCard
        className="mb-6 cursor-pointer"
        onClick={() => navigate("/wallet")}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="label-tag mb-1">Wallet Balance</p>
            <p className="font-display font-black text-3xl text-ink">
              ₹{MOCK_WALLET.balance}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange/10 border border-orange/30 flex items-center justify-center text-orange">
            <WalletIcon size={22} />
          </div>
        </div>
        <div className="flex items-center gap-1 mt-3 text-sm text-orange font-medium">
          Add money / Withdraw <ChevronRight size={16} />
        </div>
      </GlassCard>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {QUICK_ACTIONS.map(({ label, icon: Icon, to }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            className="glass-card flex flex-col items-center justify-center gap-2 py-4 hover:border-orange/30 transition-colors"
          >
            <Icon size={20} className="text-orange" />
            <span className="text-xs font-mono text-ink-muted uppercase tracking-wide">
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* Live / upcoming tournaments */}
      <SectionHeader
        title="Live & Upcoming"
        action={
          <button
            onClick={() => navigate("/tournaments")}
            className="text-xs font-mono text-orange uppercase tracking-wide flex items-center gap-0.5"
          >
            View all <ChevronRight size={14} />
          </button>
        }
      />
      <div className="flex flex-col gap-4">
        {liveOrUpcoming.map((t) => (
          <TournamentCard key={t.id} tournament={t} />
        ))}
      </div>
    </AppShell>
  );
}
