import React, { useState, useEffect } from 'react';
import { X, Split, Plus, Trash2, CheckCircle2, Sparkles, RefreshCw } from 'lucide-react';
import type { Subtask } from '../../types';
import { splitTaskIntoSubtasks } from '../../core/autoSplitter';
import { useTaskStore } from '../../stores/useTaskStore';
import { useUIStore } from '../../stores/useUIStore';

export const AutoSplitModal: React.FC = () => {
  const { isAutoSplitModalOpen, autoSplitTask, closeAutoSplitModal } = useUIStore();
  const { updateTask } = useTaskStore();

  const [steps, setSteps] = useState<Subtask[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sourceType, setSourceType] = useState<string>('rule-based');

  const generateBreakdown = async () => {
    if (!autoSplitTask) return;
    setIsLoading(true);
    try {
      const result = await splitTaskIntoSubtasks(
        autoSplitTask.title,
        autoSplitTask.description
      );
      setSteps(result.subtasks);
      setSourceType(result.source);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAutoSplitModalOpen && autoSplitTask) {
      if (autoSplitTask.subtasks && autoSplitTask.subtasks.length > 0) {
        setSteps(autoSplitTask.subtasks);
      } else {
        generateBreakdown();
      }
    }
  }, [isAutoSplitModalOpen, autoSplitTask]);

  if (!isAutoSplitModalOpen || !autoSplitTask) return null;

  const handleUpdateTitle = (id: string, newTitle: string) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle } : s))
    );
  };

  const handleUpdateMinutes = (id: string, mins: number) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, estimatedMinutes: mins } : s))
    );
  };

  const handleRemoveStep = (id: string) => {
    setSteps((prev) => prev.filter((s) => s.id !== id));
  };

  const handleAddCustomStep = () => {
    const newStep: Subtask = {
      id: `custom-sub-${Date.now()}`,
      title: 'New step',
      completed: false,
      estimatedMinutes: 15
    };
    setSteps((prev) => [...prev, newStep]);
  };

  const handleApplySteps = async () => {
    if (!autoSplitTask) return;
    await updateTask(autoSplitTask.id, {
      subtasks: steps
    });
    closeAutoSplitModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
              <Split className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                Auto-Splitter: Break It Down
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Dismantle cognitive friction into bite-sized momentum
              </p>
            </div>
          </div>
          <button
            onClick={closeAutoSplitModal}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Target Task Showcase */}
          <div className="p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
            <div className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider mb-1">
              Target Task
            </div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              {autoSplitTask.title}
            </h3>
            {autoSplitTask.description && (
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                {autoSplitTask.description}
              </p>
            )}
          </div>

          {/* Engine Status Banner */}
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>
                Generated via heuristic pattern breakdown ({steps.length} steps)
              </span>
            </div>
            <button
              onClick={generateBreakdown}
              disabled={isLoading}
              className="flex items-center gap-1 text-[11px] text-indigo-500 hover:text-indigo-600 transition"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Regenerate</span>
            </button>
          </div>

          {/* Editable Steps List */}
          <div className="space-y-2">
            {steps.map((step, idx) => (
              <div
                key={step.id}
                className="p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center gap-2 group"
              >
                <span className="font-mono text-xs text-[var(--text-muted)] w-5 text-right">
                  {idx + 1}.
                </span>
                <input
                  type="text"
                  value={step.title}
                  onChange={(e) => handleUpdateTitle(step.id, e.target.value)}
                  className="flex-1 text-xs px-2 py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-indigo-500/50"
                />
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={5}
                    max={120}
                    step={5}
                    value={step.estimatedMinutes || 15}
                    onChange={(e) => handleUpdateMinutes(step.id, Number(e.target.value))}
                    className="w-12 text-center text-xs font-mono py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                    title="Estimated minutes"
                  />
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">m</span>
                </div>
                <button
                  onClick={() => handleRemoveStep(step.id)}
                  className="p-1 text-[var(--text-muted)] hover:text-rose-500 opacity-60 hover:opacity-100 transition"
                  title="Remove step"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleAddCustomStep}
            className="w-full py-2 rounded-xl border border-dashed border-[var(--border-subtle)] hover:border-indigo-500/50 hover:bg-indigo-500/5 text-xs text-indigo-500 font-medium flex items-center justify-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Step Manually</span>
          </button>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[var(--border-subtle)] flex items-center justify-end gap-2">
          <button
            onClick={closeAutoSplitModal}
            className="px-3 py-2 rounded-xl text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            Cancel
          </button>
          <button
            onClick={handleApplySteps}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition"
          >
            Save Subtasks to Task
          </button>
        </div>
      </div>
    </div>
  );
};
