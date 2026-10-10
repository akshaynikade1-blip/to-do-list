import { describe, it, expect } from 'vitest';
import { updateForgivingStreak, getDaysDifference } from '../src/core/streakEngine';
import type { UserStats } from '../src/types';

describe('Forgiving Streak Engine', () => {
  const baseStats: UserStats = {
    id: 'current_user',
    streakCount: 5,
    lastActiveDate: '2026-10-08',
    missedGraceDays: 0,
    totalFocusMinutes: 100,
    totalCompletedTasks: 10,
    historicalMultiplier: 1.2
  };

  it('correctly calculates day differences', () => {
    expect(getDaysDifference('2026-10-08', '2026-10-09')).toBe(1);
    expect(getDaysDifference('2026-10-08', '2026-10-10')).toBe(2);
    expect(getDaysDifference('2026-10-08', '2026-10-08')).toBe(0);
  });

  it('increments streak on consecutive day', () => {
    const result = updateForgivingStreak(baseStats, '2026-10-09');
    expect(result.newStreak).toBe(6);
    expect(result.graceUsed).toBe(false);
    expect(result.streakBroken).toBe(false);
  });

  it('protects streak with grace shield when 1 day was skipped', () => {
    // Skipped 2026-10-09, active on 2026-10-10 (2 days difference)
    const result = updateForgivingStreak(baseStats, '2026-10-10');
    expect(result.newStreak).toBe(6); // Protected!
    expect(result.newMissedGraceDays).toBe(1);
    expect(result.graceUsed).toBe(true);
    expect(result.streakBroken).toBe(false);
  });

  it('breaks streak if grace was already spent and another day is skipped', () => {
    const exhaustedStats: UserStats = {
      ...baseStats,
      missedGraceDays: 1 // grace already spent
    };
    const result = updateForgivingStreak(exhaustedStats, '2026-10-10');
    expect(result.newStreak).toBe(1); // Reset to 1
    expect(result.streakBroken).toBe(true);
  });

  it('breaks streak when 3 or more days missed', () => {
    const result = updateForgivingStreak(baseStats, '2026-10-12'); // 4 days later
    expect(result.newStreak).toBe(1);
    expect(result.streakBroken).toBe(true);
  });
});
