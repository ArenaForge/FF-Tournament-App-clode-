import type { TournamentMode, TournamentType, TournamentStatus } from "@/mock/tournaments";

export type UserRole = "player" | "admin";

export interface UserDoc {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  blocked: boolean;
  createdAt: string;
  referralCode?: string;
  referredBy?: string;
  referralRewardClaimed?: boolean;
  tournamentsJoined?: number;
  totalReferred?: number;
  totalReferralEarnings?: number;
  fcmToken?: string;
}

export interface TournamentDoc {
  title: string;
  type: TournamentType;
  mode: TournamentMode;
  map: string;
  entryFee: number;
  prizePool: number;
  perKill: number;
  slotsTotal: number;
  slotsFilled: number;
  startTime: string;
  status: TournamentStatus;
  banner: string;
  bannerUrl?: string;
  roomId?: string;
  roomPassword?: string;
  roomRevealAt?: string;
  createdBy?: string;
  createdAt?: string;
}

export interface WalletDoc {
  balance: number;
  updatedAt: string;
}

export interface NotificationDoc {
  title: string;
  body: string;
  type: "tournament" | "wallet" | "reward" | "system";
  read: boolean;
  createdAt: string;
}

export interface WithdrawalDoc {
  uid: string;
  username: string;
  amount: number;
  upiId: string;
  reference: string;
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
}

export interface PaymentDoc {
  uid: string;
  username: string;
  type: "deposit" | "entryFee";
  amount: number;
  reference: string;
  utr: string;
  tournamentId?: string;
  tournamentTitle?: string;
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
}

export interface ReferralRedemptionDoc {
  uid: string;
  username: string;
  joinedDate: string;
  bonusCredited: boolean;
}

export interface DailyRewardDoc {
  streak: number;
  lastClaimedAt: string;
}

export interface LeaderboardEntryDoc {
  username: string;
  points: number;
  wins: number;
  kills: number;
}

export interface MatchHistoryDoc {
  tournamentTitle: string;
  type: "CS" | "BR";
  mode: "solo" | "duo" | "squad";
  date: string;
  placement: number;
  kills: number;
  entryFee: number;
  prizeWon: number;
}

export interface WinnerHistoryDoc {
  tournamentTitle: string;
  type: "CS" | "BR";
  date: string;
  rank: number;
  prizeWon: number;
  proofUploaded: boolean;
}

export interface FaqDoc {
  question: string;
  answer: string;
}

export interface RuleDoc {
  section: string;
  text: string;
}

export interface SupportTicketDoc {
  uid: string;
  username: string;
  subject: string;
  message: string;
  status: "open" | "closed";
  reply?: string;
  repliedAt?: string;
  createdAt: string;
}
