import React from 'react';
import { X, Flame, Scissors, Calendar, Trash2, Clock, CheckCircle2 } from 'lucide-react';
import { useTaskStore } from '../../stores/useTaskStore';
import { useUIStore } from '../../stores/useUIStore';
import { calculateTaskDecay } from '../../core/decayEngine';

export const DecayTriageModal: React.FC = () => {
  const { isDecayTriageOpen, decayTask, closeDecayTriage, openAutoSplitModal, openSnoozeModal } =
    useUIStore();
  const { assignStatus, deleteTask, dismissDecay } = useTaskStore();

  if (!isDecayTriageOpen || !decayTask) return null;

  const decay = calculateTaskDecay(decayTask);

  const handleDoIt = async () => {
    closeDecayTriage();
    await assignStatus(decayTask.id, 'today_main');
  };

  const handleShrinkIt = () => {
    closeDecayTriage();
    openAutoSplitModal(decayTask);
  };

  const handleReschedule = () => {
    closeDecayTriage();
    openSnoozeModal(decayTask);
  };

  const handleDeleteIt = async () => {
    closeDecayTriage();
    await deleteTask(decayTask.id);
  };

  const handleKeepAsIs = async () => {
    await dismissDecay(decayTask.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-2xl overflow-hidden">
        {/* Header with Sepia/Amber aging theme */}
        <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-amber-500/5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <span className="text-lg">🍂</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                7-Day Task Decay Triage
              </h2>
              <p className="text-xs text-amber-500 font-mono">
                Untouched for {Math.round(decay.ageDays)} days
              </p>
            </div>
          </div>
          <button
            onClick={closeDecayTriage}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Task Showcase */}
        <div className="p-5 space-y-4">
          <div className="p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              {decayTask.title}
            </h3>
            {decayTask.description && (
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                {decayTask.description}
              </p>
            )}
            <div className="mt-2 text-[11px] text-[var(--text-muted)] font-mono">
              Created {new Date(decayTask.createdAt).toLocaleDateString()} • {decayTask.energyLevel} energy
            </div>
          </div>

          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Unfinished tasks linger in your subconscious. Choose one of the 4 triage actions to clear this mental debt:
          </p>

          {/* The 4 Triage Actions */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* 1. Do It */}
            <button
              onClick={handleDoIt}
              className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-left transition group"
            >
              <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs">
                <Flame className="w-4 h-4 group-hover:scale-110 transition" />
                <span>Do It Now</span>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] mt-1">
                Promote straight into Today's Main 3
              </p>
            </button>

            {/* 2. Shrink It */}
            <button
              onClick={handleShrinkIt}
              className="p-3 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-left transition group"
            >
              <div className="flex items-center gap-2 text-indigo-500 font-bold text-xs">
                <Scissors className="w-4 h-4 group-hover:scale-110 transition" />
                <span>Shrink It</span>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] mt-1">
                Split into smaller 10-15m bite-sized steps
              </p>
            </button>

            {/* 3. Reschedule */}
            <button
              onClick={handleReschedule}
              className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-left transition group"
            >
              <div className="flex items-center gap-2 text-amber-500 font-bold text-xs">
                <Calendar className="w-4 h-4 group-hover:scale-110 transition" />
                <span>Reschedule</span>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] mt-1">
                Set a deliberate date with a reason
              </p>
            </button>

            {/* 4. Delete It */}
            <button
              onClick={handleDeleteIt}
              className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-left transition group"
            >
              <div className="flex items-center gap-2 text-rose-500 font-bold text-xs">
                <Trash2 className="w-4 h-4 group-hover:scale-110 transition" />
                <span>Delete It</span>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] mt-1">
                Liberate bandwidth with no guilt
              </p>
            </button>
          </div>

          {/* Dismiss temporarily */}
          <div className="pt-2 text-center">
            <button
              onClick={handleKeepAsIs}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
            >
              Keep as is for 3 more days
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
