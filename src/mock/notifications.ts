export type NotificationType = "tournament" | "wallet" | "reward" | "system";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    type: "tournament",
    title: "Room ID unlocked",
    body: "Room ID & password for Clash Squad Blitz #24 are now visible.",
    time: "10 min ago",
    read: false,
  },
  {
    id: "n2",
    type: "wallet",
    title: "Withdrawal approved",
    body: "Your withdrawal of ₹500 has been processed.",
    time: "2 hr ago",
    read: false,
  },
  {
    id: "n3",
    type: "reward",
    title: "Daily reward ready",
    body: "Your Day 4 streak reward is ready to claim.",
    time: "5 hr ago",
    read: true,
  },
  {
    id: "n4",
    type: "system",
    title: "Maintenance notice",
    body: "Servers will be briefly unavailable tonight at 2 AM IST.",
    time: "1 day ago",
    read: true,
  },
];
