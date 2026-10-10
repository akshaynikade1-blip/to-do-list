import React from 'react';
import { Target, Sparkles, Plus, Info } from 'lucide-react';
import type { Task } from '../../types';
import { TaskCard } from './TaskCard';
import { useTaskStore } from '../../stores/useTaskStore';
import { useUIStore } from '../../stores/useUIStore';

export const RuleOfThreeSection: React.FC = () => {
  const { tasks } = useTaskStore();
  const { openTaskModal, openEnergyPicker } = useUIStore();

  const mainTasks = tasks.filter((t) => t.status === 'today_main');
  const bonusTasks = tasks.filter((t) => t.status === 'today_bonus');

  // Fill up empty slots up to 3 for Main and 2 for Bonus
  const emptyMainSlotsCount = Math.max(0, 3 - mainTasks.length);
  const emptyBonusSlotsCount = Math.max(0, 2 - bonusTasks.length);

  return (
    <div className="space-y-6">
      {/* Editorial Philosophy Header */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-[var(--bg-card)] to-transparent border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 mt-0.5">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[var(--text-primary)]">
              The Rule of 3 — Intention Over Overload
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Psychology shows capping daily goals at 3 prevents paralysis. 3 Main wins + 2 optional bonus tasks.
            </p>
          </div>
        </div>

        <button
          onClick={openEnergyPicker}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-xs transition"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Match by Energy</span>
        </button>
      </div>

      {/* Main Focus Section (Max 3) */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
              <span>Main Focus</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-mono text-[11px] font-bold">
                {mainTasks.length} / 3
              </span>
            </h3>
          </div>
          <span className="text-[11px] text-[var(--text-muted)]">
            {mainTasks.length === 3 ? 'Slots filled • Swap to replace' : `${emptyMainSlotsCount} slots available`}
          </span>
        </div>

        <div className="space-y-3">
          {mainTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}

          {/* Empty Placeholder Slots */}
          {Array.from({ length: emptyMainSlotsCount }).map((_, idx) => {
            const slotNumber = mainTasks.length + idx + 1;
            return (
              <button
                key={`empty-main-${idx}`}
                onClick={() => openTaskModal({ status: 'today_main' } as Partial<Task>)}
                className="w-full py-4 px-4 rounded-2xl border-2 border-dashed border-[var(--border-subtle)] hover:border-emerald-500/50 hover:bg-emerald-500/5 flex items-center justify-center gap-2 text-xs font-medium text-[var(--text-muted)] hover:text-emerald-500 transition group"
              >
                <Plus className="w-4 h-4 transition group-hover:scale-110" />
                <span>Slot {slotNumber}: Click to claim your #{slotNumber} main win</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bonus Buffer Section (Max 2) */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-2">
              <span>Bonus Slots</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-mono text-[11px] font-bold">
                {bonusTasks.length} / 2
              </span>
            </h3>
          </div>
          <span className="text-[11px] text-[var(--text-muted)]">
            Optional low-pressure extras
          </span>
        </div>

        <div className="space-y-3">
          {bonusTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}

          {/* Empty Bonus Placeholder Slots */}
          {Array.from({ length: emptyBonusSlotsCount }).map((_, idx) => {
            const slotNumber = bonusTasks.length + idx + 1;
            return (
              <button
                key={`empty-bonus-${idx}`}
                onClick={() => openTaskModal({ status: 'today_bonus' } as Partial<Task>)}
                className="w-full py-3 px-4 rounded-2xl border border-dashed border-[var(--border-subtle)] hover:border-amber-500/40 hover:bg-amber-500/5 flex items-center justify-center gap-2 text-xs font-medium text-[var(--text-muted)] hover:text-amber-500 transition group"
              >
                <Plus className="w-3.5 h-3.5 transition group-hover:scale-110" />
                <span>Bonus Slot {slotNumber}: Add non-critical momentum task</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
