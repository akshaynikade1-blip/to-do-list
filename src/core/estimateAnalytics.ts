import type { Task, SnoozeReason } from '../types';

export interface ProcrastinationStats {
  totalSnoozes: number;
  reasonCounts: Record<SnoozeReason, number>;
  reasonPercentages: Record<SnoozeReason, number>;
  primaryReason: SnoozeReason | null;
  insightTip: string;
}

export interface MultiplierStats {
  totalEstimatedMinutes: number;
  totalActualMinutes: number;
  multiplier: number; // e.g. 1.6
  completedTasksCount: number;
  biasDescription: string;
}

export const SNOOZE_LABELS: Record<SnoozeReason, { label: string; icon: string; advice: string }> = {
  too_big: {
    label: 'Too big',
    icon: '🐘',
    advice: 'Many tasks feel overwhelming. Use the "Auto-Splitter" button to break big tasks into 15-minute subtasks.'
  },
  not_in_mood: {
    label: 'Not in the mood',
    icon: '🥱',
    advice: 'Energy mismatch detected. Try "Just 5 Minutes" mode to build low-friction momentum without pressure.'
  },
  waiting_on_someone: {
    label: 'Waiting on someone',
    icon: '⏳',
    advice: 'External dependencies block flow. Use Dependency Links to park blocked tasks until ready.'
  },
  forgot: {
    label: 'Forgot about it',
    icon: '💭',
    advice: 'Tasks got buried in the backlog. The Rule of 3 will keep your active view focused on just 3 items.'
  },
  not_important: {
    label: 'Not really important',
    icon: '🍂',
    advice: 'Ruthless elimination is healthy. If a task decays past 7 days, consider deleting it with the Triage ritual.'
  }
};

export function analyzeProcrastinationReasons(tasks: Task[]): ProcrastinationStats {
  const counts: Record<SnoozeReason, number> = {
    too_big: 0,
    not_in_mood: 0,
    waiting_on_someone: 0,
    forgot: 0,
    not_important: 0
  };

  let totalSnoozes = 0;

  for (const task of tasks) {
    if (task.snoozeHistory) {
      for (const record of task.snoozeHistory) {
        if (counts[record.reason] !== undefined) {
          counts[record.reason]++;
          totalSnoozes++;
        }
      }
    }
  }

  const percentages: Record<SnoozeReason, number> = {
    too_big: 0,
    not_in_mood: 0,
    waiting_on_someone: 0,
    forgot: 0,
    not_important: 0
  };

  let primaryReason: SnoozeReason | null = null;
  let maxCount = 0;

  for (const [r, count] of Object.entries(counts) as [SnoozeReason, number][]) {
    percentages[r] = totalSnoozes > 0 ? Math.round((count / totalSnoozes) * 100) : 0;
    if (count > maxCount) {
      maxCount = count;
      primaryReason = r;
    }
  }

  const insightTip = primaryReason
    ? SNOOZE_LABELS[primaryReason].advice
    : 'No postponement patterns detected yet! Complete tasks or snooze with intention to reveal insights.';

  return {
    totalSnoozes,
    reasonCounts: counts,
    reasonPercentages: percentages,
    primaryReason,
    insightTip
  };
}

export function calculateMultiplierStats(tasks: Task[]): MultiplierStats {
  let totalEstimatedMinutes = 0;
  let totalActualMinutes = 0;
  let qualifiedTasksCount = 0;

  for (const task of tasks) {
    // Check tasks that have both estimation and actual tracked time
    if (task.actualMinutesSpent > 0 && task.estimatedMinutes > 0) {
      totalEstimatedMinutes += task.estimatedMinutes;
      totalActualMinutes += task.actualMinutesSpent;
      qualifiedTasksCount++;
    }
  }

  let multiplier = 1.0;
  let biasDescription = 'Your estimates are remarkably balanced with reality (1.0x).';

  if (totalEstimatedMinutes > 0 && totalActualMinutes > 0) {
    multiplier = Math.round((totalActualMinutes / totalEstimatedMinutes) * 10) / 10;
    
    if (multiplier >= 1.3) {
      biasDescription = `You usually take ${multiplier}x longer than you estimate. When scheduling a 30m task, expect ~${Math.round(30 * multiplier)}m.`;
    } else if (multiplier <= 0.8) {
      biasDescription = `You finish tasks ${multiplier}x faster than you plan! You may be over-buffering your estimates.`;
    } else {
      biasDescription = `Very accurate! Your actual time closely tracks your estimates (~${multiplier}x).`;
    }
  }

  return {
    totalEstimatedMinutes,
    totalActualMinutes,
    multiplier,
    completedTasksCount: qualifiedTasksCount,
    biasDescription
  };
}
