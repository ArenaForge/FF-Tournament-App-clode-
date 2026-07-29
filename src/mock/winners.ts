export interface WinnerRecord {
  id: string;
  tournamentTitle: string;
  type: "CS" | "BR";
  date: string;
  rank: number;
  prizeWon: number;
  proofUploaded: boolean;
}

export const MOCK_WINNER_HISTORY: WinnerRecord[] = [
  {
    id: "w1",
    tournamentTitle: "Clash Squad Blitz #21",
    type: "CS",
    date: "2026-07-18T20:00:00+05:30",
    rank: 1,
    prizeWon: 400,
    proofUploaded: true,
  },
  {
    id: "w2",
    tournamentTitle: "Duo Rampage Cup",
    type: "BR",
    date: "2026-07-15T17:30:00+05:30",
    rank: 2,
    prizeWon: 260,
    proofUploaded: true,
  },
  {
    id: "w3",
    tournamentTitle: "BR Squad Showdown",
    type: "BR",
    date: "2026-07-19T18:30:00+05:30",
    rank: 3,
    prizeWon: 180,
    proofUploaded: false,
  },
];
