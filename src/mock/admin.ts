import type {
  AdminUser,
  PaymentRequest,
  WithdrawalRequest,
  SupportTicket,
  FaqItem,
  RuleItem,
  AppSettings,
} from "@/types/admin";

export const MOCK_ADMIN_USERS: AdminUser[] = [
  { id: "u1", username: "RushKing_Op", email: "raaj@example.com", inGameUid: "3401928475", walletBalance: 1240, matchesPlayed: 118, joinedDate: "2026-01-14", blocked: false },
  { id: "u2", username: "ShadowReaper_YT", email: "shadow@example.com", inGameUid: "3402771120", walletBalance: 3820, matchesPlayed: 204, joinedDate: "2025-11-02", blocked: false },
  { id: "u3", username: "NoScope_Raaj", email: "noscope@example.com", inGameUid: "3409981234", walletBalance: 690, matchesPlayed: 87, joinedDate: "2026-02-20", blocked: false },
  { id: "u4", username: "TapejaraX", email: "tapejara@example.com", inGameUid: "3411220098", walletBalance: 0, matchesPlayed: 3, joinedDate: "2026-07-19", blocked: true },
  { id: "u5", username: "GhostSnipes", email: "ghost@example.com", inGameUid: "3405560012", walletBalance: 2110, matchesPlayed: 156, joinedDate: "2025-12-30", blocked: false },
];

export const MOCK_PAYMENT_REQUESTS: PaymentRequest[] = [
  {
    id: "pr1",
    type: "deposit",
    username: "RushKing_Op",
    amount: 500,
    reference: "AM-M1F2G3H4-K9X2",
    utr: "402812345678",
    requestedAt: "2026-07-21T10:15:00+05:30",
    status: "pending",
  },
  {
    id: "pr2",
    type: "entryFee",
    username: "NoScope_Raaj",
    amount: 25,
    reference: "TP-T1-M1F2G9",
    utr: "402812349981",
    tournamentId: "t1",
    tournamentTitle: "Clash Squad Blitz #24",
    requestedAt: "2026-07-21T11:02:00+05:30",
    status: "pending",
  },
  {
    id: "pr3",
    type: "deposit",
    username: "GhostSnipes",
    amount: 1000,
    reference: "AM-M1F3A2B1-L7Y3",
    utr: "402899981122",
    requestedAt: "2026-07-20T18:40:00+05:30",
    status: "approved",
  },
];

export const MOCK_WITHDRAWAL_REQUESTS: WithdrawalRequest[] = [
  {
    id: "wr1",
    username: "RushKing_Op",
    amount: 500,
    upiId: "raaj@okhdfc",
    reference: "WD-M1F4C3D2-P2Q8",
    requestedAt: "2026-07-21T09:30:00+05:30",
    status: "pending",
  },
  {
    id: "wr2",
    username: "ShadowReaper_YT",
    amount: 1200,
    upiId: "shadow@okicici",
    reference: "WD-M1F5D4E3-R3T9",
    requestedAt: "2026-07-20T14:10:00+05:30",
    status: "approved",
  },
];

export const MOCK_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: "st1",
    username: "TapejaraX",
    subject: "Withdrawal not received",
    message: "I requested a withdrawal 2 days ago and haven't received it yet.",
    status: "open",
    createdAt: "2026-07-20T12:00:00+05:30",
  },
  {
    id: "st2",
    username: "NoScope_Raaj",
    subject: "Disconnected mid-match",
    message: "Lost connection during Clash Squad Blitz #21, please review.",
    status: "open",
    createdAt: "2026-07-19T20:15:00+05:30",
  },
];

export const MOCK_FAQ_ITEMS: FaqItem[] = [
  { id: "f1", question: "How do I join a tournament?", answer: "Open the tournament and tap Join, then complete the UPI payment and submit your UTR." },
  { id: "f2", question: "When do I get the Room ID?", answer: "Room ID and password unlock a few minutes before the match starts." },
  { id: "f3", question: "How long do withdrawals take?", answer: "Approved withdrawals are paid out within 24 hours." },
];

export const MOCK_RULE_ITEMS: RuleItem[] = [
  { id: "r1", section: "Fair Play", text: "Emulators, hacks, and macros are strictly banned." },
  { id: "r2", section: "Fair Play", text: "Teaming with opponents results in disqualification." },
  { id: "r3", section: "Match Conduct", text: "Join the custom room within 5 minutes of the room ID being shared." },
  { id: "r4", section: "Results & Payouts", text: "Submit a clear result screenshot for verification." },
];

export const MOCK_APP_SETTINGS: AppSettings = {
  maintenanceMode: false,
  registrationOpen: true,
  minWithdrawal: 50,
  supportEmail: "support@ffmaxarena.gg",
};
