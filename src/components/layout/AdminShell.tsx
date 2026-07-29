import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { TopBar } from "./TopBar";
import { AdminBottomNav } from "./AdminBottomNav";

interface AdminShellProps {
  title: string;
  showBack?: boolean;
  trailing?: ReactNode;
  children: ReactNode;
  hideNav?: boolean;
}

export function AdminShell({ title, showBack, trailing, children, hideNav }: AdminShellProps) {
  return (
    <div className="page-shell">
      <div className="bg-orange/10 border-b border-orange/20 py-1 text-center">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-orange">
          Admin Mode
        </span>
      </div>
      <TopBar title={title} showBack={showBack} trailing={trailing} />
      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="max-w-md mx-auto px-5 pt-2 pb-6"
      >
        {children}
      </motion.main>
      {!hideNav && <AdminBottomNav />}
    </div>
  );
}
