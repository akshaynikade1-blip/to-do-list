import React from 'react';
import {
  Sparkles,
  Plus,
  Flame,
  Shield,
  Sun,
  Moon,
  Command,
  Compass,
  GitBranch,
  FileDown
} from 'lucide-react';
import { useTaskStore } from '../../stores/useTaskStore';
import { useUIStore } from '../../stores/useUIStore';
import { useThemeStore } from '../../stores/useThemeStore';
import { useTimerStore } from '../../stores/useTimerStore';
import { formatSecondsToTimer } from '../../utils/formatters';

export const Header: React.FC = () => {
  const { userStats } = useTaskStore();
  const {
    openTaskModal,
    openEnergyPicker,
    openDependencyGraph,
    openImportExport,
    setCommandPaletteOpen
  } = useUIStore();
  const { theme, toggleTheme } = useThemeStore();
  const { isRunning, secondsRemaining, activeTaskTitle, mode } = useTimerStore();

  const streak = userStats?.streakCount || 1;
  const hasGraceShield = userStats?.missedGraceDays === 0;

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]/80 backdrop-blur-md transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-[var(--text-primary)]">
                Momentum
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20">
                Zen
              </span>
            </div>
          </div>
        </div>

        {/* Center: Running Timer Banner (if active) */}
        {isRunning && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-mono font-medium">
              {mode === 'just_5_minutes' ? '5m Sprint:' : 'Focus:'} {formatSecondsToTimer(secondsRemaining)}
            </span>
            <span className="text-xs max-w-[140px] truncate text-[var(--text-secondary)]">
              {activeTaskTitle}
            </span>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* "What should I do right now?" Button */}
          <button
            onClick={openEnergyPicker}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-medium shadow-sm transition-all hover:shadow hover:scale-[1.02] active:scale-[0.98]"
            title="Energy-based smart suggestion"
          >
            <Compass className="w-4 h-4" />
            <span className="hidden sm:inline">What should I do right now?</span>
            <span className="sm:hidden">Suggest</span>
          </button>

          {/* Forgiving Streak Badge */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-primary)]"
            title={
              hasGraceShield
                ? `${streak}-day streak! Grace Shield active (1 skip allowed without resetting).`
                : `${streak}-day streak! Grace Shield used.`
            }
          >
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="font-mono font-semibold">{streak}d</span>
            {hasGraceShield && (
              <span title="Grace Shield Active">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
              </span>
            )}
          </div>

          {/* Dependency Graph Modal Trigger */}
          <button
            onClick={openDependencyGraph}
            className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] border border-transparent hover:border-[var(--border-subtle)] transition"
            title="Dependency Graph View"
            aria-label="View task dependencies"
          >
            <GitBranch className="w-4 h-4" />
          </button>

          {/* Backup / Export Trigger */}
          <button
            onClick={openImportExport}
            className="hidden sm:flex p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] border border-transparent hover:border-[var(--border-subtle)] transition"
            title="Import / Export Data"
            aria-label="Import or export data"
          >
            <FileDown className="w-4 h-4" />
          </button>

          {/* Command Palette Trigger */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] transition"
            title="Command Palette (Ctrl+K)"
          >
            <Command className="w-3.5 h-3.5" />
            <span className="font-mono text-[11px]">K</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] border border-transparent hover:border-[var(--border-subtle)] transition"
            title={theme === 'dark' ? 'Switch to Washi Paper (Light)' : 'Switch to Kyoto Night (Dark)'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Add Task Primary Button */}
          <button
            onClick={() => openTaskModal(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-90 text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Task</span>
          </button>
        </div>
      </div>
    </header>
  );
};
