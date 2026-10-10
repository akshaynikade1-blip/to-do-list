import type { Task, DecayStatus } from '../types';

export function calculateTaskDecay(task: Task, currentTime: number = Date.now()): DecayStatus {
  // If task is completed or archived, no decay applies
  if (task.status === 'completed' || task.status === 'archived') {
    return {
      ageDays: 0,
      stage: 'fresh',
      opacity: 1,
      label: 'Completed',
      requiresTriage: false
    };
  }

  const referenceTime = task.lastInteractedAt || task.createdAt;
  const ageMs = Math.max(0, currentTime - referenceTime);
  const ageDays = Math.floor((ageMs / (1000 * 60 * 60 * 24)) * 10) / 10; // 1 decimal place

  // Check if triage was recently dismissed within the last 3 days
  const wasDismissedRecently = task.decayDismissedAt 
    ? (currentTime - task.decayDismissedAt) < (3 * 24 * 60 * 60 * 1000)
    : false;

  if (ageDays < 2.5) {
    return {
      ageDays,
      stage: 'fresh',
      opacity: 1,
      label: 'Fresh',
      requiresTriage: false
    };
  } else if (ageDays < 5) {
    return {
      ageDays,
      stage: 'aging',
      opacity: 0.94,
      label: `Untouched ${Math.round(ageDays)}d`,
      requiresTriage: false
    };
  } else if (ageDays < 7) {
    return {
      ageDays,
      stage: 'wilting',
      opacity: 0.85,
      label: `Wilting (${Math.round(ageDays)}d untouched)`,
      requiresTriage: false
    };
  } else {
    return {
      ageDays,
      stage: 'critical',
      opacity: 0.78,
      label: `Aged ${Math.round(ageDays)}d — Needs Triage`,
      requiresTriage: !wasDismissedRecently
    };
  }
}
