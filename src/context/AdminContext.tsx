import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { limit, orderBy } from "firebase/firestore";
import { useTournaments, type AdminTournament } from "@/context/TournamentContext";
import { generateId } from "@/utils/id";
import { subscribeToCollection } from "@/services/firestoreService";
import { updateUserProfile } from "@/services/usersService";
import { getWalletDoc } from "@/services/walletsService";
import {
  callApprovePayment,
  callRejectPayment,
  callApproveWithdrawal,
  callRejectWithdrawal,
  callResetWallet,
  callBroadcastNotification,
} from "@/services/functionsService";
import {
  subscribeToAllTickets,
  replyToTicket as replyToTicketDoc,
  closeSupportTicket,
} from "@/services/supportService";
import {
  subscribeToFaqItems,
  addFaqDoc,
  deleteFaqDoc,
  subscribeToRuleItems,
  addRuleDoc,
  deleteRuleDoc,
} from "@/services/contentService";
import { MOCK_APP_SETTINGS } from "@/mock/admin";
import type { PaymentDoc, WithdrawalDoc, UserDoc } from "@/types/firestore";
import type {
  AdminUser,
  PaymentRequest,
  WithdrawalRequest,
  SupportTicket,
  FaqItem,
  RuleItem,
  SentNotification,
  AppSettings,
} from "@/types/admin";

export type { AdminTournament };

interface RoomDetailsInput {
  tournamentId: string;
  roomId: string;
  roomPassword: string;
  roomRevealAt: string;
}

interface AdminContextValue {
  // Tournaments — delegated to TournamentContext (Firestore-backed, Phase 6A)
  tournaments: AdminTournament[];
  createTournament: (t: Omit<AdminTournament, "id" | "slotsFilled">) => void;
  updateTournament: (id: string, updates: Partial<AdminTournament>) => void;
  deleteTournament: (id: string) => void;
  cancelTournament: (id: string) => void;
  duplicateTournament: (id: string) => void;
  saveRoomDetails: (input: RoomDetailsInput) => void;

  // Payments — Phase 6B: real Firestore data, approve/reject call Cloud Functions
  paymentRequests: PaymentRequest[];
  approvePayment: (id: string) => void;
  rejectPayment: (id: string) => void;

  // Withdrawals — Phase 6B: real Firestore data, approve/reject call Cloud Functions
  withdrawalRequests: WithdrawalRequest[];
  approveWithdrawal: (id: string) => void;
  rejectWithdrawal: (id: string) => void;

  // Users — Phase 6B: real Firestore users + wallet balances
  users: AdminUser[];
  toggleBlockUser: (id: string) => void;
  resetUserWallet: (id: string) => void;

  // Notifications
  sentNotifications: SentNotification[];
  sendNotification: (title: string, body: string, audience: "all" | "selected", targetUids: string[]) => Promise<number>;

  // Support / FAQ / Rules / Settings
  supportTickets: SupportTicket[];
  closeTicket: (id: string) => void;
  replyToTicket: (id: string, reply: string) => void;
  faqItems: FaqItem[];
  addFaqItem: (item: Omit<FaqItem, "id">) => void;
  deleteFaqItem: (id: string) => void;
  ruleItems: RuleItem[];
  addRuleItem: (item: Omit<RuleItem, "id">) => void;
  deleteRuleItem: (id: string) => void;
  appSettings: AppSettings;
  updateAppSettings: (updates: Partial<AppSettings>) => void;
}

const AdminContext = createContext<AdminContextValue | undefined>(undefined);

