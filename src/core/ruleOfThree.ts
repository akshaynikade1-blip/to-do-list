import type { Task, TaskStatus } from '../types';

export const MAX_TODAY_MAIN = 3;
export const MAX_TODAY_BONUS = 2;

export interface RuleOfThreeValidation {
  canAssignDirectly: boolean;
  requiresSwap: boolean;
  reason?: string;
  currentMainTasks: Task[];
  currentBonusTasks: Task[];
}

export function validateRuleOfThree(
  allTasks: Task[],
  targetTaskId: string,
  targetStatus: TaskStatus
): RuleOfThreeValidation {
  const currentMainTasks = allTasks.filter(
    (t) => t.status === 'today_main' && t.id !== targetTaskId
  );
  const currentBonusTasks = allTasks.filter(
    (t) => t.status === 'today_bonus' && t.id !== targetTaskId
  );

  if (targetStatus === 'today_main') {
    if (currentMainTasks.length >= MAX_TODAY_MAIN) {
      return {
        canAssignDirectly: false,
        requiresSwap: true,
        reason: `Today's Main Focus is locked at ${MAX_TODAY_MAIN} items to prevent cognitive overload. Pick a task to swap out.`,
        currentMainTasks,
        currentBonusTasks
      };
    }
  } else if (targetStatus === 'today_bonus') {
    if (currentBonusTasks.length >= MAX_TODAY_BONUS) {
      return {
        canAssignDirectly: false,
        requiresSwap: true,
        reason: `Today's Bonus slots are capped at ${MAX_TODAY_BONUS} items. Pick a bonus task to swap out.`,
        currentMainTasks,
        currentBonusTasks
      };
    }
  }

  return {
    canAssignDirectly: true,
    requiresSwap: false,
    currentMainTasks,
    currentBonusTasks
  };
}
