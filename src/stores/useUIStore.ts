import { create } from 'zustand';
import type { Task, TaskStatus } from '../types';

export type MainViewTab = 'today' | 'all' | 'timeline' | 'insights';

interface UIState {
  activeTab: MainViewTab;
  setActiveTab: (tab: MainViewTab) => void;

  // Search & Filtering
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
  selectedEnergy: 'all' | 'low' | 'medium' | 'high';
  setSelectedEnergy: (e: 'all' | 'low' | 'medium' | 'high') => void;

  // Task Form Modal
  isTaskModalOpen: boolean;
  editingTask: Partial<Task> | null;
  openTaskModal: (task?: Partial<Task> | null) => void;
  closeTaskModal: () => void;

  // "What should I do right now?" Energy Picker Modal
  isEnergyPickerOpen: boolean;
  openEnergyPicker: () => void;
  closeEnergyPicker: () => void;

  // Rule of 3 Swap Modal
  isSwapModalOpen: boolean;
  swapContext: {
    targetTaskId: string;
    targetStatus: TaskStatus;
    currentMainTasks: Task[];
    currentBonusTasks: Task[];
  } | null;
  openSwapModal: (context: {
    targetTaskId: string;
    targetStatus: TaskStatus;
    currentMainTasks: Task[];
    currentBonusTasks: Task[];
  }) => void;
  closeSwapModal: () => void;

  // Decay 7-Day Triage Modal
  isDecayTriageOpen: boolean;
  decayTask: Task | null;
  openDecayTriage: (task: Task) => void;
  closeDecayTriage: () => void;

  // Snooze with a Reason Modal
  isSnoozeModalOpen: boolean;
  snoozeTask: Task | null;
  openSnoozeModal: (task: Task) => void;
  closeSnoozeModal: () => void;

  // Auto-Splitter Modal
  isAutoSplitModalOpen: boolean;
  autoSplitTask: Task | null;
  openAutoSplitModal: (task: Task) => void;
  closeAutoSplitModal: () => void;

  // Dependency Graph Modal
  isDependencyGraphOpen: boolean;
  openDependencyGraph: () => void;
  closeDependencyGraph: () => void;

  // "Just 5 Minutes" Sprint End Prompt Modal
  isJust5MinPromptOpen: boolean;
  completed5MinTaskId: string | null;
  openJust5MinPrompt: (taskId: string) => void;
  closeJust5MinPrompt: () => void;

  // Command Palette
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  // Import / Export Modal
  isImportExportOpen: boolean;
  openImportExport: () => void;
  closeImportExport: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeTab: 'today',
  setActiveTab: (activeTab) => set({ activeTab }),

  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  selectedProjectId: null,
  setSelectedProjectId: (selectedProjectId) => set({ selectedProjectId }),
  selectedTag: null,
  setSelectedTag: (selectedTag) => set({ selectedTag }),
  selectedEnergy: 'all',
  setSelectedEnergy: (selectedEnergy) => set({ selectedEnergy }),

  isTaskModalOpen: false,
  editingTask: null,
  openTaskModal: (editingTask = null) => set({ isTaskModalOpen: true, editingTask }),
  closeTaskModal: () => set({ isTaskModalOpen: false, editingTask: null }),

  isEnergyPickerOpen: false,
  openEnergyPicker: () => set({ isEnergyPickerOpen: true }),
  closeEnergyPicker: () => set({ isEnergyPickerOpen: false }),

  isSwapModalOpen: false,
  swapContext: null,
  openSwapModal: (swapContext) => set({ isSwapModalOpen: true, swapContext }),
  closeSwapModal: () => set({ isSwapModalOpen: false, swapContext: null }),

  isDecayTriageOpen: false,
  decayTask: null,
  openDecayTriage: (decayTask) => set({ isDecayTriageOpen: true, decayTask }),
  closeDecayTriage: () => set({ isDecayTriageOpen: false, decayTask: null }),

  isSnoozeModalOpen: false,
  snoozeTask: null,
  openSnoozeModal: (snoozeTask) => set({ isSnoozeModalOpen: true, snoozeTask }),
  closeSnoozeModal: () => set({ isSnoozeModalOpen: false, snoozeTask: null }),

  isAutoSplitModalOpen: false,
  autoSplitTask: null,
  openAutoSplitModal: (autoSplitTask) => set({ isAutoSplitModalOpen: true, autoSplitTask }),
  closeAutoSplitModal: () => set({ isAutoSplitModalOpen: false, autoSplitTask: null }),

  isDependencyGraphOpen: false,
  openDependencyGraph: () => set({ isDependencyGraphOpen: true }),
  closeDependencyGraph: () => set({ isDependencyGraphOpen: false }),

  isJust5MinPromptOpen: false,
  completed5MinTaskId: null,
  openJust5MinPrompt: (taskId) =>
    set({ isJust5MinPromptOpen: true, completed5MinTaskId: taskId }),
  closeJust5MinPrompt: () =>
    set({ isJust5MinPromptOpen: false, completed5MinTaskId: null }),

  isCommandPaletteOpen: false,
  setCommandPaletteOpen: (isCommandPaletteOpen) => set({ isCommandPaletteOpen }),

  isImportExportOpen: false,
  openImportExport: () => set({ isImportExportOpen: true }),
  closeImportExport: () => set({ isImportExportOpen: false })
}));
