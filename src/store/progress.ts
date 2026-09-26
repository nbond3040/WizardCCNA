/**
 * All learner progress, persisted to localStorage. Everything is local — no account needed.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { today } from '../lib/date';
import type { ExamVersion } from '../content/curriculum';
import { nextState, type CardState, type Grade } from '../features/flashcards/srs';

export interface LessonProgress {
  slide: number;
  maxSlide: number;
  total: number;
  /** Date the deck was finished — unlocks the lesson's flashcards. */
  deckDoneAt?: string;
  quiz?: { best: number; last: number; attempts: number; lastAt: string; passedAt?: string };
}

export interface QuestionStat {
  seen: number;
  correct: number;
  lastCorrect: boolean;
  lastAt: string;
}

export type ExamKind = 'full' | 'custom' | 'domain' | 'module' | 'missed' | 'lesson';

export interface ExamRecord {
  id: string;
  kind: ExamKind;
  title: string;
  version: ExamVersion;
  mode: 'exam' | 'study';
  startedAt: string;
  finishedAt: string;
  date: string;
  durationSec: number;
  total: number;
  correct: number;
  /** Partial credit sum (drag-and-drop items can be partially right). */
  points: number;
  percent: number;
  /** Scaled 300–1000 like Cisco's score report. */
  scaled: number;
  byDomain: Record<number, { total: number; points: number }>;
  items: { key: string; points: number; response: unknown }[];
  moduleId?: string;
}

export interface LabProgress {
  startedAt?: string;
  completedAt?: string;
  tasksDone: string[];
}

export interface PlanSettings {
  goalDate: string;
  startDate: string;
  version: 'auto' | ExamVersion;
  /** Weekdays (0 = Sunday) the learner studies. */
  studyDays: number[];
  /** Fixed daily budget, or null to let the planner compute the pace. */
  dailyMinutes: number | null;
  experience: 'new' | 'some' | 'experienced';
  createdAt: string;
}

export interface DayActivity {
  minutes: number;
  cards: number;
  questions: number;
}

interface ProgressState {
  lessons: Record<string, LessonProgress>;
  cards: Record<string, CardState>;
  missedCards: string[];
  questions: Record<string, QuestionStat>;
  missedQuestions: string[];
  exams: ExamRecord[];
  labs: Record<string, LabProgress>;
  plan: PlanSettings | null;
  activity: Record<string, DayActivity>;

  setSlide: (lessonId: string, index: number, total: number) => void;
  completeDeck: (lessonId: string, total: number) => void;
  recordQuiz: (lessonId: string, correct: number, total: number) => void;
  reviewCard: (key: string, grade: Grade) => void;
  recordAnswer: (key: string, correct: boolean) => void;
  addExam: (rec: ExamRecord) => void;
  deleteExam: (id: string) => void;
  setLabTasks: (labId: string, tasksDone: string[], complete: boolean) => void;
  resetLab: (labId: string) => void;
  setPlan: (plan: PlanSettings | null) => void;
  logMinutes: (minutes: number) => void;
  resetAll: () => void;
  importState: (data: Partial<ProgressState>) => void;
}

const empty = {
  lessons: {},
  cards: {},
  missedCards: [],
  questions: {},
  missedQuestions: [],
  exams: [],
  labs: {},
  plan: null,
  activity: {},
};

function bump(activity: Record<string, DayActivity>, patch: Partial<DayActivity>): Record<string, DayActivity> {
  const d = today();
  const cur = activity[d] ?? { minutes: 0, cards: 0, questions: 0 };
  return {
    ...activity,
    [d]: {
      minutes: cur.minutes + (patch.minutes ?? 0),
      cards: cur.cards + (patch.cards ?? 0),
      questions: cur.questions + (patch.questions ?? 0),
    },
  };
}

