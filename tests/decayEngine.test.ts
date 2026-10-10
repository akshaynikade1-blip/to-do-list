import { describe, it, expect } from 'vitest';
import { calculateTaskDecay } from '../src/core/decayEngine';
import type { Task } from '../src/types';

describe('Task Decay Engine', () => {
  const baseTask: Task = {
    id: 'test-1',
    title: 'Test Task',
    tags: [],
    status: 'inbox',
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
  };

  const dayMs = 24 * 60 * 60 * 1000;

  it('marks task interacted recently as fresh', () => {
    const now = Date.now();
    const task = { ...baseTask, lastInteractedAt: now - 3600 * 1000 };
    const decay = calculateTaskDecay(task, now);

    expect(decay.stage).toBe('fresh');
    expect(decay.requiresTriage).toBe(false);
    expect(decay.opacity).toBe(1);
  });

  it('marks task untouched for 3.5 days as aging', () => {
    const now = Date.now();
    const task = { ...baseTask, lastInteractedAt: now - dayMs * 3.5 };
    const decay = calculateTaskDecay(task, now);

    expect(decay.stage).toBe('aging');
    expect(decay.requiresTriage).toBe(false);
  });

  it('marks task untouched for 6 days as wilting', () => {
    const now = Date.now();
    const task = { ...baseTask, lastInteractedAt: now - dayMs * 6 };
    const decay = calculateTaskDecay(task, now);

    expect(decay.stage).toBe('wilting');
    expect(decay.requiresTriage).toBe(false);
  });

  it('marks task untouched for 8 days as critical requiring triage', () => {
    const now = Date.now();
    const task = { ...baseTask, lastInteractedAt: now - dayMs * 8 };
    const decay = calculateTaskDecay(task, now);

    expect(decay.stage).toBe('critical');
    expect(decay.requiresTriage).toBe(true);
  });

  it('does not require triage if decay was recently dismissed', () => {
    const now = Date.now();
    const task = {
      ...baseTask,
      lastInteractedAt: now - dayMs * 8,
      decayDismissedAt: now - 3600 * 1000 // dismissed 1 hour ago
    };
    const decay = calculateTaskDecay(task, now);

    expect(decay.stage).toBe('critical');
    expect(decay.requiresTriage).toBe(false);
  });

  it('never decays completed tasks', () => {
    const now = Date.now();
    const task = {
      ...baseTask,
      status: 'completed' as const,
      lastInteractedAt: now - dayMs * 30
    };
    const decay = calculateTaskDecay(task, now);

    expect(decay.stage).toBe('fresh');
    expect(decay.requiresTriage).toBe(false);
  });
});
