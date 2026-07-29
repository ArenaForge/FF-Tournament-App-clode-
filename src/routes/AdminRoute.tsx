import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/routes/ProtectedRoute";

export function AdminRoute({ children }: { children: ReactNode }) {
  const { role, roleLoading } = useAuth();

  return (
    <ProtectedRoute>
      {roleLoading ? (
        <div className="min-h-screen flex items-center justify-center bg-void">
          <p className="label-tag text-orange animate-pulse-border">Checking access...</p>
        </div>
      ) : role === "admin" ? (
        <>{children}</>
      ) : (
        <Navigate to="/home" replace />
      )}
    </ProtectedRoute>
  );
}