export const QUIZ_PASS = 0.8;

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      ...empty,

      setSlide: (lessonId, index, total) =>
        set((s) => {
          const cur = s.lessons[lessonId] ?? { slide: 0, maxSlide: 0, total };
          const maxSlide = Math.max(cur.maxSlide, index);
          const done = cur.deckDoneAt ?? (maxSlide >= total - 1 ? today() : undefined);
          return { lessons: { ...s.lessons, [lessonId]: { ...cur, slide: index, maxSlide, total, deckDoneAt: done } } };
        }),

      completeDeck: (lessonId, total) =>
        set((s) => {
          const cur = s.lessons[lessonId] ?? { slide: 0, maxSlide: 0, total };
          return {
            lessons: {
              ...s.lessons,
              [lessonId]: { ...cur, maxSlide: total - 1, total, deckDoneAt: cur.deckDoneAt ?? today() },
            },
          };
        }),

      recordQuiz: (lessonId, correct, total) =>
        set((s) => {
          const cur = s.lessons[lessonId] ?? { slide: 0, maxSlide: 0, total: 0 };
          const pct = total ? correct / total : 0;
          const q = cur.quiz;
          const quiz = {
            best: Math.max(q?.best ?? 0, pct),
            last: pct,
            attempts: (q?.attempts ?? 0) + 1,
            lastAt: today(),
            passedAt: q?.passedAt ?? (pct >= QUIZ_PASS ? today() : undefined),
          };
          return { lessons: { ...s.lessons, [lessonId]: { ...cur, quiz } } };
        }),

      reviewCard: (key, grade) =>
        set((s) => {
          const nextCard = nextState(s.cards[key], grade);
          let missed = s.missedCards;
          if (grade === 'again') {
            if (!missed.includes(key)) missed = [...missed, key];
          } else if (missed.includes(key)) {
            missed = missed.filter((k) => k !== key);
          }
          return { cards: { ...s.cards, [key]: nextCard }, missedCards: missed, activity: bump(s.activity, { cards: 1 }) };
        }),

      recordAnswer: (key, correct) =>
        set((s) => {
          const cur = s.questions[key] ?? { seen: 0, correct: 0, lastCorrect: false, lastAt: today() };
          const stat = { seen: cur.seen + 1, correct: cur.correct + (correct ? 1 : 0), lastCorrect: correct, lastAt: today() };
          let missed = s.missedQuestions;
          if (!correct && !missed.includes(key)) missed = [...missed, key];
          if (correct && missed.includes(key)) missed = missed.filter((k) => k !== key);
          return { questions: { ...s.questions, [key]: stat }, missedQuestions: missed, activity: bump(s.activity, { questions: 1 }) };
        }),

      addExam: (rec) => set((s) => ({ exams: [...s.exams, rec] })),
      deleteExam: (id) => set((s) => ({ exams: s.exams.filter((e) => e.id !== id) })),

      setLabTasks: (labId, tasksDone, complete) =>
        set((s) => {
          const cur = s.labs[labId] ?? { tasksDone: [] };
          return {
            labs: {
              ...s.labs,
              [labId]: {
                startedAt: cur.startedAt ?? today(),
                tasksDone,
                completedAt: cur.completedAt ?? (complete ? today() : undefined),
              },
            },
          };
        }),

      resetLab: (labId) =>
        set((s) => {
          const labs = { ...s.labs };
          const prev = labs[labId];
          labs[labId] = { tasksDone: [], startedAt: prev?.startedAt, completedAt: prev?.completedAt };
          return { labs };
        }),

      setPlan: (plan) => set({ plan }),
      logMinutes: (minutes) => set((s) => ({ activity: bump(s.activity, { minutes }) })),
      resetAll: () => set({ ...empty }),
      importState: (data) => set({ ...empty, ...data }),
    }),
    { name: 'wizardccna-progress', version: 1 },
  ),
);

/* ---------- Settings ---------- */

export type Theme = 'system' | 'light' | 'dark';

interface SettingsState {
  theme: Theme;
  newCardsPerDay: number;
  notesOpen: boolean;
  setTheme: (t: Theme) => void;
  setNewCardsPerDay: (n: number) => void;
  setNotesOpen: (open: boolean) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'system',
      newCardsPerDay: 25,
      notesOpen: true,
      setTheme: (theme) => {
        if (theme === 'system') document.documentElement.removeAttribute('data-theme');
        else document.documentElement.setAttribute('data-theme', theme);
        set({ theme });
      },
      setNewCardsPerDay: (newCardsPerDay) => set({ newCardsPerDay }),
      setNotesOpen: (notesOpen) => set({ notesOpen }),
    }),
    { name: 'wizardccna-settings', version: 1 },
  ),
);

/* ---------- Lab snapshots (kept out of the main store; they can be large) ---------- */

export function saveLabSnapshot(labId: string, snap: unknown) {
  try {
    localStorage.setItem(`wizardccna-lab-${labId}`, JSON.stringify(snap));
  } catch {
    /* storage full or unavailable — lab state simply won't persist */
  }
}

export function loadLabSnapshot<T>(labId: string): T | undefined {
  try {
    const raw = localStorage.getItem(`wizardccna-lab-${labId}`);
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined;
  }
}

export function clearLabSnapshot(labId: string) {
  try {
    localStorage.removeItem(`wizardccna-lab-${labId}`);
  } catch {
    /* ignore */
  }
}
