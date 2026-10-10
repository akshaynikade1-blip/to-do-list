import React, { useState } from 'react';
import { X, Compass, Zap, Play, Sparkles, CheckCircle2 } from 'lucide-react';
import type { EnergyLevel } from '../../types';
import { findBestMatchingTasks } from '../../core/energyMatcher';
import { formatMinutes } from '../../utils/formatters';
import { useTaskStore } from '../../stores/useTaskStore';
import { useUIStore } from '../../stores/useUIStore';
import { useTimerStore } from '../../stores/useTimerStore';

export const EnergyPickerModal: React.FC = () => {
  const { isEnergyPickerOpen, closeEnergyPicker } = useUIStore();
  const { tasks } = useTaskStore();
  const { startTimer } = useTimerStore();

  const [energy, setEnergy] = useState<EnergyLevel>('medium');
  const [minutes, setMinutes] = useState<number>(30);

  if (!isEnergyPickerOpen) return null;

  const tasksMap = new Map(tasks.map((t) => [t.id, t]));
  const matches = findBestMatchingTasks(tasks, energy, minutes, tasksMap);
  const topMatch = matches[0];
  const runnerUps = matches.slice(1, 3);

  const handleStartFocus = (task: typeof topMatch.task, mode: 'standard' | 'just_5_minutes' = 'standard') => {
    startTimer(task, mode);
    closeEnergyPicker();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                What should I do right now?
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Biological energy alignment & time-box optimization
              </p>
            </div>
          </div>
          <button
            onClick={closeEnergyPicker}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* Step 1: Energy Selector */}
          <div>
            <label className="block text-xs font-bold text-[var(--text-primary)] mb-2">
              1. Current Energy Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { level: 'low' as const, label: 'Low', icon: '☕', sub: 'Calm, low friction' },
                  { level: 'medium' as const, label: 'Medium', icon: '⚡', sub: 'Steady progress' },
                  { level: 'high' as const, label: 'High', icon: '🚀', sub: 'Deep peak focus' }
                ]
              ).map((item) => {
                const isSelected = energy === item.level;
                return (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => setEnergy(item.level)}
                    className={`p-3 rounded-xl border text-left transition ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-[var(--text-primary)] ring-1 ring-emerald-500/30'
                        : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <div className="text-lg mb-1">{item.icon}</div>
                    <div className="text-xs font-bold">{item.label}</div>
                    <div className="text-[10px] text-[var(--text-muted)] leading-tight mt-0.5">
                      {item.sub}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Time Slider / Pills */}
          <div>
            <label className="block text-xs font-bold text-[var(--text-primary)] mb-2 flex items-center justify-between">
              <span>2. Available Free Time</span>
              <span className="font-mono text-emerald-500 font-bold">{minutes} minutes</span>
            </label>
            <div className="flex items-center gap-1.5">
              {[15, 25, 30, 45, 60, 90].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setMinutes(mins)}
                  className={`flex-1 py-2 rounded-xl text-xs font-mono transition border ${
                    minutes === mins
                      ? 'bg-emerald-500 text-white border-emerald-500 font-bold shadow-xs'
                      : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          {/* Recommended Match Result */}
          <div className="pt-2 border-t border-[var(--border-subtle)]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>Optimal Match</span>
            </h3>

            {topMatch ? (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-[var(--bg-card)] to-transparent border border-emerald-500/30 shadow-sm space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 font-bold">
                      {Math.round(topMatch.score)}% Fit Score
                    </span>
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">
                      Est. {formatMinutes(topMatch.task.estimatedMinutes)}
                    </span>
                    <span className="text-[10px] font-mono uppercase text-emerald-500 font-medium">
                      {topMatch.task.energyLevel} energy
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-[var(--text-primary)]">
                    {topMatch.task.title}
                  </h4>
                  {topMatch.task.description && (
                    <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">
                      {topMatch.task.description}
                    </p>
                  )}
                </div>

                {/* Match Reasons */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {topMatch.matchReasons.map((reason, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md text-[10px] bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-subtle)]"
                    >
                      ✓ {reason}
                    </span>
                  ))}
                </div>

                {/* Action CTA */}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => handleStartFocus(topMatch.task, 'standard')}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-xs transition"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Start Focus Session ({minutes}m)</span>
                  </button>

                  <button
                    onClick={() => handleStartFocus(topMatch.task, 'just_5_minutes')}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-semibold transition"
                    title="Low friction 5m sprint"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>5m Sprint</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[var(--bg-secondary)] text-center text-xs text-[var(--text-muted)]">
                No active tasks match this exact combination. Try adjusting minutes or energy!
              </div>
            )}

            {/* Runner Ups */}
            {runnerUps.length > 0 && (
              <div className="mt-4">
                <h4 className="text-[11px] font-bold text-[var(--text-muted)] mb-2">
                  Alternative Options
                </h4>
                <div className="space-y-2">
                  {runnerUps.map((runner) => (
                    <div
                      key={runner.task.id}
                      className="p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-between gap-3 hover:border-[var(--border-strong)] transition"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-[var(--text-primary)] truncate">
                          {runner.task.title}
                        </div>
                        <div className="text-[10px] text-[var(--text-muted)] font-mono">
                          {formatMinutes(runner.task.estimatedMinutes)} • {runner.task.energyLevel} energy
                        </div>
                      </div>
                      <button
                        onClick={() => handleStartFocus(runner.task, 'standard')}
                        className="px-2.5 py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] hover:border-emerald-500/50 hover:text-emerald-500 transition"
                      >
                        Focus
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
