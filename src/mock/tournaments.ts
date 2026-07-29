export type TournamentMode = "solo" | "duo" | "squad";
export type TournamentType = "CS" | "BR";
export type TournamentStatus = "upcoming" | "live" | "completed";

export interface Tournament {
  id: string;
  title: string;
  type: TournamentType;
  mode: TournamentMode;
  map: string;
  entryFee: number;
  prizePool: number;
  perKill: number;
  slotsTotal: number;
  slotsFilled: number;
  startTime: string; // ISO
  status: TournamentStatus;
  banner: string; // gradient key, no external images needed
  bannerUrl?: string; // optional real uploaded banner image (Firebase Storage)
}

export const MOCK_TOURNAMENTS: Tournament[] = [
  {
    id: "t1",
    title: "Clash Squad Blitz #24",
    type: "CS",
    mode: "squad",
    map: "Bermuda",
    entryFee: 25,
    prizePool: 2000,
    perKill: 0,
    slotsTotal: 12,
    slotsFilled: 9,
    startTime: "2026-07-21T19:30:00+05:30",
    status: "upcoming",
    banner: "from-orange/30 via-void to-void",
  },
  {
    id: "t2",
    title: "BR Solo Domination",
    type: "BR",
    mode: "solo",
    map: "Purgatory",
    entryFee: 15,
    prizePool: 1500,
    perKill: 5,
    slotsTotal: 48,
    slotsFilled: 44,
    startTime: "2026-07-21T20:00:00+05:30",
    status: "upcoming",
    banner: "from-amber/20 via-void to-void",
  },
  {
    id: "t3",
    title: "Duo Rampage Cup",
    type: "BR",
    mode: "duo",
    map: "Kalahari",
    entryFee: 20,
    prizePool: 1800,
    perKill: 4,
    slotsTotal: 50,
    slotsFilled: 50,
    startTime: "2026-07-21T17:00:00+05:30",
    status: "live",
    banner: "from-success/20 via-void to-void",
  },
  {
    id: "t4",
    title: "Clash Squad Weekly Finals",
    type: "CS",
    mode: "squad",
    map: "Bermuda",
    entryFee: 50,
    prizePool: 5000,
    perKill: 0,
    slotsTotal: 8,
    slotsFilled: 8,
    startTime: "2026-07-20T19:00:00+05:30",
    status: "completed",
    banner: "from-orange/20 via-void to-void",
  },
  {
    id: "t5",
    title: "BR Squad Showdown",
    type: "BR",
    mode: "squad",
    map: "Alpine",
    entryFee: 30,
    prizePool: 3000,
    perKill: 6,
    slotsTotal: 52,
    slotsFilled: 21,
    startTime: "2026-07-22T18:30:00+05:30",
    status: "upcoming",
    banner: "from-orange/30 via-void to-void",
  },
];

export function getTournamentById(id: string): Tournament | undefined {
  return MOCK_TOURNAMENTS.find((t) => t.id === id);
}
