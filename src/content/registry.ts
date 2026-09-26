/**
 * Lazy content registry. Lessons and labs are code-split per file and loaded on demand;
 * `loadAll*` warms everything (used by flashcards, practice exams and the planner).
 */
import { useEffect, useState } from 'react';
import type { Flashcard, LessonContent, Question } from './types';
import type { Lab } from './labTypes';
import { LESSONS } from './curriculum';

const lessonLoaders = import.meta.glob<{ default: LessonContent }>('./lessons/*.ts');
const labLoaders = import.meta.glob<{ default: Lab }>(['./labs/*.ts', '!./labs/*.test.ts']);

const idOf = (path: string) => path.split('/').pop()!.replace(/\.ts$/, '');

const lessonPath: Record<string, string> = Object.fromEntries(Object.keys(lessonLoaders).map((p) => [idOf(p), p]));
const labPath: Record<string, string> = Object.fromEntries(Object.keys(labLoaders).map((p) => [idOf(p), p]));

export const AVAILABLE_LESSONS = new Set(Object.keys(lessonPath));
export const AVAILABLE_LABS = Object.keys(labPath);

const lessonCache = new Map<string, LessonContent>();
const labCache = new Map<string, Lab>();
let allLessonsPromise: Promise<Record<string, LessonContent>> | null = null;
let allLabsPromise: Promise<Record<string, Lab>> | null = null;

export async function loadLesson(id: string): Promise<LessonContent | undefined> {
  if (lessonCache.has(id)) return lessonCache.get(id);
  const p = lessonPath[id];
  if (!p) return undefined;
  try {
    const mod = await lessonLoaders[p]();
    const c = mod.default;
    if (!c || typeof c !== 'object') return undefined;
    // Be defensive: a lesson that is still being authored may be missing arrays.
    const lesson: LessonContent = {
      id: c.id ?? id,
      slides: Array.isArray(c.slides) ? c.slides : [],
      flashcards: Array.isArray(c.flashcards) ? c.flashcards : [],
      quiz: Array.isArray(c.quiz) ? c.quiz : [],
      exam: Array.isArray(c.exam) ? c.exam : [],
    };
    if (!lesson.slides.length) return undefined;
    lessonCache.set(id, lesson);
    return lesson;
  } catch (e) {
    console.error(`Failed to load lesson ${id}`, e);
    return undefined;
  }
}

export function loadAllLessons(): Promise<Record<string, LessonContent>> {
  if (!allLessonsPromise) {
    allLessonsPromise = Promise.all(
      LESSONS.filter((l) => lessonPath[l.id]).map(async (l) => [l.id, await loadLesson(l.id)] as const),
    ).then((pairs) => Object.fromEntries(pairs.filter((p) => p[1])) as Record<string, LessonContent>);
  }
  return allLessonsPromise;
}

export async function loadLab(id: string): Promise<Lab | undefined> {
  if (labCache.has(id)) return labCache.get(id);
  const p = labPath[id];
  if (!p) return undefined;
  try {
    const mod = await labLoaders[p]();
    if (!mod.default?.devices) return undefined;
    labCache.set(id, mod.default);
    return mod.default;
  } catch (e) {
    console.error(`Failed to load lab ${id}`, e);
    return undefined;
  }
}

export function loadAllLabs(): Promise<Record<string, Lab>> {
  if (!allLabsPromise) {
    allLabsPromise = Promise.all(AVAILABLE_LABS.map(async (id) => [id, await loadLab(id)] as const)).then(
      (pairs) => Object.fromEntries(pairs.filter((p) => p[1])) as Record<string, Lab>,
    );
  }
  return allLabsPromise;
}

/** Tiny async hook with a synchronous fast path when data is already cached. */
function useLoader<T>(key: string, peek: () => T | undefined, load: () => Promise<T>): { data: T | undefined; loading: boolean } {
  const [state, setState] = useState<{ key: string; data: T | undefined; loading: boolean }>(() => {
    const cached = peek();
    return { key, data: cached, loading: cached === undefined };
  });
  useEffect(() => {
    let alive = true;
    const cached = peek();
    if (cached !== undefined) {
      setState({ key, data: cached, loading: false });
      return;
    }
    setState({ key, data: undefined, loading: true });
    load().then((data) => alive && setState({ key, data, loading: false }));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  if (state.key !== key) {
    const cached = peek();
    return { data: cached, loading: cached === undefined };
  }
  return { data: state.data, loading: state.loading };
}

let allLessonsResolved: Record<string, LessonContent> | undefined;
let allLabsResolved: Record<string, Lab> | undefined;

export function useLesson(id: string) {
  return useLoader(`lesson:${id}`, () => lessonCache.get(id), async () => (await loadLesson(id)) as LessonContent);
}

export function useAllLessons() {
  return useLoader(
    'all-lessons',
    () => allLessonsResolved,
    async () => (allLessonsResolved = await loadAllLessons()),
  );
}

export function useLab(id: string) {
  return useLoader(`lab:${id}`, () => labCache.get(id), async () => (await loadLab(id)) as Lab);
}

export function useAllLabs() {
  return useLoader('all-labs', () => allLabsResolved, async () => (allLabsResolved = await loadAllLabs()));
}

/* ---------- Global keys ---------- */

export const cardKey = (lessonId: string, cardId: string) => `${lessonId}/${cardId}`;
export const questionKey = (lessonId: string, qid: string) => `${lessonId}/${qid}`;

export interface CardRef { key: string; lessonId: string; card: Flashcard }
export interface QuestionRef { key: string; lessonId: string; question: Question; pool: 'quiz' | 'exam' }

export function allCards(lessons: Record<string, LessonContent>): CardRef[] {
  return LESSONS.flatMap((l) =>
    (lessons[l.id]?.flashcards ?? []).map((card) => ({ key: cardKey(l.id, card.id), lessonId: l.id, card })),
  );
}

export function allQuestions(lessons: Record<string, LessonContent>, pool: 'quiz' | 'exam' | 'both' = 'exam'): QuestionRef[] {
  return LESSONS.flatMap((l) => {
    const c = lessons[l.id];
    if (!c) return [];
    const out: QuestionRef[] = [];
    if (pool !== 'quiz') out.push(...c.exam.map((question) => ({ key: questionKey(l.id, question.id), lessonId: l.id, question, pool: 'exam' as const })));
    if (pool !== 'exam') out.push(...c.quiz.map((question) => ({ key: questionKey(l.id, question.id), lessonId: l.id, question, pool: 'quiz' as const })));
    return out;
  });
}
