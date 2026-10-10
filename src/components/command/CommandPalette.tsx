import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Plus,
  Compass,
  Calendar,
  CheckCircle2,
  BarChart2,
  GitBranch,
  FileDown,
  Sun,
  Moon,
  ArrowRight,
  Zap,
  Play
} from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';
import { useTaskStore } from '../../stores/useTaskStore';
import { useThemeStore } from '../../stores/useThemeStore';
import { useTimerStore } from '../../stores/useTimerStore';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    setActiveTab,
    openTaskModal,
    openEnergyPicker,
    openDependencyGraph,
    openImportExport
  } = useUIStore();

  const { tasks } = useTaskStore();
  const { toggleTheme, theme } = useThemeStore();
  const { startTimer } = useTimerStore();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      } else if (e.key === 'Escape' && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  // Base navigation and action items
  const baseActions = [
    {
      id: 'create-task',
      title: 'Create new task',
      category: 'Actions',
      icon: Plus,
      shortcut: 'C',
      action: () => openTaskModal()
    },
    {
      id: 'what-should-i-do',
      title: 'What should I do right now? (Energy Matcher)',
      category: 'Actions',
      icon: Compass,
      shortcut: 'W',
      action: () => openEnergyPicker()
    },
    {
      id: 'nav-today',
      title: 'View Today (Rule of 3 slots)',
      category: 'Navigation',
      icon: Calendar,
      shortcut: '1',
      action: () => setActiveTab('today')
    },
    {
      id: 'nav-all',
      title: 'View All Tasks & Backlog',
      category: 'Navigation',
      icon: Search,
      shortcut: '2',
      action: () => setActiveTab('all')
    },
    {
      id: 'nav-timeline',
      title: 'View Wins Timeline Journal',
      category: 'Navigation',
      icon: CheckCircle2,
      shortcut: '3',
      action: () => setActiveTab('timeline')
    },
    {
      id: 'nav-insights',
      title: 'View Procrastination & Multiplier Insights',
      category: 'Navigation',
      icon: BarChart2,
      shortcut: '4',
      action: () => setActiveTab('insights')
    },
    {
      id: 'view-graph',
      title: 'View Dependency Graph',
      category: 'Navigation',
      icon: GitBranch,
      shortcut: 'G',
      action: () => openDependencyGraph()
    },
    {
      id: 'toggle-theme',
      title: `Toggle Theme (${theme === 'dark' ? 'Washi Light' : 'Kyoto Dark'})`,
      category: 'Settings',
      icon: theme === 'dark' ? Sun : Moon,
      shortcut: 'T',
      action: () => toggleTheme()
    },
    {
      id: 'backup-data',
      title: 'Backup & Restore Local Data (JSON)',
      category: 'Settings',
      icon: FileDown,
      shortcut: 'B',
      action: () => openImportExport()
    }
  ];

  // Task search items
  const taskItems = tasks
    .filter((t) => t.status !== 'completed')
    .map((t) => ({
      id: `task-${t.id}`,
      title: `Focus: ${t.title}`,
      category: 'Tasks',
      icon: Play,
      shortcut: `${t.estimatedMinutes}m`,
      action: () => startTimer(t, 'standard')
    }));

  const allItems = [...baseActions, ...taskItems];

  const filteredItems = query.trim()
    ? allItems.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())
      )
    : baseActions;

  const handleSelect = (index: number) => {
    const item = filteredItems[index];
    if (item) {
      setCommandPaletteOpen(false);
      item.action();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSelect(selectedIndex);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={() => setCommandPaletteOpen(false)}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-[var(--bg-card)] border border-[var(--border-strong)] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[var(--border-subtle)] gap-3 bg-[var(--bg-card)]">
          <Search className="w-4 h-4 text-emerald-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search tasks..."
            className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
          />
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[10px] font-mono text-[var(--text-muted)]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, idx) => {
              const isSelected = selectedIndex === idx;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(idx)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs transition ${
                    isSelected
                      ? 'bg-emerald-500/10 text-emerald-500 font-semibold'
                      : 'text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-500' : 'text-[var(--text-muted)]'}`} />
                    <span className="truncate">{item.title}</span>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">
                      {item.category}
                    </span>
                    {item.shortcut && (
                      <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[10px] font-mono text-[var(--text-muted)]">
                        {item.shortcut}
                      </kbd>
                    )}
                  </div>
                </button>
              );
            })
          ) : (
            <div className="py-8 text-center text-xs text-[var(--text-muted)]">
              No matching commands or tasks found.
            </div>
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-4 py-2 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[10px] text-[var(--text-muted)] flex items-center justify-between">
          <span>Navigate: ↑ ↓</span>
          <span>Select: ↵</span>
          <span>Close: ESC</span>
        </div>
      </div>
    </div>
  );
};
