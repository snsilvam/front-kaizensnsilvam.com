// Contrato esperado de /kaizen-habits.

export interface KaizenHabit {
  id: string;
  userId: string;
  name: string;
  description: string;
  identity: string;
  cue: string;
  attractiveness: string;
  action: string;
  minimumAction2min: string;
  reward: string;
  time: string;
  location: string;
  /** Zona horaria IANA usada para calcular el dia contable del habito. */
  timezone: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface KaizenHabitRepetition {
  id: string;
  habitId: string;
  /** Dia contable en formato YYYY-MM-DD. */
  occurredOn: string;
  /** Instante real de registro en ISO 8601. */
  registeredAt: string;
  isMinimum: boolean;
  description: string;
}

export interface KaizenHabitCalendarDay {
  date: string;
  repetitionId?: string;
  hasRepetition: boolean;
  isMinimum: boolean;
  description: string;
  registeredAt?: string;
}

export interface KaizenHabitCalendar {
  habitId: string;
  from: string;
  to: string;
  days: KaizenHabitCalendarDay[];
}

export interface KaizenHabitGoal {
  id: string;
  habitId: string;
  targetRepetitions: number;
  active: boolean;
  startedOn: string;
  completedAt: string | null;
}

export interface KaizenHabitGoalProgress {
  id: string;
  targetRepetitions: number;
  progressRepetitions: number;
  completed: boolean;
}

export interface KaizenHabitStats {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  totalRepetitions: number;
  minimumRepetitions: number;
  completeRepetitions: number;
  activeGoal: KaizenHabitGoalProgress | null;
}
