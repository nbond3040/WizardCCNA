/**
 * Spaced repetition (SM-2 variant, day granularity).
 * "again" = the learner got it wrong: the card lapses, is requeued in the current session and
 * joins the persistent Missed queue until it is answered correctly.
 */
import { addDays, today } from '../../lib/date';

export type Grade = 'again' | 'hard' | 'good' | 'easy';

export interface CardState {
  ef: number;
  interval: number;
  reps: number;
  lapses: number;
  due: string;
  lastReviewed: string;
  lastGrade: Grade;
}

const Q: Record<Grade, number> = { again: 1, hard: 3, good: 4, easy: 5 };

export function nextState(prev: CardState | undefined, grade: Grade, on: string = today()): CardState {
  const s: CardState = prev ? { ...prev } : { ef: 2.5, interval: 0, reps: 0, lapses: 0, due: on, lastReviewed: on, lastGrade: grade };
  const q = Q[grade];
  if (grade === 'again') {
    s.reps = 0;
    s.lapses += 1;
    s.interval = 0;
    s.ef = Math.max(1.3, s.ef - 0.2);
    s.due = on;
  } else {
    s.reps += 1;
    if (s.reps === 1) s.interval = grade === 'easy' ? 3 : 1;
    else if (s.reps === 2) s.interval = grade === 'hard' ? 3 : grade === 'easy' ? 8 : 6;
    else {
      const mult = grade === 'hard' ? 1.2 : grade === 'easy' ? s.ef * 1.3 : s.ef;
      s.interval = Math.max(s.interval + 1, Math.round(s.interval * mult));
    }
    s.ef = Math.max(1.3, s.ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
    s.due = addDays(on, s.interval);
  }
  s.lastReviewed = on;
  s.lastGrade = grade;
  return s;
}

/** Human label for the next interval a grade would produce (shown on the grade buttons). */
export function previewInterval(prev: CardState | undefined, grade: Grade): string {
  if (grade === 'again') return 'again';
  const n = nextState(prev, grade).interval;
  if (n < 30) return `${n}d`;
  if (n < 365) return `${Math.round(n / 30)}mo`;
  return `${(n / 365).toFixed(1)}y`;
}

/** A card counts as "mastered" once its interval reaches 21 days. */
export const MASTERED_INTERVAL = 21;
