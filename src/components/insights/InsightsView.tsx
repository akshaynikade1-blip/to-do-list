import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Clock,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Calendar,
  Sparkles,
  Zap
} from 'lucide-react';
import { useTaskStore } from '../../stores/useTaskStore';
import {
  analyzeProcrastinationReasons,
  calculateMultiplierStats,
  SNOOZE_LABELS
} from '../../core/estimateAnalytics';
import { formatMinutes } from '../../utils/formatters';
import { db } from '../../db';
import type { FocusSession } from '../../types';

export const InsightsView: React.FC = () => {
  const { tasks } = useTaskStore();
  const [sessions, setSessions] = useState<FocusSession[]>([]);

  useEffect(() => {
    db.focusSessions.toArray().then((data) => {
      setSessions(data.sort((a, b) => b.startedAt - a.startedAt));
    });
  }, [tasks]);

  const procrastination = analyzeProcrastinationReasons(tasks);
  const estimation = calculateMultiplierStats(tasks);

  return (
    <div className="space-y-6">
      {/* Feature 5: Estimate vs Reality Multiplier Hero Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-[var(--bg-card)] to-emerald-500/10 border border-[var(--border-subtle)] space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-500/15 text-indigo-500 border border-indigo-500/30">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                Estimate vs Reality — The Accuracy Multiplier
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Built-in focus timer learning model tracks your estimation bias
              </p>
            </div>
          </div>

          {/* Multiplier Badge */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-500">
            <span className="text-xs font-mono font-medium">Personal Bias:</span>
            <span className="text-xl font-bold font-mono">
              {estimation.multiplier}x
            </span>
          </div>
        </div>

        {/* Dynamic Bias Banner */}
        <div className="p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-[var(--text-secondary)] leading-relaxed">
            <strong className="text-[var(--text-primary)] block mb-0.5">
              Estimation Insight:
            </strong>
            {estimation.biasDescription}
          </div>
        </div>

        {/* Minutes Comparison Bar */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
            <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] block">
              Estimated Focus
            </span>
            <span className="text-base font-bold font-mono text-[var(--text-primary)]">
              {formatMinutes(estimation.totalEstimatedMinutes)}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
            <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] block">
              Actual Time Spent
            </span>
            <span className="text-base font-bold font-mono text-emerald-500">
              {formatMinutes(estimation.totalActualMinutes)}
            </span>
          </div>
        </div>
      </div>

      {/* Feature 4: Snooze with a Reason & Procrastination Patterns */}
      <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-500 border border-amber-500/30">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              Procrastination Bottleneck Analysis
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Breakdown of {procrastination.totalSnoozes} postponement reasons logged
            </p>
          </div>
        </div>

        {/* Actionable Strategy Tip */}
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 leading-relaxed flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Strategic Intervention: </strong>
            {procrastination.insightTip}
          </div>
        </div>

        {/* Reason Distribution Bars */}
        <div className="space-y-3 pt-2">
          {(Object.entries(SNOOZE_LABELS) as [keyof typeof SNOOZE_LABELS, typeof SNOOZE_LABELS['too_big']][]).map(
            ([reasonKey, meta]) => {
              const count = procrastination.reasonCounts[reasonKey] || 0;
              const pct = procrastination.reasonPercentages[reasonKey] || 0;

              return (
                <div key={reasonKey} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
                      <span>{meta.icon}</span>
                      <span>{meta.label}</span>
                    </span>
                    <span className="font-mono text-[var(--text-muted)]">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-500"
                      style={{ width: `${Math.max(pct, count > 0 ? 5 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* Recent Focus Sessions Log */}
      <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
          Recent Focus Sessions Log
        </h3>
        {sessions.length > 0 ? (
          <div className="space-y-2">
            {sessions.slice(0, 5).map((sess) => (
              <div
                key={sess.id}
                className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-500">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium text-[var(--text-primary)] truncate">
                    {sess.taskTitle}
                  </span>
                </div>
                <div className="flex items-center gap-3 font-mono text-[11px] text-[var(--text-muted)] flex-shrink-0">
                  <span className="text-emerald-500 font-bold">
                    {sess.durationMinutes}m focused
                  </span>
                  <span>{new Date(sess.endedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[var(--text-muted)]">
            No focus sessions logged yet. Hit "Focus" or "5m Sprint" on any task to begin!
          </p>
        )}
      </div>
    </div>
  );
};