// Surfaces a Cloud Function failure to the admin without touching any
// component's JSX — e.g. "already processed", "insufficient balance".
function reportBackendError(action: string, error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown error";
  // eslint-disable-next-line no-console
  console.warn(`[Admin] ${action} failed:`, error);
  window.alert(`${action} failed: ${message}`);
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const {
    tournaments,
    createTournament: createTournamentDoc,
    updateTournament: updateTournamentDoc,
    deleteTournament: deleteTournamentDoc,
    cancelTournament: cancelTournamentDoc,
    duplicateTournament: duplicateTournamentDoc,
    saveRoomDetails: saveRoomDetailsDoc,
  } = useTournaments();

  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [sentNotifications, setSentNotifications] = useState<SentNotification[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
  const [ruleItems, setRuleItems] = useState<RuleItem[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings>(MOCK_APP_SETTINGS);

  // Real-time: every pending/approved/rejected payment request, across
  // all players — this is exactly what PaymentVerification.tsx renders.
  // Bounded to the most recent 200 so this doesn't grow into an
  // unbounded read as history accumulates.
  useEffect(() => {
    const unsubscribe = subscribeToCollection<PaymentDoc>(
      "payments",
      (items) => {
        setPaymentRequests(items);
      },
      [orderBy("requestedAt", "desc"), limit(200)]
    );
    return unsubscribe;
  }, []);

  // Real-time: every withdrawal request, across all players. Same
  // bounding as payments above.
  useEffect(() => {
    const unsubscribe = subscribeToCollection<WithdrawalDoc>(
      "withdrawals",
      (items) => {
        setWithdrawalRequests(items);
      },
      [orderBy("requestedAt", "desc"), limit(200)]
    );
    return unsubscribe;
  }, []);

  // Real-time: every user profile, enriched with their real wallet
  // balance (a separate collection). Wallet balances are cached per
  // uid so a snapshot fired by one user's profile changing (e.g. a
  // block/unblock toggle) doesn't re-fetch every other user's wallet
  // doc again — only genuinely new uids trigger a fetch.
  const walletCacheRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    const unsubscribe = subscribeToCollection<UserDoc>("users", (items) => {
      void Promise.all(
        items.map(async (item) => {
          let balance = walletCacheRef.current.get(item.id);
          if (balance === undefined) {
            const wallet = await getWalletDoc(item.id).catch(() => null);
            balance = wallet?.balance ?? 0;
            walletCacheRef.current.set(item.id, balance);
          }
          const mapped: AdminUser = {
            id: item.id,
            username: item.displayName ?? item.email ?? "Player",
            email: item.email ?? "",
            inGameUid: "—",
            walletBalance: balance,
            matchesPlayed: 0,
            joinedDate: item.createdAt ? item.createdAt.slice(0, 10) : "",
            blocked: item.blocked,
          };
          return mapped;
        })
      ).then(setUsers);
    });
    return unsubscribe;
  }, []);

  // Real-time: every support ticket, across all players.
  useEffect(() => {
    const unsubscribe = subscribeToAllTickets((items) => {
      setSupportTickets(items);
    });
    return unsubscribe;
  }, []);

  // Real-time: FAQ and Rules content — shared with the player-facing
  // FAQ/Rules pages, which read from the same collections.
  useEffect(() => {
    const unsubscribe = subscribeToFaqItems((items) => {
      setFaqItems(items);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToRuleItems((items) => {
      setRuleItems(items);
    });
    return unsubscribe;
  }, []);

  // --- Tournaments (thin sync wrappers over the async TournamentContext) ---
  function createTournament(t: Omit<AdminTournament, "id" | "slotsFilled">) {
    void createTournamentDoc(t);
  }

  function updateTournament(id: string, updates: Partial<AdminTournament>) {
    void updateTournamentDoc(id, updates);
  }

  function deleteTournament(id: string) {
    void deleteTournamentDoc(id);
  }

  function cancelTournament(id: string) {
    void cancelTournamentDoc(id);
  }

  function duplicateTournament(id: string) {
    void duplicateTournamentDoc(id);
  }

  function saveRoomDetails(input: RoomDetailsInput) {
    void saveRoomDetailsDoc(input);
  }

  // --- Payments (Cloud Functions do the actual work atomically —
  // wallet credit or tournament slot reservation + duplicate-join
  // check happen server-side; the real-time subscription above then
  // reflects the change automatically, no local state mutation here) ---
  function approvePayment(id: string) {
    void callApprovePayment(id).catch((error) => reportBackendError("Approve payment", error));
  }

  function rejectPayment(id: string) {
    void callRejectPayment(id).catch((error) => reportBackendError("Reject payment", error));
  }

  // --- Withdrawals ---
  function approveWithdrawal(id: string) {
    void callApproveWithdrawal(id).catch((error) => reportBackendError("Approve withdrawal", error));
  }

  function rejectWithdrawal(id: string) {
    void callRejectWithdrawal(id).catch((error) => reportBackendError("Reject withdrawal", error));
  }

  // --- Users ---
  function toggleBlockUser(id: string) {
    const target = users.find((u) => u.id === id);
    if (!target) return;
    void updateUserProfile(id, { blocked: !target.blocked }).catch((error) =>
      reportBackendError("Update block status", error)
    );
  }

  function resetUserWallet(id: string) {
    void callResetWallet(id).catch((error) => reportBackendError("Reset wallet", error));
  }

  // --- Notifications ---
  async function sendNotification(
    title: string,
    body: string,
    audience: "all" | "selected",
    targetUids: string[]
  ): Promise<number> {
    const result = await callBroadcastNotification(
      title,
      body,
      audience,
      audience === "selected" ? targetUids : undefined
    );

    const notification: SentNotification = {
      id: generateId("ntf"),
      title,
      body,
      audience,
      recipientCount: result.recipientCount,
      sentAt: new Date().toISOString(),
    };
    setSentNotifications((prev) => [notification, ...prev]);
    return result.recipientCount;
  }

  // --- Support / FAQ / Rules (Phase 6C: real Firestore) / Settings (still local) ---
  function closeTicket(id: string) {
    void closeSupportTicket(id).catch((error) => reportBackendError("Close ticket", error));
  }

  function replyToTicket(id: string, reply: string) {
    void replyToTicketDoc(id, reply).catch((error) => reportBackendError("Reply to ticket", error));
  }

  function addFaqItem(item: Omit<FaqItem, "id">) {
    void addFaqDoc(item).catch((error) => reportBackendError("Add FAQ item", error));
  }

  function deleteFaqItem(id: string) {
    void deleteFaqDoc(id).catch((error) => reportBackendError("Delete FAQ item", error));
  }

  function addRuleItem(item: Omit<RuleItem, "id">) {
    void addRuleDoc(item).catch((error) => reportBackendError("Add rule", error));
  }

  function deleteRuleItem(id: string) {
    void deleteRuleDoc(id).catch((error) => reportBackendError("Delete rule", error));
  }

  function updateAppSettings(updates: Partial<AppSettings>) {
    setAppSettings((prev) => ({ ...prev, ...updates }));
  }

  const value: AdminContextValue = {
    tournaments,
    createTournament,
    updateTournament,
    deleteTournament,
    cancelTournament,
    duplicateTournament,
    saveRoomDetails,
    paymentRequests,
    approvePayment,
    rejectPayment,
    withdrawalRequests,
    approveWithdrawal,
    rejectWithdrawal,
    users,
    toggleBlockUser,
    resetUserWallet,
    sentNotifications,
    sendNotification,
    supportTickets,
    closeTicket,
    replyToTicket,
    faqItems,
    addFaqItem,
    deleteFaqItem,
    ruleItems,
    addRuleItem,
    deleteRuleItem,
    appSettings,
    updateAppSettings,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within an AdminProvider");
  return ctx;
}
