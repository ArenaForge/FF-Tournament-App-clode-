import { Home, Trophy, Wallet, BarChart3, User } from "lucide-react";
import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/tournaments", label: "Tournaments", icon: Trophy },
  { to: "/wallet", label: "Wallet", icon: Wallet },
  { to: "/leaderboard", label: "Ranks", icon: BarChart3 },
  { to: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  return (
    <nav className="bottom-nav">
      <div className="flex items-stretch max-w-md mx-auto">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
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
