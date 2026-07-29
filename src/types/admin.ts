export interface AdminUser {
  id: string;
  username: string;
  email: string;
  inGameUid: string;
  walletBalance: number;
  matchesPlayed: number;
  joinedDate: string;
  blocked: boolean;
}

export type PaymentRequestType = "deposit" | "entryFee";

export interface PaymentRequest {
  id: string;
  type: PaymentRequestType;
  username: string;
  amount: number;
  reference: string;
  utr: string;
  tournamentId?: string;
  tournamentTitle?: string;
  requestedAt: string;
  status: "pending" | "approved" | "rejected";
}

export interface WithdrawalRequest {
  id: string;
  username: string;
  amount: number;
  upiId: string;
  reference: string;
  requestedAt: string;
  status: "pending" | "approved" | "rejected";
}

export interface SupportTicket {
  id: string;
  username: string;
  subject: string;
  message: string;
  status: "open" | "closed";
  reply?: string;
  repliedAt?: string;
  createdAt: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface RuleItem {
  id: string;
  section: string;
  text: string;
}

export interface SentNotification {
  id: string;
  title: string;
  body: string;
  audience: "all" | "selected";
  recipientCount: number;
  sentAt: string;
}

export interface AppSettings {
  maintenanceMode: boolean;
  registrationOpen: boolean;
  minWithdrawal: number;
  supportEmail: string;
}
