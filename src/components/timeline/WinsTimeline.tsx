import React from 'react';
import { Flame, Shield, CheckCircle2, Clock, Calendar, Sparkles, Undo2 } from 'lucide-react';
import { useTaskStore } from '../../stores/useTaskStore';
import { formatMinutes } from '../../utils/formatters';

export const WinsTimeline: React.FC = () => {
  const { tasks, userStats, toggleComplete } = useTaskStore();

  const completedTasks = tasks
    .filter((t) => t.status === 'completed')
    .sort((a, b) => (b.completedAt || b.updatedAt) - (a.completedAt || a.updatedAt));

  const streak = userStats?.streakCount || 1;
  const hasShield = userStats?.missedGraceDays === 0;

  // Group completed tasks by date string (e.g. 'Today', 'Yesterday', 'Oct 8, 2026')
  const groupedWins = completedTasks.reduce((acc, task) => {
    const timestamp = task.completedAt || task.updatedAt || Date.now();
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

    let key = date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });

    if (date.toDateString() === today.toDateString()) {
      key = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      key = 'Yesterday';
    }

    if (!acc[key]) acc[key] = [];
    acc[key].push(task);
    return acc;
  }, {} as Record<string, typeof completedTasks>);

  return (
    <div className="space-y-6">
      {/* Forgiving Streak & Milestone Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-[var(--bg-card)] to-emerald-500/10 border border-[var(--border-subtle)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-500 border border-amber-500/30">
            <Flame className="w-7 h-7 fill-amber-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold text-[var(--text-primary)] font-mono">
                {streak}-Day Momentum Streak
              </span>
              {hasShield && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <Shield className="w-3 h-3" />
                  Grace Shield Active
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              {hasShield
                ? 'Your streak is forgiving: 1 missed day is automatically absorbed without breaking your chain.'
                : 'Grace Shield currently used. Complete a win today to restore your shield tomorrow!'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
            <span className="text-[var(--text-muted)] block text-[10px]">TOTAL WINS</span>
            <span className="text-emerald-500 font-bold text-sm">
              {userStats?.totalCompletedTasks || completedTasks.length}
            </span>
          </div>
          <div className="px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
            <span className="text-[var(--text-muted)] block text-[10px]">DEEP MINUTES</span>
            <span className="text-indigo-500 font-bold text-sm">
              {userStats?.totalFocusMinutes || 0}m
            </span>
          </div>
        </div>
      </div>

      {/* Journal Timeline Feed */}
      {Object.keys(groupedWins).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedWins).map(([dateLabel, winTasks]) => (
            <div key={dateLabel} className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-mono flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{dateLabel}</span>
                </span>
                <div className="flex-1 border-t border-[var(--border-subtle)]" />
                <span className="text-[11px] text-[var(--text-muted)] font-mono">
                  {winTasks.length} {winTasks.length === 1 ? 'win' : 'wins'}
                </span>
              </div>

              {/* Day's Wins */}
              <div className="space-y-2.5 pl-3 border-l-2 border-emerald-500/30">
                {winTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-emerald-500/30 transition flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-[var(--text-primary)] truncate">
                          {task.title}
                        </div>
                        <div className="text-[10px] text-[var(--text-muted)] font-mono flex items-center gap-2 mt-0.5">
                          <span>{task.energyLevel} energy</span>
                          {task.actualMinutesSpent > 0 && (
                            <span>• Focused {formatMinutes(task.actualMinutesSpent)}</span>
                          )}
                          {task.subtasks && task.subtasks.length > 0 && (
                            <span>• {task.subtasks.length} subtasks</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleComplete(task.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-[var(--text-muted)] hover:text-amber-500 hover:bg-[var(--bg-secondary)] transition text-xs flex items-center gap-1"
                      title="Undo completion and move back to inbox"
                    >
                      <Undo2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline text-[10px]">Uncheck</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center space-y-3 rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-card)]/50">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            Your Wins Journal is Ready
          </h3>
          <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
            Complete tasks from your Today list to record them in your persistent momentum diary.
          </p>
        </div>
      )}
    </div>
  );
};
