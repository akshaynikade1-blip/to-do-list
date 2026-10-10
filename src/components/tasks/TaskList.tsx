import React from 'react';
import { Layers, Plus, Inbox, Sparkles } from 'lucide-react';
import type { Task } from '../../types';
import { TaskCard } from './TaskCard';
import { useTaskStore } from '../../stores/useTaskStore';
import { useUIStore } from '../../stores/useUIStore';

export const TaskList: React.FC = () => {
  const { tasks } = useTaskStore();
  const {
    searchQuery,
    selectedProjectId,
    selectedEnergy,
    selectedTag,
    openTaskModal,
    openEnergyPicker
  } = useUIStore();

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    // Only active (non-completed)
    if (t.status === 'completed' || t.status === 'archived') return false;

    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      const matchTag = t.tags?.some((tag) => tag.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchTag) return false;
    }

    // Project filter
    if (selectedProjectId && t.projectId !== selectedProjectId) return false;

    // Energy filter
    if (selectedEnergy !== 'all' && t.energyLevel !== selectedEnergy) return false;

    // Tag filter
    if (selectedTag && !t.tags?.includes(selectedTag)) return false;

    return true;
  });

  const inboxTasks = filteredTasks.filter((t) => t.status === 'inbox');
  const activeTodayTasks = filteredTasks.filter(
    (t) => t.status === 'today_main' || t.status === 'today_bonus'
  );

  return (
    <div className="space-y-6">
      {/* If active today tasks match filters */}
      {activeTodayTasks.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Scheduled for Today ({activeTodayTasks.length})
            </h3>
          </div>
          <div className="space-y-3">
            {activeTodayTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}

      {/* Inbox / Backlog Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-2">
            <Inbox className="w-4 h-4 text-emerald-500" />
            <span>Inbox & Backlog ({inboxTasks.length})</span>
          </h3>

          <button
            onClick={() => openTaskModal({ status: 'inbox' } as Partial<Task>)}
            className="flex items-center gap-1 text-xs text-emerald-500 hover:text-emerald-600 font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
        </div>

        {inboxTasks.length > 0 ? (
          <div className="space-y-3">
            {inboxTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        ) : (
          filteredTasks.length === 0 && (
            <div className="py-12 px-6 rounded-2xl border border-dashed border-[var(--border-subtle)] text-center bg-[var(--bg-card)]/50">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                All clear! No tasks matching your view.
              </h4>
              <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-sm mx-auto">
                Your mind is free of open loops. Enjoy the stillness or capture a new task.
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <button
                  onClick={() => openTaskModal()}
                  className="px-3 py-1.5 rounded-xl bg-[var(--text-primary)] text-[var(--bg-primary)] text-xs font-semibold shadow-xs"
                >
                  Create a Task
                </button>
                <button
                  onClick={openEnergyPicker}
                  className="px-3 py-1.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-primary)]"
                >
                  Energy Suggestion
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};
