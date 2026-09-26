import { describe, expect, it } from 'vitest';
import { computePlan, studyDates } from './planner';
import type { PlanSettings } from '../../store/progress';
import { LESSONS, lessonInVersion } from '../../content/curriculum';

const base: PlanSettings = {
  goalDate: '2026-12-15',
  startDate: '2026-09-28',
  version: 'v1.1',
  studyDays: [1, 2, 3, 4, 5, 6],
  dailyMinutes: null,
  experience: 'new',
  createdAt: '2026-09-28',
};

describe('planner', () => {
  it('lists study dates on chosen weekdays only', () => {
    const d = studyDates('2026-09-28', '2026-10-04', [1, 3, 5]); // Mon..Sun
    expect(d).toEqual(['2026-09-28', '2026-09-30', '2026-10-02']);
  });

  it('schedules every item before the exam when pace is computed', () => {
    const r = computePlan({ plan: base, version: 'v1.1', lessons: {}, labs: {}, labDefs: [], exams: [], today: '2026-09-28' });
    const lessonCount = LESSONS.filter((l) => lessonInVersion(l, 'v1.1')).length;
    expect(r.items.filter((i) => i.type === 'lesson')).toHaveLength(lessonCount);
    const scheduled = r.days.flatMap((d) => d.items);
    expect(scheduled).toHaveLength(r.items.length);
    expect(r.finishDate! < '2026-12-15').toBe(true);
    expect(r.status).toBe('not-started');
    // exams sit on their own day
    for (const d of r.days) if (d.items.some((i) => i.type === 'exam')) expect(d.items.filter((i) => !i.done)).toHaveLength(d.items.some((i) => i.type === 'review') ? 1 : 1);
  });

  it('flags an impossible fixed budget', () => {
    const r = computePlan({ plan: { ...base, goalDate: '2026-10-10', dailyMinutes: 30 }, version: 'v1.1', lessons: {}, labs: {}, labDefs: [], exams: [], today: '2026-09-28' });
    expect(r.status).toBe('no-time');
    expect(r.requiredDaily).toBeGreaterThan(30);
  });

  it('v2.0 plans include v2.0-only lessons', () => {
    const r = computePlan({ plan: { ...base, goalDate: '2027-04-01', version: 'v2.0' }, version: 'v2.0', lessons: {}, labs: {}, labDefs: [], exams: [], today: '2026-09-28' });
    expect(r.items.some((i) => i.refId === 'ospfv3')).toBe(true);
  });

  it('counts completed lessons and marks behind schedule', () => {
    const r = computePlan({ plan: { ...base, startDate: '2026-09-01' }, version: 'v1.1', lessons: {}, labs: {}, labDefs: [], exams: [], today: '2026-10-20' });
    expect(r.status).toBe('behind');
  });
});
