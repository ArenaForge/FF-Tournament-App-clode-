export interface MatchRecord {
  id: string;
  tournamentTitle: string;
  type: "CS" | "BR";
  mode: "solo" | "duo" | "squad";
  date: string;
  placement: number;
  kills: number;
  entryFee: number;
  prizeWon: number;
}

export const MOCK_MATCH_HISTORY: MatchRecord[] = [
  {
    id: "m1",
    tournamentTitle: "BR Squad Showdown",
    type: "BR",
    mode: "squad",
    date: "2026-07-19T18:30:00+05:30",
    placement: 3,
    kills: 6,
    entryFee: 30,
    prizeWon: 180,
  },
  {
    id: "m2",
    tournamentTitle: "Clash Squad Blitz #21",
    type: "CS",
    mode: "squad",
    date: "2026-07-18T20:00:00+05:30",
    placement: 1,
    kills: 0,
    entryFee: 25,
    prizeWon: 400,
  },
  {
    id: "m3",
    tournamentTitle: "BR Solo Domination",
    type: "BR",
    mode: "solo",
    date: "2026-07-17T19:00:00+05:30",
    placement: 8,
    kills: 3,
    entryFee: 15,
    prizeWon: 0,
  },
  {
    id: "m4",
    tournamentTitle: "Duo Rampage Cup",
    type: "BR",
    mode: "duo",
    date: "2026-07-15T17:30:00+05:30",
    placement: 2,
    kills: 9,
    entryFee: 20,
    prizeWon: 260,
  },
];
