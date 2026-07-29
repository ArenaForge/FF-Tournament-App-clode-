import { useState } from "react";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { AdminShell } from "@/components/layout/AdminShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAdmin } from "@/context/AdminContext";

type FilterValue = "pending" | "approved" | "rejected" | "all";

export default function PaymentVerification() {
  const { paymentRequests, approvePayment, rejectPayment } = useAdmin();
  const [filter, setFilter] = useState<FilterValue>("pending");

  const filtered = paymentRequests.filter((p) => filter === "all" || p.status === filter);

  return (
    <AdminShell title="Payment Verification">
      <div className="mb-5">
        <Tabs
          value={filter}
          onChange={setFilter}
          options={[
            { label: "Pending", value: "pending" },
            { label: "Approved", value: "approved" },
            { label: "Rejected", value: "rejected" },
            { label: "All", value: "all" },
          ]}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Clock size={24} />}
          title="No requests here"
          message="Payment requests matching this filter will appear here."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((p) => (
            <GlassCard key={p.id}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-display font-semibold text-ink">{p.username}</p>
                  <p className="text-xs text-ink-muted font-mono mt-0.5">
                    {p.type === "deposit" ? "Wallet Deposit" : `Entry Fee — ${p.tournamentTitle}`}
                  </p>
                </div>
                <p className="font-display font-bold text-orange">₹{p.amount}</p>
              </div>

              <div className="text-xs font-mono text-ink-muted flex flex-col gap-0.5 mb-3">
                <span>Ref: {p.reference}</span>
                <span>UTR: {p.utr}</span>
              </div>

              <div className="flex items-center justify-between">
                {p.status === "pending" ? (
                  <Badge variant="orange">Pending</Badge>
                ) : p.status === "approved" ? (
                  <Badge variant="success">Approved</Badge>
                ) : (
                  <Badge variant="danger">Rejected</Badge>
                )}

                {p.status === "pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => rejectPayment(p.id)}
                      className="icon-btn text-danger"
                      aria-label="Reject payment"
                    >
                      <XCircle size={16} />
                    </button>
                    <button
                      onClick={() => approvePayment(p.id)}
                      className="icon-btn text-success"
                      aria-label="Approve payment"
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
