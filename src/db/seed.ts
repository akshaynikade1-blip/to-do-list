import { db } from './index';
import type { Task, Project, FocusSession, UserStats } from '../types';

export const SEED_PROJECTS: Project[] = [
  { id: 'proj-1', name: 'Work & Code', color: '#10B981', order: 1 },
  { id: 'proj-2', name: 'Deep Life', color: '#6366F1', order: 2 },
  { id: 'proj-3', name: 'Health & Rituals', color: '#F59E0B', order: 3 },
];

export async function seedDatabaseIfEmpty() {
  const taskCount = await db.tasks.count();
  if (taskCount > 0) return;

  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  // Insert Projects
  await db.projects.bulkAdd(SEED_PROJECTS);

  const initialTasks: Task[] = [
    // Today's 3 Main Tasks (Rule of 3 slots 1, 2, 3)
    {
      id: 'task-today-1',
      title: 'Architect IndexedDB offline-first sync',
      description: 'Implement reactive Zustand binding with Dexie schema for instant offline state persistence.',
      projectId: 'proj-1',
      tags: ['Engineering', 'Architecture'],
      status: 'today_main',
      order: 1,
      energyLevel: 'high',
      estimatedMinutes: 45,
      actualMinutesSpent: 0,
      createdAt: now - dayMs * 1,
      updatedAt: now - dayMs * 1,
      lastInteractedAt: now - 3600 * 1000, // 1h ago, fresh
      dueDate: now + 3600 * 1000 * 6,
      blockedByTaskIds: [],
      subtasks: [
        { id: 'sub-1', title: 'Define Dexie schema with composite indices', completed: true, estimatedMinutes: 15 },
        { id: 'sub-2', title: 'Hook into Zustand optimistic mutation listeners', completed: false, estimatedMinutes: 20 },
        { id: 'sub-3', title: 'Validate offline reload survivability', completed: false, estimatedMinutes: 10 }
      ],
      snoozeHistory: []
    },
    {
      id: 'task-today-2',
      title: 'Design Zen Kyoto dark theme palette',
      description: 'Tune high-contrast dark tokens, subtle sepia aging states, and Framer Motion spring physics.',
      projectId: 'proj-1',
      tags: ['Design', 'UI/UX'],
      status: 'today_main',
      order: 2,
      energyLevel: 'medium',
      estimatedMinutes: 30,
      actualMinutesSpent: 25,
      createdAt: now - dayMs * 2,
      updatedAt: now - dayMs * 1,
      lastInteractedAt: now - 3600 * 1000 * 3, // fresh
      dueDate: now + 3600 * 1000 * 10,
      blockedByTaskIds: [],
      subtasks: [
        { id: 'sub-4', title: 'Choose base charcoal & obsidian background', completed: true, estimatedMinutes: 10 },
        { id: 'sub-5', title: 'Configure amber & rose decay indicators', completed: true, estimatedMinutes: 10 },
        { id: 'sub-6', title: 'Test contrast ratios with WCAG AAA standards', completed: false, estimatedMinutes: 10 }
      ],
      snoozeHistory: []
    },
    {
      id: 'task-today-3',
      title: 'Calibrate focus timer & multiplier learning',
      description: 'Collect actual vs estimated focus minutes to compute personal estimation bias multiplier.',
      projectId: 'proj-1',
      tags: ['Focus', 'Metrics'],
      status: 'today_main',
      order: 3,
      energyLevel: 'medium',
      estimatedMinutes: 25,
      actualMinutesSpent: 0,
      createdAt: now - dayMs * 1,
      updatedAt: now - dayMs * 1,
      lastInteractedAt: now - 3600 * 1000 * 2,
      blockedByTaskIds: [],
      subtasks: [],
      snoozeHistory: []
    },
    // Today's Bonus Task (Rule of 3 bonus slot 1)
    {
      id: 'task-bonus-1',
      title: 'Review weekly procrastination insights',
      description: 'Check snooze reason trends: notice if "Too big" tasks require Auto-Splitter breakdown.',
      projectId: 'proj-2',
      tags: ['Review', 'Habits'],
      status: 'today_bonus',
      order: 4,
      energyLevel: 'low',
      estimatedMinutes: 15,
      actualMinutesSpent: 0,
      createdAt: now - dayMs * 1,
      updatedAt: now - dayMs * 1,
      lastInteractedAt: now - 3600 * 1000 * 4,
      blockedByTaskIds: [],
      subtasks: [],
      snoozeHistory: []
    },
    // Dependency Blocker Task
    {
      id: 'task-blocker-suite',
      title: 'Run full Vitest unit test suite',
      description: 'Ensure decay engine, energy matcher, and Rule of 3 tests are all green before deployment.',
      projectId: 'proj-1',
      tags: ['QA', 'Testing'],
      status: 'inbox',
      order: 5,
      energyLevel: 'medium',
      estimatedMinutes: 20,
      actualMinutesSpent: 0,
      createdAt: now - dayMs * 2,
      updatedAt: now - dayMs * 2,
      lastInteractedAt: now - dayMs * 1,
      blockedByTaskIds: [],
      subtasks: [
        { id: 'sub-7', title: 'Decay calculation edge tests', completed: true },
        { id: 'sub-8', title: 'Rule of 3 swap constraint test', completed: true }
      ],
      snoozeHistory: []
    },
    // Blocked Task (Locked until 'task-blocker-suite' is completed!)
    {
      id: 'task-blocked-deploy',
      title: 'Deploy Momentum PWA release build',
      description: 'Trigger production deployment pipeline and register PWA offline service workers.',
      projectId: 'proj-1',
      tags: ['DevOps', 'Release'],
      status: 'inbox',
      order: 6,
      energyLevel: 'high',
      estimatedMinutes: 30,
      actualMinutesSpent: 0,
      createdAt: now - dayMs * 2,
      updatedAt: now - dayMs * 2,
      lastInteractedAt: now - dayMs * 1,
      blockedByTaskIds: ['task-blocker-suite'], // Explicit dependency!
      subtasks: [],
      snoozeHistory: []
    },
    // Decaying Task (5 days untouched -> Wilting stage)
    {
      id: 'task-decay-wilting',
      title: 'Clean out browser bookmark backlog',
      description: 'Sort through 140+ saved design inspiration articles and archive obsolete links.',
      projectId: 'proj-2',
      tags: ['Organize'],
      status: 'inbox',
      order: 7,
      energyLevel: 'low',
      estimatedMinutes: 40,
      actualMinutesSpent: 0,
      createdAt: now - dayMs * 5.5,
      updatedAt: now - dayMs * 5.5,
      lastInteractedAt: now - dayMs * 5.5, // 5.5 days ago -> Wilting stage!
      blockedByTaskIds: [],
      subtasks: [],
      snoozeHistory: [
        { timestamp: now - dayMs * 4, reason: 'not_in_mood', notes: 'Rather code than read' }
      ]
    },
    // Critical Aged Task (8.5 days untouched -> Triggers 7-Day Triage Ritual)
    {
      id: 'task-decay-critical',
      title: 'Rewrite personal portfolio bio & resume',
      description: 'Update credentials with latest full-stack architecture achievements.',
      projectId: 'proj-2',
      tags: ['Career'],
      status: 'inbox',
      order: 8,
      energyLevel: 'medium',
      estimatedMinutes: 50,
      actualMinutesSpent: 0,
      createdAt: now - dayMs * 9,
      updatedAt: now - dayMs * 9,
      lastInteractedAt: now - dayMs * 8.5, // > 7 days untouched!
      blockedByTaskIds: [],
      subtasks: [],
      snoozeHistory: [
        { timestamp: now - dayMs * 8, reason: 'too_big', notes: 'Felt overwhelming' },
        { timestamp: now - dayMs * 5, reason: 'waiting_on_someone', notes: 'Waiting for feedback from colleague' }
      ]
    },
    // Quick low-energy task for "What should I do right now?"
    {
      id: 'task-quick-breather',
      title: '10-minute mindful breathing & hydration',
      description: 'Reset nervous system, hydrate, and stretch spine before the next deep sprint.',
      projectId: 'proj-3',
      tags: ['Wellness', 'Ritual'],
      status: 'inbox',
      order: 9,
      energyLevel: 'low',
      estimatedMinutes: 10,
      actualMinutesSpent: 0,
      createdAt: now - dayMs * 1,
      updatedAt: now - dayMs * 1,
      lastInteractedAt: now - 3600 * 1000 * 5,
      blockedByTaskIds: [],
      subtasks: [],
      snoozeHistory: []
    },
    // Completed Tasks for Wins Timeline & Streak
    {
      id: 'task-done-1',
      title: 'Setup Vite + React + TypeScript foundation',
      description: 'Initial project setup with strict typing and modern tooling.',
      projectId: 'proj-1',
      tags: ['Engineering'],
      status: 'completed',
      order: 10,
      energyLevel: 'medium',
      estimatedMinutes: 20,
      actualMinutesSpent: 30, // Multiplier 1.5x
      createdAt: now - dayMs * 1,
      updatedAt: now - 3600 * 1000 * 2,
      lastInteractedAt: now - 3600 * 1000 * 2,
      completedAt: now - 3600 * 1000 * 2,
      blockedByTaskIds: [],
      subtasks: [],
      snoozeHistory: []
    },
    {
      id: 'task-done-2',
      title: 'Morning 20m mobility workout & tea ritual',
      description: 'Woke up, stretched, green tea, zero screens for first 30 mins.',
      projectId: 'proj-3',
      tags: ['Health'],
      status: 'completed',
      order: 11,
      energyLevel: 'low',
      estimatedMinutes: 20,
      actualMinutesSpent: 22,
      createdAt: now - dayMs * 1,
      updatedAt: now - 3600 * 1000 * 6,
      lastInteractedAt: now - 3600 * 1000 * 6,
      completedAt: now - 3600 * 1000 * 6,
      blockedByTaskIds: [],
      subtasks: [],
      snoozeHistory: []
    }
  ];

  await db.tasks.bulkAdd(initialTasks);

  // Focus sessions for Estimate vs Reality & Multiplier
  const initialFocusSessions: FocusSession[] = [
    {
      id: 'session-1',
      taskId: 'task-done-1',
      taskTitle: 'Setup Vite + React + TypeScript foundation',
      startedAt: now - 3600 * 1000 * 3,
      endedAt: now - 3600 * 1000 * 2.5,
      durationMinutes: 30,
      mode: 'standard',
      completedTask: true
    },
    {
      id: 'session-2',
      taskId: 'task-today-2',
      taskTitle: 'Design Zen Kyoto dark theme palette',
      startedAt: now - 3600 * 1000 * 5,
      endedAt: now - 3600 * 1000 * 4.5,
      durationMinutes: 25,
      mode: 'standard',
      completedTask: false
    }
  ];

  await db.focusSessions.bulkAdd(initialFocusSessions);

  // User Stats with 5-day active streak (with 0 grace days missed)
  const todayDateStr = new Date().toISOString().split('T')[0];
  const initialStats: UserStats = {
    id: 'current_user',
    streakCount: 5,
    lastActiveDate: todayDateStr,
    missedGraceDays: 0,
    totalFocusMinutes: 185,
    totalCompletedTasks: 14,
    historicalMultiplier: 1.45 // Estimated 1.0x -> Actual 1.45x
  };

  await db.stats.put(initialStats);
}
