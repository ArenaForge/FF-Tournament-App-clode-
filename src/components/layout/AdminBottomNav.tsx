import { LayoutDashboard, Trophy, Wallet2, Users, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";

const ADMIN_NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/tournaments", label: "Events", icon: Trophy },
  { to: "/admin/payments", label: "Payments", icon: Wallet2 },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminBottomNav() {
  return (
    <nav className="bottom-nav">
      <div className="flex items-stretch max-w-md mx-auto">
        {ADMIN_NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <span className="nav-dot" />
            <Icon size={22} strokeWidth={2.2} />
            <span className="text-[10px] font-mono uppercase tracking-wide">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
