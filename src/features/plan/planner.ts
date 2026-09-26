/**
 * Goal-date study planner.
 *
 * Builds the ordered list of work (lessons → labs → module checkpoints → practice exams → reviews),
 * marks what is already done from progress, and lays the remaining work over the learner's study days
 * up to the day before the exam. The schedule is recomputed from live progress every time, so falling
 * behind raises the daily load and working ahead frees up days.
 */
import { LESSONS, MODULES, lessonInVersion, type ExamVersion } from '../../content/curriculum';
import type { Lab } from '../../content/labTypes';

/** What the planner needs to know about any lab (IOS simulator labs and GUI labs alike). */
export type PlanLab = Pick<Lab, 'id' | 'title' | 'minutes' | 'lessons'>;
import { addDays, daysBetween, today as todayFn, weekday } from '../../lib/date';
import type { ExamRecord, LabProgress, LessonProgress, PlanSettings } from '../../store/progress';

export type PlanItemType = 'lesson' | 'lab' | 'checkpoint' | 'exam' | 'review';
export type Phase = 'learn' | 'final';

export interface PlanItem {
  id: string;
  type: PlanItemType;
  refId: string;
  title: string;
  minutes: number;
  phase: Phase;
  done: boolean;
  doneOn?: string;
  href: string;
  /** Exams take a day of their own. */
  exclusive?: boolean;
  moduleTitle?: string;
}

export interface PlanDay {
  date: string;
  items: PlanItem[];
  minutes: number;
  flashcardMinutes: number;
  overflow?: boolean;
}

export type PlanStatus = 'ahead' | 'on-track' | 'behind' | 'no-time' | 'done' | 'not-started';

export interface PlanResult {
  version: ExamVersion;
  items: PlanItem[];
  days: PlanDay[];
  todayItems: PlanItem[];
  isStudyDay: boolean;
  studyDaysLeft: number;
  daysLeft: number;
  totalMinutes: number;
  doneMinutes: number;
  remainingMinutes: number;
  /** Minutes/day needed from today to finish by the day before the exam (incl. flashcards). */
  requiredDaily: number;
  /** The learner's daily budget (fixed or computed). */
  dailyBudget: number;
  finishDate?: string;
  status: PlanStatus;
  /** Minutes the learner is ahead (+) or behind (−) the original pace. */
  paceDelta: number;
}

export const FLASHCARD_MINUTES = 15;
export const CHECKPOINT_MINUTES = 25;
export const EXAM_MINUTES = 150;
export const REVIEW_MINUTES = 60;

const EXPERIENCE_FACTOR = { new: 1, some: 0.85, experienced: 0.7 } as const;

export interface PlanInputs {
  plan: PlanSettings;
  version: ExamVersion;
  lessons: Record<string, LessonProgress>;
  labs: Record<string, LabProgress>;
  labDefs: PlanLab[];
  exams: ExamRecord[];
  availableLessons?: Set<string>;
  today?: string;
}

