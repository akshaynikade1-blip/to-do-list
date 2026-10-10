import { describe, it, expect } from 'vitest';
import {
  checkTaskDependencies,
  wouldCreateDependencyCycle,
  extractDependencyGraphData
} from '../src/core/dependencyGraph';
import type { Task } from '../src/types';

describe('Dependency Graph Engine', () => {
  const createTask = (id: string, status: Task['status'], blockedBy: string[] = []): Task => ({
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
    blockedByTaskIds: blockedBy,
    subtasks: [],
    snoozeHistory: []
  });

  it('correctly reports blocked status when blocker is incomplete', () => {
    const blocker = createTask('blocker', 'inbox');
    const blockedTask = createTask('blocked', 'inbox', ['blocker']);

    const map = new Map<string, Task>([
      [blocker.id, blocker],
      [blockedTask.id, blockedTask]
    ]);

    const result = checkTaskDependencies(blockedTask, map);
    expect(result.isBlocked).toBe(true);
    expect(result.unresolvedBlockers.length).toBe(1);
    expect(result.unresolvedBlockers[0].id).toBe('blocker');
  });

  it('unblocks task when blocker is completed', () => {
    const completedBlocker = createTask('blocker', 'completed');
    const targetTask = createTask('target', 'inbox', ['blocker']);

    const map = new Map<string, Task>([
      [completedBlocker.id, completedBlocker],
      [targetTask.id, targetTask]
    ]);

    const result = checkTaskDependencies(targetTask, map);
    expect(result.isBlocked).toBe(false);
    expect(result.resolvedBlockers.length).toBe(1);
    expect(result.unresolvedBlockers.length).toBe(0);
  });

  it('detects cycles to prevent circular dependencies', () => {
    const taskA = createTask('A', 'inbox', []);
    const taskB = createTask('B', 'inbox', ['A']); // B is blocked by A

    const allTasks = [taskA, taskB];

    // Proposing that A is blocked by B should be detected as a cycle!
    const createsCycle = wouldCreateDependencyCycle(allTasks, 'B', 'A');
    expect(createsCycle).toBe(true);

    // Self dependency is also a cycle
    expect(wouldCreateDependencyCycle(allTasks, 'A', 'A')).toBe(true);

    // Unrelated task C blocking A should not create cycle
    const taskC = createTask('C', 'inbox', []);
    expect(wouldCreateDependencyCycle([...allTasks, taskC], 'C', 'A')).toBe(false);
  });

  it('extracts graph nodes and edges for visualization', () => {
    const taskA = createTask('A', 'inbox');
    const taskB = createTask('B', 'inbox', ['A']);
    const taskC = createTask('C', 'inbox', []); // disconnected

    const { nodes, edges } = extractDependencyGraphData([taskA, taskB, taskC]);

    expect(nodes.some((n) => n.id === 'A')).toBe(true);
    expect(nodes.some((n) => n.id === 'B')).toBe(true);
    expect(edges.length).toBe(1);
    expect(edges[0]).toEqual({ from: 'A', to: 'B' });
  });
});
