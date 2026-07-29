export interface LeaderboardEntry {
  rank: number;
  username: string;
  points: number;
  wins: number;
  kills: number;
  isCurrentUser?: boolean;
}

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, username: "ShadowReaper_YT", points: 9840, wins: 34, kills: 512 },
  { rank: 2, username: "NoScope_Raaj", points: 9210, wins: 29, kills: 470 },
  { rank: 3, username: "GhostSnipes", points: 8770, wins: 27, kills: 455 },
  { rank: 4, username: "Blaze_Kartik", points: 8330, wins: 25, kills: 402 },
  { rank: 5, username: "You", points: 7920, wins: 22, kills: 388, isCurrentUser: true },
  { rank: 6, username: "IronClad_Dev", points: 7610, wins: 21, kills: 371 },
  { rank: 7, username: "RushKing_Op", points: 7280, wins: 19, kills: 350 },
  { rank: 8, username: "SilentAssassin", points: 6990, wins: 18, kills: 334 },
];
