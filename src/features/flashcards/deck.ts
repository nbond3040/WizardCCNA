import type { LessonContent } from '../../content/types';
import { LESSONS, lessonInVersion, type ExamVersion } from '../../content/curriculum';
import { allCards, type CardRef } from '../../content/registry';
import type { CardState } from './srs';
import { MASTERED_INTERVAL } from './srs';
import { today } from '../../lib/date';
import type { LessonProgress } from '../../store/progress';

export interface DeckStats {
  total: number;
  unlocked: number;
  due: number;
  fresh: number;
  learning: number;
  mastered: number;
  missed: number;
}

export function isUnlocked(lessonId: string, lessons: Record<string, LessonProgress>) {
  return !!lessons[lessonId]?.deckDoneAt;
}

/** Cards applicable to the chosen exam version (drops cards tagged for the other version only). */
export function versionCards(content: Record<string, LessonContent>, version: ExamVersion): CardRef[] {
  const other = version === 'v1.1' ? 'v2.0' : 'v1.1';
  return allCards(content).filter((c) => {
    const lesson = LESSONS.find((l) => l.id === c.lessonId);
    if (lesson && !lessonInVersion(lesson, version)) return false;
    return !(c.card.tags ?? []).includes(other) || (c.card.tags ?? []).includes(version);
  });
}

export function computeStats(cards: CardRef[], state: Record<string, CardState>, lessons: Record<string, LessonProgress>, missed: string[]): DeckStats {
  const t = today();
  const s: DeckStats = { total: cards.length, unlocked: 0, due: 0, fresh: 0, learning: 0, mastered: 0, missed: 0 };
  const missedSet = new Set(missed);
  for (const c of cards) {
    if (!isUnlocked(c.lessonId, lessons)) continue;
    s.unlocked++;
    const st = state[c.key];
    if (missedSet.has(c.key)) s.missed++;
    if (!st) s.fresh++;
    else {
      if (st.due <= t) s.due++;
      if (st.interval >= MASTERED_INTERVAL) s.mastered++;
      else s.learning++;
    }
  }
  return s;
}

/** Number of brand-new cards already introduced today. */
export function newCardsToday(state: Record<string, CardState>): number {
  const t = today();
  return Object.values(state).filter((s) => s.lastReviewed === t && s.reps <= 1 && s.lapses === 0).length;
}

export function buildQueue(
  mode: { kind: 'today' } | { kind: 'missed' } | { kind: 'deck'; lessonId: string } | { kind: 'all' },
  cards: CardRef[],
  state: Record<string, CardState>,
  lessons: Record<string, LessonProgress>,
  missed: string[],
  newLimit: number,
): CardRef[] {
  const t = today();
  const byKey = new Map(cards.map((c) => [c.key, c]));
  const unlocked = cards.filter((c) => isUnlocked(c.lessonId, lessons));
  if (mode.kind === 'missed') return missed.map((k) => byKey.get(k)).filter((c): c is CardRef => !!c && isUnlocked(c.lessonId, lessons));
  if (mode.kind === 'deck') {
    const deck = unlocked.filter((c) => c.lessonId === mode.lessonId);
    const m = new Set(missed);
    const rank = (c: CardRef) => (m.has(c.key) ? 0 : state[c.key] && state[c.key].due <= t ? 1 : !state[c.key] ? 2 : 3);
    return deck.slice().sort((a, b) => rank(a) - rank(b));
  }
  if (mode.kind === 'all') return unlocked;
  // today: missed first, then due, then new (in curriculum order) up to the daily limit
  const seen = new Set<string>();
  const out: CardRef[] = [];
  for (const k of missed) {
    const c = byKey.get(k);
    if (c && isUnlocked(c.lessonId, lessons) && !seen.has(k)) {
      out.push(c);
      seen.add(k);
    }
  }
  const due = unlocked.filter((c) => state[c.key] && state[c.key].due <= t && !seen.has(c.key)).sort((a, b) => state[a.key].due.localeCompare(state[b.key].due));
  due.forEach((c) => {
    out.push(c);
    seen.add(c.key);
  });
  const remainingNew = Math.max(0, newLimit - newCardsToday(state));
  unlocked
    .filter((c) => !state[c.key] && !seen.has(c.key))
    .slice(0, remainingNew)
    .forEach((c) => out.push(c));
  return out;
}
