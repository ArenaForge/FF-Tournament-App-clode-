import { useState } from "react";
import { CheckCircle2, XCircle, Landmark } from "lucide-react";
import { AdminShell } from "@/components/layout/AdminShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAdmin } from "@/context/AdminContext";

type FilterValue = "pending" | "history";

export default function WithdrawalManagement() {
  const { withdrawalRequests, approveWithdrawal, rejectWithdrawal } = useAdmin();
  const [filter, setFilter] = useState<FilterValue>("pending");

  const filtered = withdrawalRequests.filter((w) =>
    filter === "pending" ? w.status === "pending" : w.status !== "pending"
  );

  return (
    <AdminShell title="Withdrawals">
      <div className="mb-5">
        <Tabs
          value={filter}
          onChange={setFilter}
          options={[
            { label: "Pending Requests", value: "pending" },
            { label: "Transaction History", value: "history" },
          ]}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Landmark size={24} />}
          title="Nothing here"
          message="Withdrawal requests matching this filter will appear here."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((w) => (
            <GlassCard key={w.id}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-display font-semibold text-ink">{w.username}</p>
                  <p className="text-xs text-ink-muted font-mono mt-0.5">{w.upiId}</p>
                </div>
                <p className="font-display font-bold text-ink">₹{w.amount}</p>
              </div>

              <p className="text-xs font-mono text-ink-muted mb-3">Ref: {w.reference}</p>

              <div className="flex items-center justify-between">
                {w.status === "pending" ? (
                  <Badge variant="orange">Pending</Badge>
                ) : w.status === "approved" ? (
                  <Badge variant="success">Approved</Badge>
                ) : (
                  <Badge variant="danger">Rejected</Badge>
                )}

                {w.status === "pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => rejectWithdrawal(w.id)}
                      className="icon-btn text-danger"
                      aria-label="Reject withdrawal"
                    >
                      <XCircle size={16} />
                    </button>
                    <button
                      onClick={() => approveWithdrawal(w.id)}
                      className="icon-btn text-success"
                      aria-label="Approve withdrawal"
                    >
                      <CheckCircle2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
