import type { UserStats } from '../types';

export function getDaysDifference(dateStrA: string, dateStrB: string): number {
  const [y1, m1, d1] = dateStrA.split('-').map(Number);
  const [y2, m2, d2] = dateStrB.split('-').map(Number);
  
  const utc1 = Date.UTC(y1, m1 - 1, d1);
  const utc2 = Date.UTC(y2, m2 - 1, d2);
  
  return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
}

export interface StreakUpdateResult {
  newStreak: number;
  newMissedGraceDays: number;
  graceUsed: boolean;
  streakBroken: boolean;
  message: string;
}

export function updateForgivingStreak(
  currentStats: UserStats,
  todayDateStr: string = new Date().toISOString().split('T')[0]
): StreakUpdateResult {
  const { streakCount, lastActiveDate, missedGraceDays } = currentStats;

  if (!lastActiveDate) {
    return {
      newStreak: 1,
      newMissedGraceDays: 0,
      graceUsed: false,
      streakBroken: false,
      message: 'Started your first streak!'
    };
  }

  const daysDiff = getDaysDifference(lastActiveDate, todayDateStr);

  if (daysDiff <= 0) {
    // Already completed something today
    return {
      newStreak: streakCount,
      newMissedGraceDays: missedGraceDays,
      graceUsed: false,
      streakBroken: false,
      message: 'Momentum active today!'
    };
  }

  if (daysDiff === 1) {
    // Perfect consecutive day!
    return {
      newStreak: streakCount + 1,
      newMissedGraceDays: 0, // restores grace token on consecutive days
      graceUsed: false,
      streakBroken: false,
      message: `Streak increased to ${streakCount + 1} days! 🔥`
    };
  }

  if (daysDiff === 2) {
    // 1 skip day occurred
    if (missedGraceDays === 0) {
      // Grace token saves the streak!
      return {
        newStreak: streakCount + 1,
        newMissedGraceDays: 1,
        graceUsed: true,
        streakBroken: false,
        message: `Grace Day Shield used! Your ${streakCount + 1}-day streak is protected. 🛡️`
      };
    } else {
      // Grace already spent previously
      return {
        newStreak: 1,
        newMissedGraceDays: 0,
        graceUsed: false,
        streakBroken: true,
        message: 'Streak reset after multiple missed days. Fresh start today! 🌱'
      };
    }
  }

  // 3 or more days missed
  return {
    newStreak: 1,
    newMissedGraceDays: 0,
    graceUsed: false,
    streakBroken: true,
    message: 'Welcome back! Restarting your streak at Day 1.'
  };
}
