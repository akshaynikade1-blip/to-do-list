import React, { useState } from 'react';
import {
  Check,
  Lock,
  Play,
  Zap,
  Split,
  Clock,
  Calendar,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Trash2,
  Edit2,
  Folder,
  ArrowRightCircle
} from 'lucide-react';
import type { Task } from '../../types';
import { calculateTaskDecay } from '../../core/decayEngine';
import { checkTaskDependencies } from '../../core/dependencyGraph';
import { formatMinutes, formatDateRelative } from '../../utils/formatters';
import { useTaskStore } from '../../stores/useTaskStore';
import { useUIStore } from '../../stores/useUIStore';
import { useTimerStore } from '../../stores/useTimerStore';

interface TaskCardProps {
  task: Task;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  const {
    tasks,
    projects,
    toggleComplete,
    deleteTask,
    assignStatus,
    toggleSubtask,
    addSubtask,
    deleteSubtask
  } = useTaskStore();

  const {
    openTaskModal,
    openSnoozeModal,
    openAutoSplitModal,
    openDecayTriage
  } = useUIStore();

  const { startTimer, activeTaskId, isRunning } = useTimerStore();

  // Tasks map for blocker lookup
  const tasksById = new Map(tasks.map((t) => [t.id, t]));
  const depCheck = checkTaskDependencies(task, tasksById);
  const decayStatus = calculateTaskDecay(task);

  const isCurrentTimerTask = activeTaskId === task.id && isRunning;
  const project = projects.find((p) => p.id === task.projectId);

  const energyMeta = {
    low: { label: 'Low', icon: '☕', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
    medium: { label: 'Med', icon: '⚡', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
    high: { label: 'High', icon: '🚀', color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' }
  }[task.energyLevel];

  // Visual decay style class
  const decayClass = {
    fresh: 'decay-fresh',
    aging: 'decay-aging',
    wilting: 'decay-wilting',
    critical: 'decay-critical'
  }[decayStatus.stage];

  const handleCheckboxClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (depCheck.isBlocked) {
      alert(
        `Cannot complete yet: blocked by "${depCheck.unresolvedBlockers[0]?.title}". Complete the blocker first!`
      );
      return;
    }
    await toggleComplete(task.id);
  };

  const handleAddSubtaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    addSubtask(task.id, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
  };

  return (
    <div
      className={`group relative rounded-2xl border bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-all duration-200 shadow-xs hover:shadow-md ${decayClass} ${
        task.status === 'completed' ? 'opacity-60 bg-[var(--bg-secondary)]/50' : ''
      }`}
    >
      <div className="p-3.5 sm:p-4">
        {/* Top Badges & Decay Warnings */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Energy Badge */}
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium border ${energyMeta.color}`}
              title={`Energy requirement: ${energyMeta.label}`}
            >
              <span>{energyMeta.icon}</span>
              <span>{energyMeta.label}</span>
            </span>

            {/* Time Estimation Pill */}
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono text-[var(--text-secondary)] bg-[var(--bg-secondary)] border border-[var(--border-subtle)]"
              title={`Estimated: ${task.estimatedMinutes}m | Actual spent: ${task.actualMinutesSpent}m`}
            >
              <Clock className="w-3 h-3 text-[var(--text-muted)]" />
              <span>{formatMinutes(task.estimatedMinutes)}</span>
              {task.actualMinutesSpent > 0 && (
                <span className="text-emerald-500 font-semibold">
                  ({formatMinutes(task.actualMinutesSpent)})
                </span>
              )}
            </span>

            {/* Project Pill */}
            {project && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] text-[var(--text-secondary)] bg-[var(--bg-secondary)] border border-[var(--border-subtle)]"
                style={{ borderColor: `${project.color}40` }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
                <span>{project.name}</span>
              </span>
            )}

            {/* Due Date */}
            {task.dueDate && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono text-[var(--text-secondary)] bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                <Calendar className="w-3 h-3 text-[var(--text-muted)]" />
                <span>{formatDateRelative(task.dueDate)}</span>
              </span>
            )}
          </div>

          {/* Aging/Decay Badge & Triage Trigger */}
          {decayStatus.stage !== 'fresh' && task.status !== 'completed' && (
            <div className="flex items-center gap-1.5">
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
                  decayStatus.stage === 'critical'
                    ? 'text-rose-500 bg-rose-500/10 border-rose-500/30 font-semibold animate-pulse'
                    : 'text-amber-500 bg-amber-500/10 border-amber-500/30'
                }`}
                title={decayStatus.label}
              >
                🍂 {decayStatus.label}
              </span>
              {decayStatus.requiresTriage && (
                <button
                  onClick={() => openDecayTriage(task)}
                  className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-500 text-white hover:bg-rose-600 transition"
                  title="Aged > 7 days. Open triage ritual."
                >
                  Triage
                </button>
              )}
            </div>
          )}
        </div>

