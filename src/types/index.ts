export type EnergyLevel = 'low' | 'medium' | 'high';

export type SnoozeReason = 
  | 'too_big' 
  | 'not_in_mood' 
  | 'waiting_on_someone' 
  | 'forgot' 
  | 'not_important';

export type TaskStatus = 'inbox' | 'today_main' | 'today_bonus' | 'completed' | 'archived';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  estimatedMinutes?: number;
}

export interface SnoozeRecord {
  timestamp: number;
  reason: SnoozeReason;
  notes?: string;
  rescheduledTo?: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  projectId?: string;
  tags: string[];
  
  // Status & Priority
  status: TaskStatus;
  order: number;
  
  // Energy & Estimation
  energyLevel: EnergyLevel; // 'low' | 'medium' | 'high'
  estimatedMinutes: number; // e.g. 15, 30, 45, 60
  actualMinutesSpent: number; // accumulated focus minutes
  
  // Dates & Decay
  createdAt: number;
  updatedAt: number;
  lastInteractedAt: number; // timestamp used for visual decay calculations
  dueDate?: number; // timestamp
  completedAt?: number; // timestamp
  
  // Dependency DAG
  blockedByTaskIds: string[]; // IDs of tasks that must be completed first
  
  // Subtasks
  subtasks: Subtask[];
  
  // Procrastination Tracking
  snoozeHistory: SnoozeRecord[];
  
  // Decay triage flag
  decayDismissedAt?: number;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  icon?: string;
  order: number;
}

export interface FocusSession {
  id: string;
  taskId: string;
  taskTitle: string;
  startedAt: number;
  endedAt: number;
  durationMinutes: number;
  mode: 'standard' | 'just_5_minutes';
  completedTask: boolean;
}

export interface UserStats {
  id: string; // 'current_user'
  streakCount: number;
  lastActiveDate: string; // 'YYYY-MM-DD'
  missedGraceDays: number; // 0 or 1 (allow 1 skip day without streak reset)
  totalFocusMinutes: number;
  totalCompletedTasks: number;
  historicalMultiplier: number; // actualMinutes / estimatedMinutes
}

export interface DecayStatus {
  ageDays: number;
  stage: 'fresh' | 'aging' | 'wilting' | 'critical';
  opacity: number;
  label: string;
  requiresTriage: boolean;
}
