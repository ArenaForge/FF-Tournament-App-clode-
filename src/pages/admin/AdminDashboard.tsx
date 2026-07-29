import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users2,
  Trophy,
  Radio,
  Clock,
  Landmark,
  Wallet2,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import { AdminShell } from "@/components/layout/AdminShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useAdmin } from "@/context/AdminContext";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { tournaments, paymentRequests, withdrawalRequests, users } = useAdmin();

  const stats = useMemo(() => {
    const activeTournaments = tournaments.filter((t) => t.status !== "completed").length;
    const pendingPayments = paymentRequests.filter((p) => p.status === "pending").length;
    const pendingWithdrawals = withdrawalRequests.filter((w) => w.status === "pending").length;
    const totalWalletBalance = users.reduce((sum, u) => sum + u.walletBalance, 0);
    const totalRevenue = tournaments.reduce(
      (sum, t) => sum + t.entryFee * t.slotsFilled - t.prizePool,
      0
    );
    return {
      totalUsers: users.length,
      totalTournaments: tournaments.length,
      activeTournaments,
      pendingPayments,
      pendingWithdrawals,
      totalWalletBalance,
      totalRevenue: Math.max(totalRevenue, 0),
    };
  }, [tournaments, paymentRequests, withdrawalRequests, users]);

  const cards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users2, to: "/admin/users" },
    { label: "Total Tournaments", value: stats.totalTournaments, icon: Trophy, to: "/admin/tournaments" },
    { label: "Active Tournaments", value: stats.activeTournaments, icon: Radio, to: "/admin/tournaments" },
    { label: "Pending Payments", value: stats.pendingPayments, icon: Clock, to: "/admin/payments" },
    { label: "Pending Withdrawals", value: stats.pendingWithdrawals, icon: Landmark, to: "/admin/withdrawals" },
    { label: "Total Wallet Balance", value: `₹${stats.totalWalletBalance}`, icon: Wallet2, to: "/admin/users" },
    { label: "Total Revenue", value: `₹${stats.totalRevenue}`, icon: TrendingUp, to: "/admin/tournaments" },
  ];

  const QUICK_LINKS = [
    { label: "Manage Tournaments", to: "/admin/tournaments" },
    { label: "Payment Verification", to: "/admin/payments" },
    { label: "Withdrawal Requests", to: "/admin/withdrawals" },
    { label: "User Management", to: "/admin/users" },
    { label: "Send Notification", to: "/admin/notifications" },
    { label: "App Settings", to: "/admin/settings" },
  ];

  return (
    <AdminShell title="Admin Dashboard">
      <div className="grid grid-cols-2 gap-3 mb-6">
        {cards.map(({ label, value, icon: Icon, to }) => (
          <GlassCard
            key={label}
            onClick={() => navigate(to)}
            className="cursor-pointer flex flex-col gap-2"
          >
            <div className="w-9 h-9 rounded-lg bg-orange/10 border border-orange/30 flex items-center justify-center text-orange">
              <Icon size={16} />
            </div>
            <p className="font-display font-bold text-xl text-ink">{value}</p>
            <p className="text-[11px] font-mono uppercase tracking-wide text-ink-muted leading-tight">
              {label}
            </p>
          </GlassCard>
        ))}
      </div>

      <SectionHeader title="Quick Actions" />
      <GlassCard padded={false} className="divide-y divide-white/10 overflow-hidden">
        {QUICK_LINKS.map(({ label, to }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
          >
            <span className="text-sm font-medium text-ink">{label}</span>
            <ChevronRight size={18} className="text-ink-muted" />
          </button>
        ))}
      </GlassCard>
    </AdminShell>
  );
}