export function buildItems(inp: PlanInputs): PlanItem[] {
  const { version, lessons, labs, labDefs, exams, plan } = inp;
  const factor = EXPERIENCE_FACTOR[plan.experience] ?? 1;
  const order = new Map(LESSONS.map((l, i) => [l.id, i]));
  const inVersion = new Set(LESSONS.filter((l) => lessonInVersion(l, version)).map((l) => l.id));

  // Place each lab after the last of its lessons (in curriculum order).
  const labAfter = new Map<string, PlanLab[]>();
  for (const lab of labDefs) {
    const ls = lab.lessons.filter((id) => inVersion.has(id));
    if (!ls.length) continue;
    const last = ls.sort((a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0))[ls.length - 1];
    labAfter.set(last, [...(labAfter.get(last) ?? []), lab]);
  }

  const items: PlanItem[] = [];
  const moduleExams = exams.filter((e) => e.kind === 'module');
  for (const m of MODULES) {
    const ls = m.lessons.filter((l) => inVersion.has(l.id));
    if (!ls.length) continue;
    for (const l of ls) {
      const p = lessons[l.id];
      const done = !!p?.deckDoneAt && (p.quiz?.attempts ?? 0) > 0;
      items.push({
        id: `lesson:${l.id}`,
        type: 'lesson',
        refId: l.id,
        title: l.title,
        minutes: Math.round(l.minutes * factor),
        phase: 'learn',
        done,
        doneOn: done ? (p?.quiz?.lastAt ?? p?.deckDoneAt) : undefined,
        href: `/learn/${l.id}`,
        moduleTitle: m.title,
      });
      for (const lab of labAfter.get(l.id) ?? []) {
        const lp = labs[lab.id];
        items.push({
          id: `lab:${lab.id}`,
          type: 'lab',
          refId: lab.id,
          title: lab.title,
          minutes: lab.minutes,
          phase: 'learn',
          done: !!lp?.completedAt,
          doneOn: lp?.completedAt,
          href: `/labs/${lab.id}`,
          moduleTitle: m.title,
        });
      }
    }
    if (ls.length >= 2) {
      const rec = moduleExams.filter((e) => e.moduleId === m.id).sort((a, b) => a.finishedAt.localeCompare(b.finishedAt))[0];
      items.push({
        id: `checkpoint:${m.id}`,
        type: 'checkpoint',
        refId: m.id,
        title: `Checkpoint: ${m.title}`,
        minutes: CHECKPOINT_MINUTES,
        phase: 'learn',
        done: !!rec,
        doneOn: rec?.date,
        href: `/practice/session?kind=module&module=${m.id}&count=20&mode=study&back=1&weak=1&seed=${hashSeed(m.id)}`,
        moduleTitle: m.title,
      });
    }
  }

  const fulls = exams.filter((e) => e.kind === 'full').sort((a, b) => a.finishedAt.localeCompare(b.finishedAt));
  const nonFull = exams.filter((e) => e.kind !== 'full' && e.kind !== 'module');
  const EXAMS = 3;
  for (let i = 0; i < EXAMS; i++) {
    const rec = fulls[i];
    items.push({
      id: `exam:${i + 1}`,
      type: 'exam',
      refId: String(i + 1),
      title: i === 0 ? 'Practice exam 1 — baseline' : i === EXAMS - 1 ? `Practice exam ${i + 1} — dress rehearsal` : `Practice exam ${i + 1}`,
      minutes: EXAM_MINUTES,
      phase: 'final',
      done: !!rec,
      doneOn: rec?.date,
      href: '/practice',
      exclusive: true,
    });
    const after = rec ? nonFull.find((e) => e.finishedAt > rec.finishedAt && e.total >= 10) : undefined;
    items.push({
      id: `review:${i + 1}`,
      type: 'review',
      refId: String(i + 1),
      title: i === EXAMS - 1 ? 'Final review: missed questions & weak domains' : 'Weak-area review: missed questions',
      minutes: REVIEW_MINUTES,
      phase: 'final',
      done: !!after,
      doneOn: after?.date,
      href: '/practice',
    });
  }
  return items;
}

