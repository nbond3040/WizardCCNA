import type { LessonContent } from '../../content/types';
import { EXAM_VERSIONS, LESSONS, LESSON_BY_ID, lessonDomain, lessonInVersion, MODULES, type ExamVersion } from '../../content/curriculum';
import { allQuestions, type QuestionRef } from '../../content/registry';
import { seededRandom, shuffle } from '../../lib/random';
import type { QuestionStat } from '../../store/progress';

export interface ExamSpec {
  kind: 'full' | 'custom' | 'domain' | 'module' | 'missed' | 'lesson';
  version: ExamVersion;
  count: number;
  domains?: number[];
  moduleId?: string;
  lessonIds?: string[];
  seed: number;
  /** Prefer questions not seen before / answered wrong. */
  preferWeak?: boolean;
  missedKeys?: string[];
}

export function versionQuestions(content: Record<string, LessonContent>, version: ExamVersion): QuestionRef[] {
  const other = version === 'v1.1' ? 'v2.0' : 'v1.1';
  return allQuestions(content, 'exam').filter((q) => {
    const l = LESSON_BY_ID[q.lessonId];
    if (!l || !lessonInVersion(l, version)) return false;
    const tags = q.question.tags ?? [];
    return !tags.includes(other) || tags.includes(version);
  });
}

export function domainOf(ref: { lessonId: string }, version: ExamVersion): number {
  return lessonDomain(LESSON_BY_ID[ref.lessonId], version) ?? 0;
}

function pickWeighted(pool: QuestionRef[], n: number, rand: () => number, stats?: Record<string, QuestionStat>, preferWeak?: boolean): QuestionRef[] {
  const shuffled = shuffle(pool, rand);
  if (!preferWeak || !stats) return shuffled.slice(0, n);
  const score = (q: QuestionRef) => {
    const s = stats[q.key];
    if (!s) return 0; // unseen first
    if (!s.lastCorrect) return 1; // then last answered wrong
    return 2 + s.correct / Math.max(1, s.seen);
  };
  return shuffled
    .map((q, i) => ({ q, k: score(q) + i / (shuffled.length * 10) }))
    .sort((a, b) => a.k - b.k)
    .slice(0, n)
    .map((x) => x.q);
}

export function buildExam(spec: ExamSpec, content: Record<string, LessonContent>, stats?: Record<string, QuestionStat>): QuestionRef[] {
  const rand = seededRandom(spec.seed);
  let pool = versionQuestions(content, spec.version);

  if (spec.kind === 'missed') {
    const keys = new Set(spec.missedKeys ?? []);
    return shuffle(pool.filter((q) => keys.has(q.key)), rand).slice(0, spec.count);
  }
  if (spec.lessonIds?.length) pool = pool.filter((q) => spec.lessonIds!.includes(q.lessonId));
  if (spec.moduleId) {
    const ids = new Set(MODULES.find((m) => m.id === spec.moduleId)?.lessons.map((l) => l.id) ?? []);
    pool = pool.filter((q) => ids.has(q.lessonId));
  }
  if (spec.domains?.length) pool = pool.filter((q) => spec.domains!.includes(domainOf(q, spec.version)));

  if (spec.kind !== 'full') return shuffle(pickWeighted(pool, spec.count, rand, stats, spec.preferWeak), rand);

  // Full exam: allocate by blueprint weight (largest remainder), then shuffle domains together.
  const domains = EXAM_VERSIONS[spec.version].domains;
  const raw = domains.map((d) => (spec.count * d.weight) / 100);
  const alloc = raw.map(Math.floor);
  let left = spec.count - alloc.reduce((a, b) => a + b, 0);
  raw
    .map((r, i) => ({ i, frac: r - Math.floor(r) }))
    .sort((a, b) => b.frac - a.frac)
    .forEach(({ i }) => {
      if (left > 0) {
        alloc[i]++;
        left--;
      }
    });
  const chosen: QuestionRef[] = [];
  let shortfall = 0;
  domains.forEach((d, i) => {
    const dp = pool.filter((q) => domainOf(q, spec.version) === d.num);
    const picked = pickWeighted(dp, alloc[i], rand, stats, spec.preferWeak);
    shortfall += alloc[i] - picked.length;
    chosen.push(...picked);
  });
  if (shortfall > 0) {
    const used = new Set(chosen.map((q) => q.key));
    chosen.push(...pickWeighted(pool.filter((q) => !used.has(q.key)), shortfall, rand, stats, spec.preferWeak));
  }
  return shuffle(chosen, rand);
}

export function poolSizeByDomain(content: Record<string, LessonContent>, version: ExamVersion): Record<number, number> {
  const out: Record<number, number> = {};
  for (const q of versionQuestions(content, version)) {
    const d = domainOf(q, version);
    out[d] = (out[d] ?? 0) + 1;
  }
  return out;
}

export function lessonsInDomain(version: ExamVersion, domain: number) {
  return LESSONS.filter((l) => lessonDomain(l, version) === domain);
}
