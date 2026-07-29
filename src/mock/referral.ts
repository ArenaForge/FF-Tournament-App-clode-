export interface ReferralData {
  code: string;
  totalReferred: number;
  totalEarned: number;
  perReferralBonus: number;
  referredUsers: { username: string; joinedDate: string; bonusCredited: boolean }[];
}

export const MOCK_REFERRAL: ReferralData = {
  code: "RAAJ2026",
  totalReferred: 6,
  totalEarned: 300,
  perReferralBonus: 50,
  referredUsers: [
    { username: "Vikram_09", joinedDate: "2026-07-14", bonusCredited: true },
    { username: "ProGamerZ", joinedDate: "2026-07-12", bonusCredited: true },
    { username: "NoobSlayer99", joinedDate: "2026-07-10", bonusCredited: true },
    { username: "AshFF", joinedDate: "2026-07-08", bonusCredited: true },
    { username: "KDRatio_King", joinedDate: "2026-07-05", bonusCredited: true },
    { username: "TapejaraX", joinedDate: "2026-07-19", bonusCredited: false },
  ],
};
