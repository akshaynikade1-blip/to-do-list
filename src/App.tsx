import React, { useEffect } from 'react';
import { Header } from './components/layout/Header';
import { NavigationTabs } from './components/layout/NavigationTabs';
import { FilterBar } from './components/layout/FilterBar';
import { RuleOfThreeSection } from './components/tasks/RuleOfThreeSection';
import { TaskList } from './components/tasks/TaskList';
import { WinsTimeline } from './components/timeline/WinsTimeline';
import { InsightsView } from './components/insights/InsightsView';
import { ActiveTimerPill } from './components/timer/ActiveTimerPill';

// Modals
import { TaskModal } from './components/modals/TaskModal';
import { EnergyPickerModal } from './components/modals/EnergyPickerModal';
import { SwapTaskModal } from './components/modals/SwapTaskModal';
import { DecayTriageModal } from './components/modals/DecayTriageModal';
import { SnoozeModal } from './components/modals/SnoozeModal';
import { AutoSplitModal } from './components/modals/AutoSplitModal';
import { JustFiveMinutesPromptModal } from './components/modals/JustFiveMinutesPromptModal';
import { DependencyGraphModal } from './components/modals/DependencyGraphModal';
import { ImportExportModal } from './components/modals/ImportExportModal';
import { CommandPalette } from './components/command/CommandPalette';

import { useTaskStore } from './stores/useTaskStore';
import { useUIStore } from './stores/useUIStore';
import { useThemeStore } from './stores/useThemeStore';

export function App() {
  const { init, isLoading } = useTaskStore();
  const { activeTab } = useUIStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    // Initialize Dexie local database & seed data
    init();

    // Set initial theme class
    const savedTheme = localStorage.getItem('momentum_theme') || 'dark';
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [init]);

  return (
    <div className={`min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-200 pb-28 ${theme}`}>
      {/* Top Header */}
      <Header />

      {/* Main Content Shell */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Navigation Tabs */}
        <NavigationTabs />

        {/* Filter Bar (Active on All Tasks and Today view) */}
        {(activeTab === 'all' || activeTab === 'today') && <FilterBar />}

        {/* View Switcher */}
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 mx-auto border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <div className="text-xs font-mono text-[var(--text-muted)]">
              Hydrating local-first workspace...
            </div>
          </div>
        ) : (
          <div>
            {activeTab === 'today' && <RuleOfThreeSection />}
            {activeTab === 'all' && <TaskList />}
            {activeTab === 'timeline' && <WinsTimeline />}
            {activeTab === 'insights' && <InsightsView />}
          </div>
        )}
      </main>

      {/* Floating Active Focus Timer Bar */}
      <ActiveTimerPill />

      {/* Global Interactive Modals */}
      <TaskModal />
      <EnergyPickerModal />
      <SwapTaskModal />
      <DecayTriageModal />
      <SnoozeModal />
      <AutoSplitModal />
      <JustFiveMinutesPromptModal />
      <DependencyGraphModal />
      <ImportExportModal />
      <CommandPalette />
    </div>
  );
}

export default App;
