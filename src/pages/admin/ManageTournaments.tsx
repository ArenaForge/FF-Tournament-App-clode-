import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Copy, Trash2, Ban, DoorOpen, Minus, MoreVertical } from "lucide-react";
import { AdminShell } from "@/components/layout/AdminShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAdmin } from "@/context/AdminContext";

const STATUS_VARIANT: Record<string, "success" | "orange" | "muted"> = {
  live: "success",
  upcoming: "orange",
  completed: "muted",
};

export default function ManageTournaments() {
  const navigate = useNavigate();
  const { tournaments, deleteTournament, cancelTournament, duplicateTournament, updateTournament } =
    useAdmin();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  function adjustSlots(id: string, delta: number) {
    const t = tournaments.find((x) => x.id === id);
    if (!t) return;
    const next = Math.max(0, Math.min(t.slotsTotal, t.slotsFilled + delta));
    updateTournament(id, { slotsFilled: next });
  }

  return (
    <AdminShell
      title="Tournaments"
      trailing={
        <button onClick={() => navigate("/admin/tournaments/new")} className="icon-btn" aria-label="Create tournament">
          <Plus size={18} />
        </button>
      }
    >
      {tournaments.length === 0 ? (
        <EmptyState
          icon={<Plus size={24} />}
          title="No tournaments yet"
          message="Create your first tournament to get things started."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {tournaments.map((t) => (
            <GlassCard key={t.id} className="relative">
              <div className="flex items-start justify-between mb-2">
                <div className="min-w-0">
                  <p className="font-display font-bold text-ink truncate">{t.title}</p>
                  <p className="text-xs text-ink-muted font-mono mt-0.5">
                    {t.type} · {t.mode} · {t.map}
                  </p>
                </div>
                <div className="relative shrink-0">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === t.id ? null : t.id)}
                    className="icon-btn"
                    aria-label="More actions"
                  >
                    <MoreVertical size={16} />
                  </button>
                  {openMenuId === t.id && (
                    <div className="absolute right-0 top-11 z-10 w-44 glass-panel py-1.5 flex flex-col">
                      <MenuAction
                        icon={<Pencil size={14} />}
                        label="Edit"
                        onClick={() => {
                          setOpenMenuId(null);
                          navigate(`/admin/tournaments/${t.id}/edit`);
                        }}
                      />
                      <MenuAction
                        icon={<DoorOpen size={14} />}
                        label="Manage Room"
                        onClick={() => {
                          setOpenMenuId(null);
                          navigate(`/admin/tournaments/${t.id}/room`);
                        }}
                      />
                      <MenuAction
                        icon={<Copy size={14} />}
                        label="Duplicate"
                        onClick={() => {
                          setOpenMenuId(null);
                          duplicateTournament(t.id);
                        }}
                      />
                      {t.status !== "completed" && (
                        <MenuAction
                          icon={<Ban size={14} />}
                          label="Cancel"
                          onClick={() => {
                            setOpenMenuId(null);
                            cancelTournament(t.id);
                          }}
                        />
                      )}
                      <MenuAction
                        icon={<Trash2 size={14} />}
                        label="Delete"
                        danger
                        onClick={() => {
                          setOpenMenuId(null);
                          setConfirmDeleteId(t.id);
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <Badge variant="orange">{t.type}</Badge>
                <Badge variant={STATUS_VARIANT[t.status]}>{t.status}</Badge>
                <Badge variant="muted">Entry ₹{t.entryFee}</Badge>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <span className="text-xs font-mono text-ink-muted">Slots</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => adjustSlots(t.id, -1)}
                    className="icon-btn w-7 h-7"
                    aria-label="Decrease filled slots"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="font-display font-semibold text-ink text-sm w-16 text-center">
                    {t.slotsFilled}/{t.slotsTotal}
                  </span>
                  <button
                    onClick={() => adjustSlots(t.id, 1)}
                    className="icon-btn w-7 h-7"
                    aria-label="Increase filled slots"
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 bg-void/80 backdrop-blur-sm flex items-center justify-center px-6">
          <GlassCard className="w-full max-w-xs text-center">
            <p className="font-display font-semibold text-ink mb-2">Delete tournament?</p>
            <p className="text-sm text-ink-muted mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="btn-outline-orange flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteTournament(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
                className="flex-1 rounded-xl bg-danger text-void font-display font-bold py-3"
              >
                Delete
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </AdminShell>
  );
}

function MenuAction({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors text-left ${
        danger ? "text-danger" : "text-ink"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
