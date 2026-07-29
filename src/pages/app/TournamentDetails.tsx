import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Clock, Users, Lock, AlertTriangle } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useTournaments } from "@/context/TournamentContext";

const MODE_LABEL: Record<string, string> = { solo: "Solo", duo: "Duo", squad: "Squad" };
const STATUS_BADGE: Record<string, { label: string; variant: "success" | "orange" | "muted" }> = {
  live: { label: "● Live Now", variant: "success" },
  upcoming: { label: "Upcoming", variant: "orange" },
  completed: { label: "Completed", variant: "muted" },
};

export default function TournamentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tournaments } = useTournaments();
  const tournament = id ? tournaments.find((t) => t.id === id) : undefined;

  if (!tournament) {
    return (
      <AppShell title="Tournament" showBack>
        <p className="text-ink-muted text-center py-16">Tournament not found.</p>
      </AppShell>
    );
  }

  const fillPct = (tournament.slotsFilled / tournament.slotsTotal) * 100;
  const isFull = tournament.slotsFilled >= tournament.slotsTotal;
  const startDate = new Date(tournament.startTime);

  return (
    <AppShell title="Tournament Details" showBack hideNav>
      <div
        className={`rounded-2xl h-32 bg-gradient-to-br ${tournament.banner} border border-white/10 mb-5 px-5 flex flex-col justify-end pb-4`}
      >
        <div className="flex gap-2 mb-2">
          <Badge variant="orange">{tournament.type}</Badge>
          <Badge variant="muted">{MODE_LABEL[tournament.mode]}</Badge>
          <Badge variant={STATUS_BADGE[tournament.status].variant}>
            {STATUS_BADGE[tournament.status].label}
          </Badge>
        </div>
        <h1 className="font-display font-black text-2xl text-ink">{tournament.title}</h1>
      </div>

      <GlassCard className="mb-5">
        <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
          <div className="flex items-center gap-2 text-ink-muted">
            <MapPin size={15} /> Map
          </div>
          <div className="text-ink font-semibold text-right">{tournament.map}</div>

          <div className="flex items-center gap-2 text-ink-muted">
            <Clock size={15} /> Start Time
          </div>
          <div className="text-ink font-semibold text-right">
            {startDate.toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>

          <div className="flex items-center gap-2 text-ink-muted">
            <Users size={15} /> Slots
          </div>
          <div className="text-ink font-semibold text-right">
            {tournament.slotsFilled}/{tournament.slotsTotal}
          </div>
        </div>
        <div className="mt-4">
          <ProgressBar value={fillPct} />
        </div>
      </GlassCard>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <GlassCard className="text-center">
          <p className="label-tag mb-1">Entry Fee</p>
          <p className="font-display font-bold text-xl text-ink">₹{tournament.entryFee}</p>
        </GlassCard>
        <GlassCard className="text-center">
          <p className="label-tag mb-1">Prize Pool</p>
          <p className="font-display font-bold text-xl text-orange">₹{tournament.prizePool}</p>
        </GlassCard>
        {tournament.type === "BR" && (
          <GlassCard className="text-center col-span-2">
            <p className="label-tag mb-1">Per Kill Reward</p>
            <p className="font-display font-bold text-xl text-ink">₹{tournament.perKill}</p>
          </GlassCard>
        )}
      </div>

      <SectionHeader title="Room Credentials" />
      <GlassCard className="mb-5 flex items-center gap-3 text-ink-muted">
        <Lock size={18} className="text-orange shrink-0" />
        <p className="text-sm">
          Room ID and password unlock 15 minutes before the match starts.
        </p>
      </GlassCard>

      <SectionHeader title="Quick Rules" />
      <GlassCard className="mb-8">
        <ul className="text-sm text-ink-muted space-y-2 list-disc list-inside">
          <li>Emulators and hacks are strictly prohibited — instant ban on detection.</li>
          <li>Screenshot your result screen before the room closes.</li>
          <li>Entry fee is non-refundable once the room is issued.</li>
          <li>Full rules are available on the Rules page.</li>
        </ul>
      </GlassCard>

      <div className="fixed bottom-0 left-0 right-0 p-4 pb-6 bg-gradient-to-t from-void via-void/95 to-transparent">
        <div className="max-w-md mx-auto">
          {tournament.status === "completed" ? (
            <button className="btn-orange opacity-50 cursor-not-allowed" disabled>
              Tournament Completed
            </button>
          ) : isFull ? (
            <button className="btn-orange opacity-50 cursor-not-allowed" disabled>
              Slots Full
            </button>
          ) : (
            <button
              onClick={() => navigate(`/tournaments/${tournament.id}/pay`)}
              className="btn-orange flex items-center justify-center gap-2"
            >
              Join Tournament — ₹{tournament.entryFee}
            </button>
          )}
          <p className="flex items-center justify-center gap-1 text-[11px] text-ink-muted font-mono mt-2">
            <AlertTriangle size={12} /> Payment is verified manually before your slot is confirmed
          </p>
        </div>
      </div>
    </AppShell>
  );
}
