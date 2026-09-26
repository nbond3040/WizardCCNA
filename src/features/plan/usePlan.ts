import { useMemo } from 'react';
import { AVAILABLE_LESSONS, useAllLabs } from '../../content/registry';
import { useProgress } from '../../store/progress';
import { resolveVersion } from '../../store/version';
import { today } from '../../lib/date';
import { computePlan, type PlanResult } from './planner';

export function usePlan(): PlanResult | null {
  const plan = useProgress((s) => s.plan);
  const lessons = useProgress((s) => s.lessons);
  const labs = useProgress((s) => s.labs);
  const exams = useProgress((s) => s.exams);
  const { data: labDefs } = useAllLabs();
  const t = today();
  return useMemo(() => {
    if (!plan) return null;
    return computePlan({
      plan,
      version: resolveVersion(plan),
      lessons,
      labs,
      labDefs: Object.values(labDefs ?? {}),
      exams,
      availableLessons: AVAILABLE_LESSONS,
      today: t,
    });
  }, [plan, lessons, labs, exams, labDefs, t]);
}
