import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { MOCK_TOURNAMENTS, type Tournament } from "@/mock/tournaments";
import { generateId } from "@/utils/id";
import {
  subscribeToTournaments,
  createTournamentDoc,
  updateTournamentDoc,
  deleteTournamentDoc,
} from "@/services/tournamentsService";
import type { TournamentDoc } from "@/types/firestore";

export interface AdminTournament extends Tournament {
  roomId?: string;
  roomPassword?: string;
  roomRevealAt?: string;
}

interface RoomDetailsInput {
  tournamentId: string;
  roomId: string;
  roomPassword: string;
  roomRevealAt: string;
}

interface TournamentContextValue {
  tournaments: AdminTournament[];
  loading: boolean;
  usingFallbackData: boolean;
  createTournament: (t: Omit<AdminTournament, "id" | "slotsFilled">) => Promise<void>;
  updateTournament: (id: string, updates: Partial<AdminTournament>) => Promise<void>;
  deleteTournament: (id: string) => Promise<void>;
  cancelTournament: (id: string) => Promise<void>;
  duplicateTournament: (id: string) => Promise<void>;
  saveRoomDetails: (input: RoomDetailsInput) => Promise<void>;
}

const TournamentContext = createContext<TournamentContextValue | undefined>(undefined);

function docToTournament(doc: TournamentDoc & { id: string }): AdminTournament {
  return { ...doc };
}

export function TournamentProvider({ children }: { children: ReactNode }) {
  const [tournaments, setTournaments] = useState<AdminTournament[]>(MOCK_TOURNAMENTS);
  const [loading, setLoading] = useState(true);
  const [usingFallbackData, setUsingFallbackData] = useState(true);

  useEffect(() => {
    // Subscribes in real time. If Firestore is unreachable/unconfigured
    // (e.g. running this project before setting up a Firebase project),
    // the subscription's error path in firestoreService just logs a
    // warning and we keep showing the mock data below rather than an
    // empty/broken screen.
    let receivedFirstSnapshot = false;

    const unsubscribe = subscribeToTournaments((items) => {
      receivedFirstSnapshot = true;
      setLoading(false);
      if (items.length === 0) {
        // Empty collection (fresh project) — keep the mock seed visible
        // rather than showing a blank Tournament List out of the box.
        setUsingFallbackData(true);
        setTournaments(MOCK_TOURNAMENTS);
      } else {
        setUsingFallbackData(false);
        setTournaments(items.map(docToTournament));
      }
    });

    // If Firestore never responds (no project configured / offline),
    // stop the loading state after a short grace period so the UI
    // doesn't hang on a spinner forever.
    const timeout = setTimeout(() => {
      if (!receivedFirstSnapshot) {
        setLoading(false);
        setUsingFallbackData(true);
        setTournaments(MOCK_TOURNAMENTS);
      }
    }, 4000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function createTournament(t: Omit<AdminTournament, "id" | "slotsFilled">) {
    const id = generateId("t");
    const data: TournamentDoc = { ...t, slotsFilled: 0, createdAt: new Date().toISOString() };
    await createTournamentDoc(id, data);
  }

  async function updateTournament(id: string, updates: Partial<AdminTournament>) {
    if (usingFallbackData) {
      // No live Firestore data yet — apply locally so the admin UI still
      // responds during local development/demo without a configured project.
      setTournaments((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
      return;
    }
    await updateTournamentDoc(id, updates as Partial<TournamentDoc>);
  }

  async function deleteTournament(id: string) {
    if (usingFallbackData) {
      setTournaments((prev) => prev.filter((t) => t.id !== id));
      return;
    }
    await deleteTournamentDoc(id);
  }

  async function cancelTournament(id: string) {
    await updateTournament(id, { status: "completed" });
  }

  async function duplicateTournament(id: string) {
    const source = tournaments.find((t) => t.id === id);
    if (!source) return;
    const { id: _sourceId, ...rest } = source;
    await createTournament({
      ...rest,
      title: `${source.title} (Copy)`,
      status: "upcoming",
    });
  }

  async function saveRoomDetails({ tournamentId, roomId, roomPassword, roomRevealAt }: RoomDetailsInput) {
    await updateTournament(tournamentId, { roomId, roomPassword, roomRevealAt });
  }

  const value: TournamentContextValue = {
    tournaments,
    loading,
    usingFallbackData,
    createTournament,
    updateTournament,
    deleteTournament,
    cancelTournament,
    duplicateTournament,
    saveRoomDetails,
  };

  return <TournamentContext.Provider value={value}>{children}</TournamentContext.Provider>;
}

export function useTournaments() {
  const ctx = useContext(TournamentContext);
  if (!ctx) throw new Error("useTournaments must be used within a TournamentProvider");
  return ctx;
}
