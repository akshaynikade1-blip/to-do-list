import React, { useState, useEffect } from 'react';
import { X, Clock, Zap, Tag, Calendar, Lock, AlertCircle } from 'lucide-react';
import type { Task, EnergyLevel, TaskStatus } from '../../types';
import { useTaskStore } from '../../stores/useTaskStore';
import { useUIStore } from '../../stores/useUIStore';
import { wouldCreateDependencyCycle } from '../../core/dependencyGraph';

export const TaskModal: React.FC = () => {
  const { isTaskModalOpen, editingTask, closeTaskModal } = useUIStore();
  const { tasks, projects, addTask, updateTask, addProject } = useTaskStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState<string>('');
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>('medium');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(25);
  const [status, setStatus] = useState<TaskStatus>('inbox');
  const [tagsString, setTagsString] = useState('');
  const [dueDateStr, setDueDateStr] = useState('');
  const [selectedBlockerIds, setSelectedBlockerIds] = useState<string[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title || '');
      setDescription(editingTask.description || '');
      setProjectId(editingTask.projectId || '');
      setEnergyLevel(editingTask.energyLevel || 'medium');
      setEstimatedMinutes(editingTask.estimatedMinutes || 25);
      setStatus(editingTask.status || 'inbox');
      setTagsString(editingTask.tags?.join(', ') || '');
      setDueDateStr(
        editingTask.dueDate
          ? new Date(editingTask.dueDate).toISOString().split('T')[0]
          : ''
      );
      setSelectedBlockerIds(editingTask.blockedByTaskIds || []);
    } else {
      setTitle('');
      setDescription('');
      setProjectId(projects[0]?.id || '');
      setEnergyLevel('medium');
      setEstimatedMinutes(25);
      setStatus('inbox');
      setTagsString('');
      setDueDateStr('');
      setSelectedBlockerIds([]);
    }
    setErrorMessage('');
    setIsCreatingProject(false);
  }, [editingTask, isTaskModalOpen, projects]);

  if (!isTaskModalOpen) return null;

  const handleToggleBlocker = (blockerId: string) => {
    if (editingTask?.id && wouldCreateDependencyCycle(tasks, blockerId, editingTask.id)) {
      setErrorMessage('Cannot select this task: it would create a circular dependency loop!');
      return;
    }
    setErrorMessage('');
    setSelectedBlockerIds((prev) =>
      prev.includes(blockerId)
        ? prev.filter((id) => id !== blockerId)
        : [...prev, blockerId]
    );
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    const colors = ['#10B981', '#6366F1', '#F59E0B', '#EC4899', '#3B82F6'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const proj = await addProject(newProjectName.trim(), randomColor);
    setProjectId(proj.id);
    setNewProjectName('');
    setIsCreatingProject(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Task title is required.');
      return;
    }

    const tags = tagsString
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const dueDate = dueDateStr ? new Date(dueDateStr).getTime() : undefined;

    if (editingTask && editingTask.id) {
      await updateTask(editingTask.id, {
        title: title.trim(),
        description: description.trim(),
        projectId: projectId || undefined,
        energyLevel,
        estimatedMinutes: Number(estimatedMinutes),
        status,
        tags,
        dueDate,
        blockedByTaskIds: selectedBlockerIds
      });
    } else {
      await addTask({
        title: title.trim(),
        description: description.trim(),
        projectId: projectId || undefined,
        energyLevel,
        estimatedMinutes: Number(estimatedMinutes),
        status,
        tags,
        dueDate,
        blockedByTaskIds: selectedBlockerIds
      });
    }

    closeTaskModal();
  };

  // Other tasks available as blockers
  const eligibleBlockers = tasks.filter(
    (t) =>
      t.status !== 'completed' &&
      (!editingTask?.id || t.id !== editingTask.id)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <h2 className="text-base font-bold text-[var(--text-primary)]">
            {editingTask ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={closeTaskModal}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Architect offline-first sync engine..."
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-emerald-500/60"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add key context, links, or notes..."
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-emerald-500/60 resize-none"
            />
          </div>

          {/* Energy & Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Energy Level */}
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Required Energy
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                {(['low', 'medium', 'high'] as const).map((lvl) => {
                  const isSelected = energyLevel === lvl;
                  const icons = { low: '☕ Low', medium: '⚡ Med', high: '🚀 High' };
                  return (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => setEnergyLevel(lvl)}
                      className={`py-1.5 rounded-lg text-xs font-medium text-center transition ${
                        isSelected
                          ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-xs font-bold'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {icons[lvl]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Estimated Minutes */}
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 flex items-center justify-between">
                <span>Time Estimate</span>
                <span className="font-mono text-emerald-500 font-bold">{estimatedMinutes} min</span>
              </label>
              <div className="flex items-center gap-1.5">
                {[15, 25, 45, 60].map((mins) => (
                  <button
                    type="button"
                    key={mins}
                    onClick={() => setEstimatedMinutes(mins)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono transition border ${
                      estimatedMinutes === mins
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-500 font-bold'
                        : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Status & Project */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Placement
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-emerald-500/60"
              >
                <option value="inbox">Inbox / Backlog</option>
                <option value="today_main">Today — Main Focus (3 max)</option>
                <option value="today_bonus">Today — Bonus (2 max)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Project
              </label>
              <div className="flex items-center gap-1.5">
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-emerald-500/60"
                >
                  <option value="">No Project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setIsCreatingProject(!isCreatingProject)}
                  className="px-2.5 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  title="Add project"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* New Project Inline Input */}
          {isCreatingProject && (
            <div className="p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center gap-2">
              <input
                type="text"
                placeholder="New project name..."
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="flex-1 px-2.5 py-1 text-xs rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
              />
              <button
                type="button"
                onClick={handleCreateProject}
                className="px-3 py-1 rounded-lg bg-emerald-500 text-white text-xs font-medium"
              >
                Save
              </button>
            </div>
          )}

          {/* Due Date & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDateStr}
                onChange={(e) => setDueDateStr(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-emerald-500/60"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tagsString}
                onChange={(e) => setTagsString(e.target.value)}
                placeholder="DeepWork, Writing, Urgent"
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-emerald-500/60"
              />
            </div>
          </div>

          {/* Feature 9: Dependency Links (Blocked By) */}
          {eligibleBlockers.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                <span>Blocked By Other Tasks (Dependency Locks)</span>
              </label>
              <p className="text-[11px] text-[var(--text-muted)] mb-2">
                This task will remain locked until all selected blocker tasks are completed.
              </p>
              <div className="max-h-28 overflow-y-auto space-y-1 p-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                {eligibleBlockers.map((bTask) => {
                  const isChecked = selectedBlockerIds.includes(bTask.id);
                  return (
                    <label
                      key={bTask.id}
                      className="flex items-center gap-2 p-1 rounded-lg hover:bg-[var(--bg-card)] cursor-pointer text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleBlocker(bTask.id)}
                        className="rounded border-[var(--border-strong)] text-emerald-500"
                      />
                      <span className="truncate text-[var(--text-primary)]">
                        {bTask.title}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer Submit */}
          <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeTaskModal}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-xs transition"
            >
              {editingTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
