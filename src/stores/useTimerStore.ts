import { create } from 'zustand';
import { db } from '../db';
import type { Task, FocusSession } from '../types';
import { useUIStore } from './useUIStore';

interface TimerState {
  activeTaskId: string | null;
  activeTaskTitle: string | null;
  mode: 'standard' | 'just_5_minutes' | null;
  secondsRemaining: number;
  secondsElapsed: number;
  isRunning: boolean;
  intervalId: number | null;

  startTimer: (task: Task, mode?: 'standard' | 'just_5_minutes') => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  extendTimer: (additionalMinutes: number) => void;
  stopAndSaveSession: (completedTask?: boolean) => Promise<void>;
  resetTimer: () => void;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  activeTaskId: null,
  activeTaskTitle: null,
  mode: null,
  secondsRemaining: 0,
  secondsElapsed: 0,
  isRunning: false,
  intervalId: null,

  startTimer: (task: Task, mode = 'standard') => {
    // Clear any existing timer
    const prevInterval = get().intervalId;
    if (prevInterval) clearInterval(prevInterval);

    const initialSeconds = mode === 'just_5_minutes' ? 5 * 60 : (task.estimatedMinutes || 25) * 60;

    const intervalId = window.setInterval(() => {
      const state = get();
      if (!state.isRunning) return;

      const newElapsed = state.secondsElapsed + 1;
      const newRemaining = Math.max(0, state.secondsRemaining - 1);

      if (state.mode === 'just_5_minutes' && newRemaining === 0) {
        // Just 5 Minutes sprint finished! Trigger prompt
        get().pauseTimer();
        useUIStore.getState().openJust5MinPrompt(state.activeTaskId || '');
      }

      set({
        secondsElapsed: newElapsed,
        secondsRemaining: newRemaining
      });
    }, 1000);

    set({
      activeTaskId: task.id,
      activeTaskTitle: task.title,
      mode,
      secondsRemaining: initialSeconds,
      secondsElapsed: 0,
      isRunning: true,
      intervalId
    });
  },

  pauseTimer: () => {
    set({ isRunning: false });
  },

  resumeTimer: () => {
    set({ isRunning: true });
  },

  extendTimer: (additionalMinutes: number) => {
    set((state) => ({
      mode: 'standard', // convert to ongoing standard sprint
      secondsRemaining: state.secondsRemaining + additionalMinutes * 60,
      isRunning: true
    }));
  },

  stopAndSaveSession: async (completedTask = false) => {
    const { activeTaskId, activeTaskTitle, mode, secondsElapsed, intervalId } = get();
    if (intervalId) clearInterval(intervalId);

    if (activeTaskId && secondsElapsed >= 10) {
      const minutesSpent = Math.max(1, Math.round(secondsElapsed / 60));
      const now = Date.now();

      const session: FocusSession = {
        id: `sess-${now}`,
        taskId: activeTaskId,
        taskTitle: activeTaskTitle || 'Focused task',
        startedAt: now - secondsElapsed * 1000,
        endedAt: now,
        durationMinutes: minutesSpent,
        mode: mode || 'standard',
        completedTask
      };

      try {
        await db.focusSessions.add(session);

        // Update task's actual minutes in Dexie
        const task = await db.tasks.get(activeTaskId);
        if (task) {
          const updatedMinutes = (task.actualMinutesSpent || 0) + minutesSpent;
          await db.tasks.update(activeTaskId, {
            actualMinutesSpent: updatedMinutes,
            lastInteractedAt: now,
            updatedAt: now
          });
        }

        // Update total focus minutes in stats
        const stats = await db.stats.get('current_user');
        if (stats) {
          await db.stats.update('current_user', {
            totalFocusMinutes: stats.totalFocusMinutes + minutesSpent
          });
        }
      } catch (err) {
        console.error('Failed to save focus session', err);
      }
    }

    set({
      activeTaskId: null,
      activeTaskTitle: null,
      mode: null,
      secondsRemaining: 0,
      secondsElapsed: 0,
      isRunning: false,
      intervalId: null
    });
  },

  resetTimer: () => {
    const { intervalId } = get();
    if (intervalId) clearInterval(intervalId);
    set({
      activeTaskId: null,
      activeTaskTitle: null,
      mode: null,
      secondsRemaining: 0,
      secondsElapsed: 0,
      isRunning: false,
      intervalId: null
    });
  }
}));
