import React from 'react';
import { Zap, Play, CheckCircle2, PauseCircle } from 'lucide-react';
import { useTaskStore } from '../../stores/useTaskStore';
import { useUIStore } from '../../stores/useUIStore';
import { useTimerStore } from '../../stores/useTimerStore';

export const JustFiveMinutesPromptModal: React.FC = () => {
  const { isJust5MinPromptOpen, completed5MinTaskId, closeJust5MinPrompt } = useUIStore();
  const { tasks, toggleComplete } = useTaskStore();
  const { extendTimer, stopAndSaveSession } = useTimerStore();

  if (!isJust5MinPromptOpen) return null;

  const task = tasks.find((t) => t.id === completed5MinTaskId);

  const handleKeepGoing = () => {
    extendTimer(25); // Adds 25 mins and switches to standard running sprint
    closeJust5MinPrompt();
  };

  const handlePauseAndCredit = async () => {
    await stopAndSaveSession(false);
    closeJust5MinPrompt();
  };

  const handleCompleteTask = async () => {
    if (task) {
      await toggleComplete(task.id);
    }
    await stopAndSaveSession(true);
    closeJust5MinPrompt();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-[var(--bg-card)] border border-amber-500/30 shadow-2xl overflow-hidden p-6 text-center space-y-4">
        {/* Glowing badge */}
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center text-2xl shadow-sm animate-bounce">
          ⚡
        </div>

        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            5 Minutes Completed!
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            The friction of starting is broken. What would you like to do?
          </p>
        </div>

        {task && (
          <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)]">
            "{task.title}"
          </div>
        )}

        <div className="space-y-2 pt-2">
          {/* Action 1: Keep going */}
          <button
            onClick={handleKeepGoing}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold shadow-md transition hover:scale-[1.01]"
          >
            <Play className="w-4 h-4" />
            <span>Keep going! (+25m deep focus)</span>
          </button>

          {/* Action 2: Completed! */}
          <button
            onClick={handleCompleteTask}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-emerald-500/40 text-xs font-semibold text-[var(--text-primary)] transition"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Task finished! Mark complete</span>
          </button>

          {/* Action 3: Stop & take credit */}
          <button
            onClick={handlePauseAndCredit}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition"
          >
            <PauseCircle className="w-4 h-4" />
            <span>Stop here & log 5 minutes of focus</span>
          </button>
        </div>
      </div>
    </div>
  );
};
