import { create } from 'zustand';
import { db } from '../db';
import { seedDatabaseIfEmpty } from '../db/seed';
import type { Task, Project, UserStats, TaskStatus, SnoozeReason } from '../types';
import { validateRuleOfThree } from '../core/ruleOfThree';
import { updateForgivingStreak } from '../core/streakEngine';
import { useUIStore } from './useUIStore';
import confetti from 'canvas-confetti';

interface TaskState {
  tasks: Task[];
  projects: Project[];
  userStats: UserStats | null;
  isLoading: boolean;

  init: () => Promise<void>;
  addTask: (data: Partial<Task>) => Promise<Task | null>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<boolean>;
  assignStatus: (id: string, newStatus: TaskStatus) => Promise<boolean>;
  swapTasks: (displacedTaskId: string, newTaskId: string, newStatus: TaskStatus, demoteDisplacedToBonus?: boolean) => Promise<void>;
  snoozeTask: (id: string, reason: SnoozeReason, notes?: string, rescheduleTimestamp?: number) => Promise<void>;
  dismissDecay: (id: string) => Promise<void>;
  addSubtask: (taskId: string, title: string, estimatedMinutes?: number) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  deleteSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  addProject: (name: string, color: string) => Promise<Project>;
  importData: (jsonData: { tasks: Task[]; projects?: Project[]; stats?: UserStats }) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  projects: [],
  userStats: null,
  isLoading: true,

  init: async () => {
    set({ isLoading: true });
    try {
      await seedDatabaseIfEmpty();
      const tasks = await db.tasks.toArray();
      const projects = await db.projects.toArray();
      let stats = await db.stats.get('current_user');

      if (!stats) {
        stats = {
          id: 'current_user',
          streakCount: 1,
          lastActiveDate: new Date().toISOString().split('T')[0],
          missedGraceDays: 0,
          totalFocusMinutes: 0,
          totalCompletedTasks: 0,
          historicalMultiplier: 1.0
        };
        await db.stats.put(stats);
      }

      set({
        tasks: tasks.sort((a, b) => a.order - b.order),
        projects: projects.sort((a, b) => a.order - b.order),
        userStats: stats,
        isLoading: false
      });
    } catch (err) {
      console.error('Failed to initialize Momentum database', err);
      set({ isLoading: false });
    }
  },

  addTask: async (data: Partial<Task>) => {
    const { tasks } = get();
    const now = Date.now();
    const id = data.id || `task-${now}-${Math.random().toString(36).substring(2, 7)}`;
    const status = data.status || 'inbox';

    // Validate Rule of 3 if trying to add directly to today_main or today_bonus
    if (status === 'today_main' || status === 'today_bonus') {
      const validation = validateRuleOfThree(tasks, id, status);
      if (validation.requiresSwap) {
        useUIStore.getState().openSwapModal({
          targetTaskId: id,
          targetStatus: status,
          currentMainTasks: validation.currentMainTasks,
          currentBonusTasks: validation.currentBonusTasks
        });
        // Still create task in inbox first
        data.status = 'inbox';
      }
    }

    const newTask: Task = {
      id,
      title: data.title || 'Untitled Task',
      description: data.description || '',
      projectId: data.projectId || undefined,
      tags: data.tags || [],
      status: data.status || 'inbox',
      order: tasks.length + 1,
      energyLevel: data.energyLevel || 'medium',
      estimatedMinutes: data.estimatedMinutes || 25,
      actualMinutesSpent: 0,
      createdAt: now,
      updatedAt: now,
      lastInteractedAt: now,
      dueDate: data.dueDate,
      blockedByTaskIds: data.blockedByTaskIds || [],
      subtasks: data.subtasks || [],
      snoozeHistory: []
    };

    await db.tasks.add(newTask);
    set((state) => ({ tasks: [newTask, ...state.tasks] }));
    return newTask;
  },

