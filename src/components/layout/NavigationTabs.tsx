import React from 'react';
import { Target, CheckCircle2, BarChart2, Layers } from 'lucide-react';
import { useUIStore, type MainViewTab } from '../../stores/useUIStore';
import { useTaskStore } from '../../stores/useTaskStore';

export const NavigationTabs: React.FC = () => {
  const { activeTab, setActiveTab } = useUIStore();
  const { tasks } = useTaskStore();

  const todayCount = tasks.filter(
    (t) => (t.status === 'today_main' || t.status === 'today_bonus')
  ).length;

  const allActiveCount = tasks.filter(
    (t) => t.status !== 'completed' && t.status !== 'archived'
  ).length;

  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  const tabs: Array<{
    id: MainViewTab;
    label: string;
    icon: React.ElementType;
    badge?: number;
  }> = [
    { id: 'today', label: 'Today (Rule of 3)', icon: Target, badge: todayCount },
    { id: 'all', label: 'All Tasks', icon: Layers, badge: allActiveCount },
    { id: 'timeline', label: 'Wins Timeline', icon: CheckCircle2, badge: completedCount },
    { id: 'insights', label: 'Procrastination & Insights', icon: BarChart2 }
  ];

  return (
    <nav className="flex items-center gap-1 p-1 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] overflow-x-auto" aria-label="Main navigation">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 ${
              isActive
                ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm font-semibold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]/50'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-500' : ''}`} />
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-500 font-bold'
                    : 'bg-[var(--border-subtle)] text-[var(--text-muted)]'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
