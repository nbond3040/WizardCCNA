import { EXAM_VERSIONS, versionForDate, type ExamVersion } from '../content/curriculum';
import { today } from '../lib/date';
import { useProgress, type PlanSettings } from './progress';

export function resolveVersion(plan: PlanSettings | null): ExamVersion {
  if (!plan) return versionForDate(today());
  if (plan.version !== 'auto') return plan.version;
  return versionForDate(plan.goalDate);
}

/** The exam version the learner is preparing for (from their plan's goal date, or today's live exam). */
export function useExamVersion(): ExamVersion {
  const plan = useProgress((s) => s.plan);
  return resolveVersion(plan);
}

export function versionInfo(v: ExamVersion) {
  return EXAM_VERSIONS[v];
}
