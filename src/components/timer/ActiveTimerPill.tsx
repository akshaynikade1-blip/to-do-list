import React from 'react';
import { Play, Pause, Square, Check, Zap, Clock } from 'lucide-react';
import { useTimerStore } from '../../stores/useTimerStore';
import { useTaskStore } from '../../stores/useTaskStore';
import { formatSecondsToTimer } from '../../utils/formatters';

export const ActiveTimerPill: React.FC = () => {
  const {
    activeTaskId,
    activeTaskTitle,
    mode,
    secondsRemaining,
    secondsElapsed,
    isRunning,
    pauseTimer,
    resumeTimer,
    stopAndSaveSession
  } = useTimerStore();

  const { toggleComplete } = useTaskStore();

  if (!activeTaskId) return null;

  const handleFinishAndComplete = async () => {
    if (activeTaskId) {
      await toggleComplete(activeTaskId);
    }
    await stopAndSaveSession(true);
  };

  const isFiveMinMode = mode === 'just_5_minutes';

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-4 pointer-events-none animate-in slide-in-from-bottom-6 duration-300">
      <div className="pointer-events-auto rounded-2xl bg-[var(--bg-card)]/95 backdrop-blur-xl border border-[var(--border-strong)] shadow-2xl p-3.5 flex items-center justify-between gap-3 ring-1 ring-black/5">
        {/* Left: Mode Icon + Title */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div
            className={`p-2 rounded-xl flex-shrink-0 ${
              isFiveMinMode
                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
            }`}
          >
            {isFiveMinMode ? (
              <Zap className="w-4 h-4 animate-pulse" />
            ) : (
              <Clock className="w-4 h-4 animate-spin" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-[var(--text-primary)] truncate">
              {activeTaskTitle}
            </div>
            <div className="text-[10px] font-mono text-[var(--text-muted)]">
              {isFiveMinMode ? '5m Sprint' : 'Focus Mode'} • {formatSecondsToTimer(secondsElapsed)} elapsed
            </div>
          </div>
        </div>

        {/* Center: Countdown Time */}
        <div className="font-mono text-base font-bold text-emerald-500 flex-shrink-0 px-2">
          {formatSecondsToTimer(secondsRemaining)}
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Pause / Resume */}
          <button
            onClick={isRunning ? pauseTimer : resumeTimer}
            className="p-2 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] border border-[var(--border-subtle)] transition"
            title={isRunning ? 'Pause' : 'Resume'}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          {/* Mark Complete & Save */}
          <button
            onClick={handleFinishAndComplete}
            className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs transition"
            title="Complete task and save session"
          >
            <Check className="w-4 h-4 stroke-[3]" />
          </button>

          {/* Stop / Cancel */}
          <button
            onClick={() => stopAndSaveSession(false)}
            className="p-2 rounded-xl text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition"
            title="Stop timer & save logged time"
          >
            <Square className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
