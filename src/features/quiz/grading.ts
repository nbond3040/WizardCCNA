import type { Question } from '../../content/types';
import { hashString, seededRandom, shuffle } from '../../lib/random';

export type Response =
  | { type: 'single'; choice: number | null }
  | { type: 'multi'; choices: number[] }
  | { type: 'order'; order: number[] }
  | { type: 'match'; map: (number | null)[] }
  | { type: 'categorize'; map: (number | null)[] }
  | { type: 'input'; text: string };

const NO_SHUFFLE = /\b(all|none|both|neither) of the (above|options|following)\b|\b(options?|answers?) [A-F]\b|^\s*[A-F] and [A-F]\s*$/i;

/** Display order of options for single/multi questions (stable per seed). */
export function optionOrder(q: Question, seed: number): number[] {
  if (q.type !== 'single' && q.type !== 'multi') return [];
  const idx = q.options.map((_, i) => i);
  if (q.options.some((o) => NO_SHUFFLE.test(o))) return idx;
  return shuffle(idx, seededRandom(seed ^ hashString(q.id)));
}

/** Initial (shuffled) order for ordering questions — never the solved order. */
export function initialOrder(q: Question, seed: number): number[] {
  if (q.type !== 'order') return [];
  const idx = q.items.map((_, i) => i);
  const rand = seededRandom(seed ^ hashString(q.id + 'o'));
  let o = shuffle(idx, rand);
  for (let t = 0; t < 5 && o.every((v, i) => v === i); t++) o = shuffle(idx, rand);
  if (o.every((v, i) => v === i) && o.length > 1) o = [...o.slice(1), o[0]];
  return o;
}

/** Shuffled right-hand options for matching. */
export function matchChoices(q: Question, seed: number): number[] {
  if (q.type !== 'match') return [];
  return shuffle(q.pairs.map((_, i) => i), seededRandom(seed ^ hashString(q.id + 'm')));
}

export function emptyResponse(q: Question, seed: number): Response {
  switch (q.type) {
    case 'single':
      return { type: 'single', choice: null };
    case 'multi':
      return { type: 'multi', choices: [] };
    case 'order':
      return { type: 'order', order: initialOrder(q, seed) };
    case 'match':
      return { type: 'match', map: q.pairs.map(() => null) };
    case 'categorize':
      return { type: 'categorize', map: q.items.map(() => null) };
    case 'input':
      return { type: 'input', text: '' };
  }
}

export function isAnswered(q: Question, r: Response | undefined): boolean {
  if (!r) return false;
  switch (r.type) {
    case 'single':
      return r.choice !== null;
    case 'multi':
      return r.choices.length > 0;
    case 'order':
      return true;
    case 'match':
    case 'categorize':
      return r.map.every((v) => v !== null);
    case 'input':
      return r.text.trim().length > 0;
  }
  void q;
}

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ').replace(/[“”]/g, '"');
const squash = (s: string) => norm(s).replace(/\s+/g, '').replace(/^0x/, '');

/** Points in [0, 1]. Drag-and-drop styles earn partial credit; `correct` requires full credit. */
export function grade(q: Question, r: Response | undefined): number {
  if (!r) return 0;
  switch (q.type) {
    case 'single':
      return r.type === 'single' && r.choice === q.answer ? 1 : 0;
    case 'multi': {
      if (r.type !== 'multi') return 0;
      const a = [...r.choices].sort().join(',');
      const b = [...q.answers].sort().join(',');
      return a === b ? 1 : 0;
    }
    case 'order': {
      if (r.type !== 'order') return 0;
      const right = r.order.filter((v, i) => v === i).length;
      return right / q.items.length;
    }
    case 'match': {
      if (r.type !== 'match') return 0;
      // right-hand text equality counts (handles duplicate-looking pairs gracefully)
      const right = r.map.filter((v, i) => v !== null && q.pairs[v].right === q.pairs[i].right).length;
      return right / q.pairs.length;
    }
    case 'categorize': {
      if (r.type !== 'categorize') return 0;
      const right = r.map.filter((v, i) => v === q.items[i].category).length;
      return right / q.items.length;
    }
    case 'input': {
      if (r.type !== 'input') return 0;
      const given = r.text;
      return q.answers.some((a) => norm(a) === norm(given) || squash(a) === squash(given)) ? 1 : 0;
    }
  }
}

export const isCorrect = (q: Question, r: Response | undefined) => grade(q, r) >= 0.999;

/** Cisco reports a scaled score from 300 to 1000; ~825 is the commonly cited passing mark. */
export const PASSING_SCALED = 825;
export const scaledScore = (fraction: number) => Math.round(300 + 700 * Math.max(0, Math.min(1, fraction)));
