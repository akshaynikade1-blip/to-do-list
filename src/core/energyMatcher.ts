import type { Task, EnergyLevel } from '../types';

export interface EnergyMatchResult {
  task: Task;
  score: number;
  matchReasons: string[];
}

const ENERGY_NUMERIC: Record<EnergyLevel, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

export function findBestMatchingTasks(
  tasks: Task[],
  userEnergy: EnergyLevel,
  availableMinutes: number,
  allTasksMap?: Map<string, Task>
): EnergyMatchResult[] {
  const currentEnergyVal = ENERGY_NUMERIC[userEnergy];

  // Filter tasks that are eligible for action
  const eligible = tasks.filter((task) => {
    // Skip finished/archived
    if (task.status === 'completed' || task.status === 'archived') return false;

    // Skip tasks blocked by incomplete dependencies
    if (task.blockedByTaskIds && task.blockedByTaskIds.length > 0) {
      if (allTasksMap) {
        const hasUnfinishedBlocker = task.blockedByTaskIds.some((blockerId) => {
          const blocker = allTasksMap.get(blockerId);
          return blocker && blocker.status !== 'completed';
        });
        if (hasUnfinishedBlocker) return false;
      }
    }

    return true;
  });

  const scored = eligible.map((task) => {
    let score = 100;
    const reasons: string[] = [];

    const taskEnergyVal = ENERGY_NUMERIC[task.energyLevel];
    const energyDiff = taskEnergyVal - currentEnergyVal;

    // Energy Scoring
    if (energyDiff === 0) {
      score += 40;
      reasons.push('Direct energy match');
    } else if (userEnergy === 'low' && task.energyLevel === 'high') {
      score -= 60; // Don't overwhelm low energy with high cognitive load
    } else if (Math.abs(energyDiff) === 1) {
      score += 15;
      reasons.push('Comfortable energy fit');
    } else {
      score -= 25;
    }

    // Time Scoring
    const taskTime = task.estimatedMinutes || 25;
    if (taskTime <= availableMinutes) {
      // Good fit! Reward utilization
      const ratio = taskTime / availableMinutes;
      if (ratio >= 0.7 && ratio <= 1.0) {
        score += 35;
        reasons.push(`Optimal time fit (${taskTime}m of ${availableMinutes}m)`);
      } else {
        score += 20;
        reasons.push(`Easily completes within your window`);
      }
    } else {
      // Over available time
      const overMinutes = taskTime - availableMinutes;
      if (overMinutes <= 10) {
        score -= 15; // minor penalty
      } else {
        score -= 40; // too long for current slot
      }
    }

    // Status boost
    if (task.status === 'today_main') {
      score += 25;
      reasons.push('Already prioritized for Today');
    } else if (task.status === 'today_bonus') {
      score += 15;
    }

    // Due date urgency
    if (task.dueDate) {
      const hoursUntilDue = (task.dueDate - Date.now()) / (1000 * 60 * 60);
      if (hoursUntilDue < 24 && hoursUntilDue > 0) {
        score += 20;
        reasons.push('Due today');
      }
    }

    return {
      task,
      score,
      matchReasons: reasons.length > 0 ? reasons : ['Compatible task']
    };
  });

  // Sort descending by score
  return scored.sort((a, b) => b.score - a.score);
}
