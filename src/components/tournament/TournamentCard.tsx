import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Users, MapPin, Clock } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { Tournament } from "@/mock/tournaments";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const MODE_LABEL: Record<Tournament["mode"], string> = {
  solo: "Solo",
  duo: "Duo",
  squad: "Squad",
};

const STATUS_BADGE: Record<Tournament["status"], { label: string; variant: "success" | "orange" | "muted" }> = {
  live: { label: "● Live", variant: "success" },
  upcoming: { label: "Upcoming", variant: "orange" },
  completed: { label: "Completed", variant: "muted" },
};

export function TournamentCard({ tournament }: { tournament: Tournament }) {
  const navigate = useNavigate();
  const fillPct = (tournament.slotsFilled / tournament.slotsTotal) * 100;
  const isFull = tournament.slotsFilled >= tournament.slotsTotal;
  const status = STATUS_BADGE[tournament.status];

  return (
    <motion.div whileTap={{ scale: 0.98 }}>
      <GlassCard
        onClick={() => navigate(`/tournaments/${tournament.id}`)}
        className="cursor-pointer overflow-hidden"
        padded={false}
      >
        <div
          className={`relative h-16 bg-gradient-to-br ${tournament.banner} px-5 flex items-end pb-2 overflow-hidden`}
        >
          {tournament.bannerUrl && (
            <img
              src={tournament.bannerUrl}
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover opacity-40"
            />
          )}
          <div className="relative flex gap-2">
            <Badge variant="orange">{tournament.type}</Badge>
            <Badge variant="muted">{MODE_LABEL[tournament.mode]}</Badge>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-display font-bold text-ink mb-2">{tournament.title}</h3>

          <div className="flex items-center gap-4 text-xs text-ink-muted font-mono mb-3">
            <span className="flex items-center gap-1">
              <MapPin size={12} /> {tournament.map}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} /> {formatTime(tournament.startTime)}
            </span>
          </div>

          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-ink-muted">
              Prize Pool <span className="text-orange font-semibold">₹{tournament.prizePool}</span>
            </span>
            <span className="text-sm text-ink-muted">
              Entry <span className="text-ink font-semibold">₹{tournament.entryFee}</span>
            </span>
          </div>

          <ProgressBar value={fillPct} />
          <div className="flex items-center justify-between mt-1.5">
            <span className="flex items-center gap-1 text-[11px] font-mono text-ink-muted">
              <Users size={12} />
              {tournament.slotsFilled}/{tournament.slotsTotal} slots
            </span>
            {isFull && <span className="text-[11px] font-mono text-danger">FULL</span>}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
