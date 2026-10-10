import React from 'react';
import { X, ArrowRightLeft, ShieldAlert, ArrowDown } from 'lucide-react';
import { useTaskStore } from '../../stores/useTaskStore';
import { useUIStore } from '../../stores/useUIStore';

export const SwapTaskModal: React.FC = () => {
  const { isSwapModalOpen, swapContext, closeSwapModal } = useUIStore();
  const { tasks, swapTasks } = useTaskStore();

  if (!isSwapModalOpen || !swapContext) return null;

  const { targetTaskId, targetStatus, currentMainTasks, currentBonusTasks } = swapContext;
  const newCandidateTask = tasks.find((t) => t.id === targetTaskId);

  const slotsToDisplace =
    targetStatus === 'today_main' ? currentMainTasks : currentBonusTasks;

  const handleExecuteSwap = (displacedTaskId: string, demoteToBonus = false) => {
    swapTasks(displacedTaskId, targetTaskId, targetStatus, demoteToBonus);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                Rule of 3 Capacity Reached
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                {targetStatus === 'today_main' ? '3 Main Wins' : '2 Bonus Slots'} Max
              </p>
            </div>
          </div>
          <button
            onClick={closeSwapModal}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] leading-relaxed">
            You want to add <strong className="text-[var(--text-primary)]">"{newCandidateTask?.title || 'this task'}"</strong> to{' '}
            <strong className="text-emerald-500">
              {targetStatus === 'today_main' ? 'Today Main Focus' : 'Today Bonus'}
            </strong>
            . To prevent overloaded lists, pick which task to swap out:
          </div>

          <div className="space-y-2.5">
            {slotsToDisplace.map((occupant) => (
              <div
                key={occupant.id}
                className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:border-amber-500/40 transition space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold text-[var(--text-primary)] line-clamp-1">
                    {occupant.title}
                  </span>
                  <span className="text-[10px] font-mono text-[var(--text-muted)] flex-shrink-0">
                    {occupant.estimatedMinutes}m
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleExecuteSwap(occupant.id, false)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-amber-500/50 hover:text-amber-500 text-xs font-medium text-[var(--text-primary)] transition"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>Swap to Backlog</span>
                  </button>

                  {targetStatus === 'today_main' && (
                    <button
                      onClick={() => handleExecuteSwap(occupant.id, true)}
                      className="flex items-center gap-1 py-1.5 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-xs font-medium transition"
                      title="Move this task to Bonus instead"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                      <span>Demote to Bonus</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Cancel */}
          <div className="pt-2 text-center">
            <button
              onClick={closeSwapModal}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
            >
              Cancel and keep in Backlog
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