  updateTask: async (id: string, updates: Partial<Task>) => {
    const now = Date.now();
    const updatedFields = {
      ...updates,
      updatedAt: now,
      lastInteractedAt: now
    };

    await db.tasks.update(id, updatedFields);
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updatedFields } : t))
    }));
  },

  deleteTask: async (id: string) => {
    await db.tasks.delete(id);
    // Also clean up dependency references in other tasks
    const { tasks } = get();
    const tasksToClean = tasks.filter((t) => t.blockedByTaskIds?.includes(id));
    for (const t of tasksToClean) {
      const cleaned = t.blockedByTaskIds.filter((bId) => bId !== id);
      await db.tasks.update(t.id, { blockedByTaskIds: cleaned });
    }

    set((state) => ({
      tasks: state.tasks
        .filter((t) => t.id !== id)
        .map((t) => ({
          ...t,
          blockedByTaskIds: t.blockedByTaskIds.filter((bId) => bId !== id)
        }))
    }));
  },

  toggleComplete: async (id: string) => {
    const { tasks, userStats } = get();
    const task = tasks.find((t) => t.id === id);
    if (!task) return false;

    const isCompleting = task.status !== 'completed';
    const now = Date.now();

    if (isCompleting) {
      // Check if blocked by incomplete tasks
      if (task.blockedByTaskIds && task.blockedByTaskIds.length > 0) {
        const unfinishedBlockers = tasks.filter(
          (t) => task.blockedByTaskIds.includes(t.id) && t.status !== 'completed'
        );
        if (unfinishedBlockers.length > 0) {
          alert(`This task is blocked by: "${unfinishedBlockers[0].title}". Complete the blocker first!`);
          return false;
        }
      }

      // Celebrate with subtle confetti particles!
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#10B981', '#34D399', '#6EE7B7', '#F59E0B']
        });
      } catch {
        // Safe fallback
      }

      // Update task
      const updates = {
        status: 'completed' as const,
        completedAt: now,
        updatedAt: now,
        lastInteractedAt: now
      };
      await db.tasks.update(id, updates);

      // Update forgiving streak & stats
      if (userStats) {
        const todayStr = new Date().toISOString().split('T')[0];
        const streakResult = updateForgivingStreak(userStats, todayStr);
        const updatedStats: UserStats = {
          ...userStats,
          streakCount: streakResult.newStreak,
          lastActiveDate: todayStr,
          missedGraceDays: streakResult.newMissedGraceDays,
          totalCompletedTasks: userStats.totalCompletedTasks + 1
        };
        await db.stats.put(updatedStats);
        set({ userStats: updatedStats });
      }

      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t))
      }));
      return true;
    } else {
      // Uncomplete
      const updates = {
        status: 'inbox' as const,
        completedAt: undefined,
        updatedAt: now,
        lastInteractedAt: now
      };
      await db.tasks.update(id, updates);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t))
      }));
      return false;
    }
  },

  assignStatus: async (id: string, newStatus: TaskStatus) => {
    const { tasks } = get();
    const task = tasks.find((t) => t.id === id);
    if (!task) return false;

    // Rule of 3 check for today_main and today_bonus
    if (newStatus === 'today_main' || newStatus === 'today_bonus') {
      const validation = validateRuleOfThree(tasks, id, newStatus);
      if (validation.requiresSwap) {
        useUIStore.getState().openSwapModal({
          targetTaskId: id,
          targetStatus: newStatus,
          currentMainTasks: validation.currentMainTasks,
          currentBonusTasks: validation.currentBonusTasks
        });
        return false;
      }
    }

    const now = Date.now();
    const updates = {
      status: newStatus,
      updatedAt: now,
      lastInteractedAt: now
    };

    await db.tasks.update(id, updates);
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t))
    }));
    return true;
  },

  swapTasks: async (
    displacedTaskId: string,
    newTaskId: string,
    newStatus: TaskStatus,
    demoteDisplacedToBonus = false
  ) => {
    const now = Date.now();
    const displacedTargetStatus: TaskStatus = demoteDisplacedToBonus ? 'today_bonus' : 'inbox';

    // Update displaced task
    await db.tasks.update(displacedTaskId, {
      status: displacedTargetStatus,
      updatedAt: now,
      lastInteractedAt: now
    });

    // Update new task into the coveted slot
    await db.tasks.update(newTaskId, {
      status: newStatus,
      updatedAt: now,
      lastInteractedAt: now
    });

    set((state) => ({
      tasks: state.tasks.map((t) => {
        if (t.id === displacedTaskId) {
          return { ...t, status: displacedTargetStatus, updatedAt: now, lastInteractedAt: now };
        }
        if (t.id === newTaskId) {
          return { ...t, status: newStatus, updatedAt: now, lastInteractedAt: now };
        }
        return t;
      })
    }));

    useUIStore.getState().closeSwapModal();
  },

  snoozeTask: async (
    id: string,
    reason: SnoozeReason,
    notes?: string,
    rescheduleTimestamp?: number
  ) => {
    const { tasks } = get();
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const now = Date.now();
    const newRecord = {
      timestamp: now,
      reason,
      notes,
      rescheduledTo: rescheduleTimestamp
    };

    const newHistory = [...(task.snoozeHistory || []), newRecord];
    const updates: Partial<Task> = {
      snoozeHistory: newHistory,
      status: 'inbox', // Snoozed tasks step out of Today
      updatedAt: now,
      lastInteractedAt: now,
      dueDate: rescheduleTimestamp || task.dueDate
    };

    await db.tasks.update(id, updates);
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t))
    }));
    useUIStore.getState().closeSnoozeModal();
  },

  dismissDecay: async (id: string) => {
    const now = Date.now();
    await db.tasks.update(id, {
      decayDismissedAt: now,
      lastInteractedAt: now
    });
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, decayDismissedAt: now, lastInteractedAt: now } : t
      )
    }));
    useUIStore.getState().closeDecayTriage();
  },

  addSubtask: async (taskId: string, title: string, estimatedMinutes = 10) => {
    const { tasks } = get();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newSubtask = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title,
      completed: false,
      estimatedMinutes
    };

    const updatedSubtasks = [...(task.subtasks || []), newSubtask];
    const now = Date.now();
    await db.tasks.update(taskId, {
      subtasks: updatedSubtasks,
      updatedAt: now,
      lastInteractedAt: now
    });

    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, subtasks: updatedSubtasks, updatedAt: now, lastInteractedAt: now } : t
      )
    }));
  },

  toggleSubtask: async (taskId: string, subtaskId: string) => {
    const { tasks } = get();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedSubtasks = (task.subtasks || []).map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );

    const now = Date.now();
    await db.tasks.update(taskId, {
      subtasks: updatedSubtasks,
      updatedAt: now,
      lastInteractedAt: now
    });

    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, subtasks: updatedSubtasks, updatedAt: now, lastInteractedAt: now } : t
      )
    }));
  },

  deleteSubtask: async (taskId: string, subtaskId: string) => {
    const { tasks } = get();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedSubtasks = (task.subtasks || []).filter((st) => st.id !== subtaskId);
    const now = Date.now();
    await db.tasks.update(taskId, {
      subtasks: updatedSubtasks,
      updatedAt: now,
      lastInteractedAt: now
    });

    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, subtasks: updatedSubtasks, updatedAt: now, lastInteractedAt: now } : t
      )
    }));
  },

  addProject: async (name: string, color: string) => {
    const { projects } = get();
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name,
      color,
      order: projects.length + 1
    };

    await db.projects.add(newProject);
    set((state) => ({ projects: [...state.projects, newProject] }));
    return newProject;
  },

  importData: async (jsonData) => {
    if (jsonData.tasks && Array.isArray(jsonData.tasks)) {
      await db.tasks.clear();
      await db.tasks.bulkAdd(jsonData.tasks);
    }
    if (jsonData.projects && Array.isArray(jsonData.projects)) {
      await db.projects.clear();
      await db.projects.bulkAdd(jsonData.projects);
    }
    if (jsonData.stats) {
      await db.stats.put(jsonData.stats);
    }

    const tasks = await db.tasks.toArray();
    const projects = await db.projects.toArray();
    const stats = await db.stats.get('current_user');

    set({
      tasks: tasks.sort((a, b) => a.order - b.order),
      projects: projects.sort((a, b) => a.order - b.order),
      userStats: stats || null
    });
  }
}));
