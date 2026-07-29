export const MOCK_FAQ: { question: string; answer: string }[] = [
  {
    question: "How do I join a tournament?",
    answer:
      "Open the tournament from the Tournament List, review the entry fee and rules, then tap Join. Your slot is reserved once the entry fee is deducted from your wallet.",
  },
  {
    question: "When do I get the Room ID and Password?",
    answer:
      "Room ID and password unlock automatically a few minutes before the match starts and appear on the Tournament Details page and in Notifications.",
  },
  {
    question: "How long do withdrawals take?",
    answer:
      "Withdrawal requests are usually reviewed and processed within 24 hours to your linked UPI ID.",
  },
  {
    question: "What happens if I get disconnected mid-match?",
    answer:
      "Contact Support with your tournament ID and a screenshot within 30 minutes of the incident so the team can review it.",
  },
  {
    question: "How does the referral bonus work?",
    answer:
      "Share your referral code — when a friend signs up and completes their first paid match, you both receive a bonus credited to your wallets.",
  },
];

export const MOCK_WALLET = {
  balance: 1240,
  winnings: 840,
  deposits: 900,
  transactions: [
    { id: "tx1", type: "deposit", label: "UPI Deposit", amount: 500, date: "2026-07-19", status: "success" },
    { id: "tx2", type: "entryFee", label: "Clash Squad Blitz #21", amount: -25, date: "2026-07-18", status: "success" },
    { id: "tx3", type: "prize", label: "Prize — Rank #1", amount: 400, date: "2026-07-18", status: "success" },
    { id: "tx4", type: "withdraw", label: "Withdrawal to UPI", amount: -500, date: "2026-07-17", status: "pending" },
    { id: "tx5", type: "entryFee", label: "BR Solo Domination", amount: -15, date: "2026-07-17", status: "success" },
  ] as const,
};

export const MOCK_PROFILE = {
  displayName: "Raaj",
  inGameName: "RushKing_Op",
  inGameUid: "3401928475",
  level: 42,
  matchesPlayed: 118,
  wins: 22,
  winRate: 18.6,
  kdRatio: 3.4,
  joinedDate: "Jan 2026",
};
