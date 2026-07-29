export interface DailyRewardDay {
  day: number;
  reward: number;
  claimed: boolean;
  isToday: boolean;
}

export const MOCK_DAILY_REWARDS: DailyRewardDay[] = [
  { day: 1, reward: 5, claimed: true, isToday: false },
  { day: 2, reward: 10, claimed: true, isToday: false },
  { day: 3, reward: 10, claimed: true, isToday: false },
  { day: 4, reward: 15, claimed: false, isToday: true },
  { day: 5, reward: 20, claimed: false, isToday: false },
  { day: 6, reward: 25, claimed: false, isToday: false },
  { day: 7, reward: 100, claimed: false, isToday: false },
];

export const CURRENT_STREAK = 3;

// The 7-day reward cycle. The claimDailyReward Cloud Function uses the
// exact same amounts (duplicated there since functions/ is a separate
// deployable project) — keep both in sync if these ever change.
export const REWARD_SCHEDULE = [5, 10, 10, 15, 20, 25, 100];
