import { useMemo, useState } from "react";
import { ShieldOff, ShieldCheck, RotateCcw, Users2 } from "lucide-react";
import { AdminShell } from "@/components/layout/AdminShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { SearchInput } from "@/components/ui/SearchInput";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAdmin } from "@/context/AdminContext";

export default function UserManagement() {
  const { users, toggleBlockUser, resetUserWallet } = useAdmin();
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmResetId, setConfirmResetId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) => u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [users, search]);

  return (
    <AdminShell title="User Management">
      <div className="mb-5">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name or email..." />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Users2 size={24} />}
          title="No users found"
          message="Try a different search term."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((u) => {
            const expanded = expandedId === u.id;
            return (
              <GlassCard key={u.id} padded={false}>
                <button
                  onClick={() => setExpandedId(expanded ? null : u.id)}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-display font-bold text-sm text-ink shrink-0">
                      {u.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink truncate">{u.username}</p>
                      <p className="text-[11px] text-ink-muted font-mono truncate">{u.email}</p>
                    </div>
                  </div>
                  {u.blocked && <Badge variant="danger">Blocked</Badge>}
                </button>

                {expanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-white/10">
                    <div className="grid grid-cols-2 gap-y-2 text-sm mb-4">
                      <span className="text-ink-muted">In-Game UID</span>
                      <span className="text-ink text-right font-mono">{u.inGameUid}</span>
                      <span className="text-ink-muted">Wallet Balance</span>
                      <span className="text-orange text-right font-semibold">₹{u.walletBalance}</span>
                      <span className="text-ink-muted">Matches Played</span>
                      <span className="text-ink text-right">{u.matchesPlayed}</span>
                      <span className="text-ink-muted">Joined</span>
                      <span className="text-ink text-right">{u.joinedDate}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => toggleBlockUser(u.id)}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border ${
                          u.blocked
                            ? "border-success/40 text-success bg-success/10"
                            : "border-danger/40 text-danger bg-danger/10"
                        }`}
                      >
                        {u.blocked ? <ShieldCheck size={15} /> : <ShieldOff size={15} />}
                        {u.blocked ? "Unblock" : "Block"}
                      </button>
                      <button
                        onClick={() => setConfirmResetId(u.id)}
                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border border-white/10 text-ink-muted hover:text-ink"
                      >
                        <RotateCcw size={15} />
                        Reset Wallet
                      </button>
                    </div>
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      )}

      {confirmResetId && (
        <div className="fixed inset-0 z-50 bg-void/80 backdrop-blur-sm flex items-center justify-center px-6">
          <GlassCard className="w-full max-w-xs text-center">
            <p className="font-display font-semibold text-ink mb-2">Reset this wallet to ₹0?</p>
            <p className="text-sm text-ink-muted mb-5">This is an admin-only action and cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmResetId(null)} className="btn-outline-orange flex-1">
                Cancel
              </button>
              <button
                onClick={() => {
                  resetUserWallet(confirmResetId);
                  setConfirmResetId(null);
                }}
                className="flex-1 rounded-xl bg-danger text-void font-display font-bold py-3"
              >
                Reset
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </AdminShell>
  );
}