        {/* Task Title & Checkbox */}
        <div className="flex items-start gap-3">
          {/* Custom Animated Checkbox */}
          <button
            onClick={handleCheckboxClick}
            disabled={depCheck.isBlocked}
            className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
              task.status === 'completed'
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : depCheck.isBlocked
                ? 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] cursor-not-allowed opacity-60'
                : 'border-[var(--border-strong)] hover:border-emerald-500/80 bg-[var(--bg-card)]'
            }`}
            title={
              depCheck.isBlocked
                ? `Locked: blocked by "${depCheck.unresolvedBlockers[0]?.title}"`
                : task.status === 'completed'
                ? 'Mark incomplete'
                : 'Complete task'
            }
          >
            {task.status === 'completed' ? (
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            ) : depCheck.isBlocked ? (
              <Lock className="w-3 h-3 text-amber-500" />
            ) : null}
          </button>

          {/* Title & Description */}
          <div className="flex-1 min-w-0">
            <h3
              className={`text-sm font-semibold tracking-tight leading-snug break-words ${
                task.status === 'completed'
                  ? 'line-through text-[var(--text-muted)]'
                  : 'text-[var(--text-primary)]'
              }`}
            >
              {task.title}
            </h3>

            {task.description && (
              <p className="mt-1 text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                {task.description}
              </p>
            )}

            {/* Dependency Warning Banner if Blocked */}
            {depCheck.isBlocked && (
              <div className="mt-2 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px]">
                <Lock className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">
                  Blocked by:{' '}
                  <strong>{depCheck.unresolvedBlockers.map((b) => b.title).join(', ')}</strong>
                </span>
              </div>
            )}

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="mt-2 flex items-center gap-1 flex-wrap">
                {task.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] text-[var(--text-muted)] font-mono hover:text-[var(--text-secondary)]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Quick Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] opacity-0 group-hover:opacity-100 transition"
              aria-label="More task options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div
                className="absolute right-0 top-6 z-20 w-44 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-xl p-1 text-xs text-[var(--text-primary)]"
                onMouseLeave={() => setShowMenu(false)}
              >
                <button
                  onClick={() => {
                    setShowMenu(false);
                    openTaskModal(task);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[var(--bg-secondary)] text-left"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit details</span>
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    openAutoSplitModal(task);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[var(--bg-secondary)] text-left"
                >
                  <Split className="w-3.5 h-3.5" />
                  <span>Break it down</span>
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    openSnoozeModal(task);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[var(--bg-secondary)] text-left"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Snooze with reason</span>
                </button>
                <div className="my-1 border-t border-[var(--border-subtle)]" />
                <button
                  onClick={() => {
                    setShowMenu(false);
                    deleteTask(task.id);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500 text-left"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete task</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action Bar (Just 5 Min, Focus, Break it Down, Snooze, Move) */}
        {task.status !== 'completed' && (
          <div className="mt-3 pt-2.5 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Feature 6: "Just 5 Minutes" Mode */}
              <button
                onClick={() => startTimer(task, 'just_5_minutes')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[11px] font-semibold transition"
                title="Start a low-friction 5-minute sprint"
              >
                <Zap className="w-3 h-3" />
                <span>5m Sprint</span>
              </button>

              {/* Feature 5: Focus Timer */}
              <button
                onClick={() => startTimer(task, 'standard')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--bg-secondary)] hover:bg-emerald-500/10 hover:text-emerald-500 border border-[var(--border-subtle)] text-[11px] font-medium text-[var(--text-secondary)] transition"
                title="Start full focus timer"
              >
                <Play className="w-3 h-3" />
                <span>Focus</span>
              </button>

              {/* Feature 7: Auto-Splitter */}
              <button
                onClick={() => openAutoSplitModal(task)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition"
                title="Break this task into smaller steps"
              >
                <Split className="w-3 h-3" />
                <span className="hidden sm:inline">Split</span>
              </button>

              {/* Feature 4: Snooze with a Reason */}
              <button
                onClick={() => openSnoozeModal(task)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition"
                title="Snooze task and log reason"
              >
                <Clock className="w-3 h-3" />
                <span>Snooze</span>
              </button>
            </div>

            {/* Quick Rule of 3 Slot Allocation Controls */}
            <div className="flex items-center gap-1">
              {task.status !== 'today_main' && (
                <button
                  onClick={() => assignStatus(task.id, 'today_main')}
                  className="px-2 py-1 rounded-lg text-[10px] font-medium bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-emerald-500 hover:border-emerald-500/30 border border-transparent transition"
                  title="Promote to Today's Main 3"
                >
                  → Main
                </button>
              )}
              {task.status !== 'today_bonus' && (
                <button
                  onClick={() => assignStatus(task.id, 'today_bonus')}
                  className="px-2 py-1 rounded-lg text-[10px] font-medium bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-amber-500 hover:border-amber-500/30 border border-transparent transition"
                  title="Promote to Today's Bonus"
                >
                  → Bonus
                </button>
              )}
              {task.status !== 'inbox' && (
                <button
                  onClick={() => assignStatus(task.id, 'inbox')}
                  className="px-2 py-1 rounded-lg text-[10px] font-medium bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
                  title="Move to Backlog / Inbox"
                >
                  → Inbox
                </button>
              )}
            </div>
          </div>
        )}

        {/* Subtasks Accordion Toggle */}
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="mt-2.5 pt-2 border-t border-[var(--border-subtle)]">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium"
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
              <span>
                {task.subtasks.filter((st) => st.completed).length} / {task.subtasks.length} subtasks
              </span>
            </button>
          </div>
        )}

        {/* Expanded Subtasks List */}
        {isExpanded && (
          <div className="mt-2.5 pl-2 space-y-1.5">
            {task.subtasks?.map((subtask) => (
              <div
                key={subtask.id}
                className="flex items-center justify-between gap-2 group/sub p-1 rounded-lg hover:bg-[var(--bg-secondary)]"
              >
                <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={subtask.completed}
                    onChange={() => toggleSubtask(task.id, subtask.id)}
                    className="rounded border-[var(--border-strong)] text-emerald-500 focus:ring-0 w-3.5 h-3.5"
                  />
                  <span
                    className={`text-xs break-words ${
                      subtask.completed
                        ? 'line-through text-[var(--text-muted)]'
                        : 'text-[var(--text-primary)]'
                    }`}
                  >
                    {subtask.title}
                  </span>
                </label>

                <button
                  onClick={() => deleteSubtask(task.id, subtask.id)}
                  className="opacity-0 group-hover/sub:opacity-100 p-0.5 text-[var(--text-muted)] hover:text-rose-500 transition"
                  title="Remove subtask"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}

            {/* Add Subtask Input */}
            <form onSubmit={handleAddSubtaskSubmit} className="mt-2 pt-1 flex items-center gap-1.5">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="+ Add subtask (press Enter)"
                className="flex-1 px-2.5 py-1 text-xs rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-emerald-500/50"
              />
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
