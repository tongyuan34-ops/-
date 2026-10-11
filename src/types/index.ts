export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export type StrictnessLevel = 'gentle' | 'standard' | 'strict';
export type StudyCycleMode = 'single' | 'pomodoro';

export interface DeskNote {
  id: string;
  content: string;
  updatedAt: number;
}

export interface StudyPlanItem {
  id: string;
  title: string;
  minutes: number;
  completed: boolean;
  tag: string;
}

export interface StudySession {
  id: string;
  taskTitle: string;
  subject: string;
  plannedMinutes: number;
  actualMinutes: number;
  startTime: number;
  endTime: number;
  isEarlyUnlock: boolean;
  unlockReason?: string;
  distractionWarnings: number;
  strictness: StrictnessLevel;
  cycleMode: StudyCycleMode;
  notes?: string;
  aiReport?: AISummaryReport;
  userReflection?: string;
}

export interface AISummaryReport {
  zenScore: number;
  evalGrade: string;
  comment: string;
  distractionAdvice: string;
  cycleReview: string;
  motto: string;
}

export interface CycleStats {
  todayMinutes: number;
  weekTotalMinutes: number;
  monthTotalMinutes: number;
  streakDays: number;
  totalSessions: number;
  distractionPreventedCount: number;
  history: StudySession[];
}

export type AmbientSoundType = 'none' | 'rain' | 'temple_bell' | 'white_noise' | 'library_clock' | 'fireplace';
