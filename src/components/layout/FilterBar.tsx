import React from 'react';
import { Search, X, Folder, Zap } from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';
import { useTaskStore } from '../../stores/useTaskStore';

export const FilterBar: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    selectedProjectId,
    setSelectedProjectId,
    selectedEnergy,
    setSelectedEnergy,
    selectedTag,
    setSelectedTag
  } = useUIStore();
  const { projects, tasks } = useTaskStore();

  // Extract all unique tags
  const allTags = Array.from(
    new Set(tasks.flatMap((t) => t.tags || []))
  ).filter(Boolean);

  const hasActiveFilters =
    searchQuery || selectedProjectId || selectedEnergy !== 'all' || selectedTag;

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedProjectId(null);
    setSelectedEnergy('all');
    setSelectedTag(null);
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 py-2">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tasks, descriptions, or tags..."
          className="w-full pl-9 pr-8 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-emerald-500/50 transition"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
        {/* Project Selector */}
        <select
          value={selectedProjectId || ''}
          onChange={(e) => setSelectedProjectId(e.target.value || null)}
          className="px-2.5 py-1.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-emerald-500/50 transition cursor-pointer"
        >
          <option value="">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {/* Energy Filter */}
        <div className="flex items-center bg-[var(--bg-secondary)] p-0.5 rounded-xl border border-[var(--border-subtle)]">
          {(['all', 'low', 'medium', 'high'] as const).map((lvl) => {
            const isSelected = selectedEnergy === lvl;
            const labels = {
              all: 'All',
              low: '☕ Low',
              medium: '⚡ Med',
              high: '🚀 High'
            };
            return (
              <button
                key={lvl}
                onClick={() => setSelectedEnergy(lvl)}
                className={`px-2 py-1 rounded-lg text-[11px] font-medium transition ${
                  isSelected
                    ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-xs font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {labels[lvl]}
              </button>
            );
          })}
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-[11px] text-[var(--accent-rose)] hover:bg-[var(--accent-rose)]/10 transition"
            title="Clear all filters"
          >
            <X className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};
