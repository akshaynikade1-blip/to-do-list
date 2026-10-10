import { describe, it, expect } from 'vitest';
import { validateRuleOfThree, MAX_TODAY_MAIN, MAX_TODAY_BONUS } from '../src/core/ruleOfThree';
import type { Task } from '../src/types';

describe('Rule of 3 Engine', () => {
  const createTask = (id: string, status: Task['status']): Task => ({
    id,
    title: `Task ${id}`,
    tags: [],
    status,
    order: 0,
    energyLevel: 'medium',
    estimatedMinutes: 25,
    actualMinutesSpent: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    lastInteractedAt: Date.now(),
    blockedByTaskIds: [],
    subtasks: [],
    snoozeHistory: []
  });

  it('allows adding to today_main when under the limit of 3', () => {
    const existing = [createTask('t1', 'today_main'), createTask('t2', 'today_main')];
    const validation = validateRuleOfThree(existing, 't3', 'today_main');

    expect(validation.canAssignDirectly).toBe(true);
    expect(validation.requiresSwap).toBe(false);
  });

  it('blocks adding a 4th task to today_main and requires a swap', () => {
    const existing = [
      createTask('t1', 'today_main'),
      createTask('t2', 'today_main'),
      createTask('t3', 'today_main')
    ];
    const validation = validateRuleOfThree(existing, 't4', 'today_main');

    expect(validation.canAssignDirectly).toBe(false);
    expect(validation.requiresSwap).toBe(true);
    expect(validation.currentMainTasks.length).toBe(MAX_TODAY_MAIN);
  });

  it('allows adding up to 2 bonus tasks', () => {
    const existing = [createTask('b1', 'today_bonus')];
    const validation = validateRuleOfThree(existing, 'b2', 'today_bonus');

    expect(validation.canAssignDirectly).toBe(true);
    expect(validation.requiresSwap).toBe(false);
  });

  it('blocks adding a 3rd bonus task and requires a swap', () => {
    const existing = [createTask('b1', 'today_bonus'), createTask('b2', 'today_bonus')];
    const validation = validateRuleOfThree(existing, 'b3', 'today_bonus');

    expect(validation.canAssignDirectly).toBe(false);
    expect(validation.requiresSwap).toBe(true);
    expect(validation.currentBonusTasks.length).toBe(MAX_TODAY_BONUS);
  });
});
