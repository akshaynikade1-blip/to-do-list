import Dexie, { type Table } from 'dexie';
import type { Task, Project, FocusSession, UserStats } from '../types';

export class MomentumDatabase extends Dexie {
  tasks!: Table<Task, string>;
  projects!: Table<Project, string>;
  focusSessions!: Table<FocusSession, string>;
  stats!: Table<UserStats, string>;

  constructor() {
    super('MomentumDB');
    this.version(1).stores({
      tasks: 'id, projectId, status, energyLevel, dueDate, completedAt, lastInteractedAt, *tags, *blockedByTaskIds',
      projects: 'id, order',
      focusSessions: 'id, taskId, startedAt',
      stats: 'id'
    });
  }
}

export const db = new MomentumDatabase();
