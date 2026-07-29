import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, blocked, initializing, logout } = useAuth();
  const location = useLocation();

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-void">
        <p className="label-tag text-cyan animate-pulse-border">Authenticating...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (blocked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-void px-6 text-center gap-4">
        <p className="font-display font-bold text-lg text-ink">Account Blocked</p>
        <p className="text-sm text-ink-muted max-w-xs">
          Your account has been blocked by an administrator. Contact support if you believe
          this is a mistake.
        </p>
        <button onClick={() => logout()} className="btn-outline-orange">
          Log Out
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
