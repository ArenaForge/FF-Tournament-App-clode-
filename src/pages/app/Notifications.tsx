import { useEffect, useState } from "react";
import { Bell, Trophy, Wallet as WalletIcon, Gift, Info, BellRing } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/context/AuthContext";
import { subscribeToUserNotifications, markNotificationRead } from "@/services/notificationsService";
import { enablePushNotifications } from "@/services/fcmService";
import { MOCK_NOTIFICATIONS, type NotificationType } from "@/mock/notifications";
import type { NotificationDoc } from "@/types/firestore";

const TYPE_ICON: Record<NotificationType, JSX.Element> = {
  tournament: <Trophy size={16} className="text-orange" />,
  wallet: <WalletIcon size={16} className="text-success" />,
  reward: <Gift size={16} className="text-amber" />,
  system: <Info size={16} className="text-ink-muted" />,
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export default function Notifications() {
  const { user } = useAuth();
  const [live, setLive] = useState<(NotificationDoc & { id: string })[] | null>(null);
  const [pushState, setPushState] = useState<"idle" | "requesting" | "enabled" | "unavailable">("idle");

  useEffect(() => {
    if (!user) return;
    return subscribeToUserNotifications(user.uid, (items) => {
      setLive(items.length > 0 ? items : null);
    });
  }, [user]);

  const notifications =
    live?.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      body: n.body,
      time: timeAgo(n.createdAt),
      read: n.read,
    })) ?? MOCK_NOTIFICATIONS;

  async function handleEnablePush() {
    if (!user) return;
    setPushState("requesting");
    const token = await enablePushNotifications(user.uid);
    setPushState(token ? "enabled" : "unavailable");
  }

  function handleOpen(id: string, read: boolean) {
    if (!user || read || !live) return;
    void markNotificationRead(user.uid, id);
  }

  return (
    <AppShell title="Notifications" showBack>
      {pushState !== "enabled" && (
        <button
          onClick={handleEnablePush}
          disabled={pushState === "requesting"}
          className="w-full flex items-center justify-center gap-2 text-sm text-orange border border-orange/30 rounded-xl py-2.5 mb-4 hover:bg-orange/10 transition-colors disabled:opacity-50"
        >
          <BellRing size={15} />
          {pushState === "requesting"
            ? "Requesting permission..."
            : pushState === "unavailable"
              ? "Push unavailable on this device/browser"
              : "Enable Push Notifications"}
        </button>
      )}

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell size={24} />}
          title="You're all caught up"
          message="New tournament, wallet, and reward updates will appear here."
        />
      ) : (
        <div className="flex flex-col gap-2.5">
          {notifications.map((n) => (
            <GlassCard
              key={n.id}
              onClick={() => handleOpen(n.id, n.read)}
              className={`flex gap-3 !py-3.5 cursor-pointer ${!n.read ? "border-orange/30" : ""}`}
            >
              <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                {TYPE_ICON[n.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-ink">{n.title}</p>
                  {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-orange shrink-0" />}
                </div>
                <p className="text-xs text-ink-muted mt-0.5">{n.body}</p>
                <p className="text-[11px] text-ink-muted font-mono mt-1">{n.time}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </AppShell>
  );
}
