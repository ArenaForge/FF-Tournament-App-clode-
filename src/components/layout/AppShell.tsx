import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";

interface AppShellProps {
  title: string;
  showBack?: boolean;
  trailing?: ReactNode;
  children: ReactNode;
  hideNav?: boolean;
}

export function AppShell({ title, showBack, trailing, children, hideNav }: AppShellProps) {
  return (
    <div className="page-shell">
      <TopBar title={title} showBack={showBack} trailing={trailing} />
      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="max-w-md mx-auto px-5 pt-2 pb-6"
      >
        {children}
      </motion.main>
      {!hideNav && <BottomNav />}
    </div>
  );
}