function hashSeed(s: string) {
  let h = 7;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** Study dates from `from` to `until` inclusive on the chosen weekdays. */
export function studyDates(from: string, until: string, weekdays: number[]): string[] {
  const out: string[] = [];
  const n = daysBetween(from, until);
  for (let i = 0; i <= n; i++) {
    const d = addDays(from, i);
    if (weekdays.includes(weekday(d))) out.push(d);
  }
  return out;
}

export function computePlan(inp: PlanInputs): PlanResult {
  const t = inp.today ?? todayFn();
  const { plan, version } = inp;
  const items = buildItems(inp);
  const lastStudy = addDays(plan.goalDate, -1);
  const dates = daysBetween(t, lastStudy) >= 0 ? studyDates(t, lastStudy, plan.studyDays.length ? plan.studyDays : [1, 2, 3, 4, 5, 6]) : [];
  const isStudyDay = dates[0] === t;

  const totalMinutes = items.reduce((a, i) => a + i.minutes, 0);
  const doneMinutes = items.filter((i) => i.done).reduce((a, i) => a + i.minutes, 0);
  const doneToday = items.filter((i) => i.done && i.doneOn === t);
  const remaining = items.filter((i) => !i.done);
  const remainingMinutes = remaining.reduce((a, i) => a + i.minutes, 0);
  const todayDoneMinutes = doneToday.reduce((a, i) => a + i.minutes, 0);

  const nDays = dates.length;
  // Work already finished today still counts toward today's budget.
  const neededCore = nDays ? Math.ceil((remainingMinutes + (isStudyDay ? todayDoneMinutes : 0)) / nDays) : remainingMinutes;

  const layout = (capacity: number): { days: PlanDay[]; fits: boolean } => {
    const days: PlanDay[] = [];
    let qi = 0;
    for (let di = 0; qi < remaining.length || di < nDays; di++) {
      if (di > 400) break; // safety bound for overflow scheduling
      let date: string;
      let overflow = false;
      if (di < nDays) date = dates[di];
      else {
        // past the goal date: keep scheduling so the learner sees when they'd finish
        const prev = days.length ? days[days.length - 1].date : t;
        let d = addDays(prev, 1);
        while (!plan.studyDays.includes(weekday(d))) d = addDays(d, 1);
        date = d;
        overflow = true;
      }
      const day: PlanDay = { date, items: [], minutes: 0, flashcardMinutes: FLASHCARD_MINUTES, overflow };
      if (date === t) {
        day.items.push(...doneToday);
        day.minutes += todayDoneMinutes;
      }
      while (qi < remaining.length) {
        const it = remaining[qi];
        const empty = day.minutes === 0;
        if (it.exclusive && !empty) break;
        if (!empty && day.minutes + it.minutes > capacity * 1.1) break;
        day.items.push(it);
        day.minutes += it.minutes;
        qi++;
        if (it.exclusive) break;
      }
      if (day.items.length || di < nDays) days.push(day);
      if (qi >= remaining.length && di >= nDays - 1) break;
    }
    const fits = !days.some((d) => d.overflow && d.items.length);
    return { days, fits };
  };

  let dailyBudget: number;
  let days: PlanDay[];
  if (plan.dailyMinutes) {
    dailyBudget = plan.dailyMinutes;
    days = layout(Math.max(15, dailyBudget - FLASHCARD_MINUTES)).days;
  } else {
    // Smallest daily capacity (in 5-minute steps) whose schedule fits before the exam.
    let lo = Math.max(15, Math.floor(neededCore / 5) * 5);
    let hi = Math.max(lo, 16 * 60);
    if (!layout(hi).fits) lo = hi;
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 10) * 5;
      if (mid <= lo) {
        if (layout(lo).fits) hi = lo;
        else lo = lo + 5;
        break;
      }
      if (layout(mid).fits) hi = mid;
      else lo = mid + 5;
    }
    const cap = Math.max(lo, 15);
    days = layout(cap).days;
    dailyBudget = Math.max(30, Math.ceil((cap + FLASHCARD_MINUTES) / 5) * 5);
  }
  const requiredDaily = neededCore + FLASHCARD_MINUTES;

  const lastWorkDay = [...days].reverse().find((d) => d.items.some((i) => !i.done));
  const finishDate = remaining.length ? lastWorkDay?.date : t;

  // Pace vs the original plan: expected share of work done by today.
  const allDates = studyDates(plan.startDate, lastStudy, plan.studyDays);
  const elapsed = allDates.filter((d) => d < t).length;
  const expectedDone = allDates.length ? (totalMinutes * elapsed) / allDates.length : 0;
  const paceDelta = Math.round(doneMinutes - todayDoneMinutes - expectedDone);
  const perDay = allDates.length ? totalMinutes / allDates.length : totalMinutes;

  let status: PlanStatus;
  if (!remaining.length) status = 'done';
  else if (!nDays || (finishDate && finishDate > lastStudy)) status = 'no-time';
  else if (doneMinutes === 0 && elapsed === 0) status = 'not-started';
  else if (paceDelta < -perDay) status = 'behind';
  else if (paceDelta > perDay) status = 'ahead';
  else status = 'on-track';

  const todayDay = days.find((d) => d.date === t);
  return {
    version,
    items,
    days,
    todayItems: todayDay?.items ?? doneToday,
    isStudyDay,
    studyDaysLeft: nDays,
    daysLeft: Math.max(0, daysBetween(t, plan.goalDate)),
    totalMinutes,
    doneMinutes,
    remainingMinutes,
    requiredDaily,
    dailyBudget,
    finishDate,
    status,
    paceDelta,
  };
}
