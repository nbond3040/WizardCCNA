import { BookOpen, FlaskConical, Flag, RotateCcw, Trophy } from 'lucide-react';
import type { PlanItemType } from './planner';

export const ITEM_ICON: Record<PlanItemType, typeof BookOpen> = {
  lesson: BookOpen,
  lab: FlaskConical,
  checkpoint: Flag,
  exam: Trophy,
  review: RotateCcw,
};

export const ITEM_LABEL: Record<PlanItemType, string> = {
  lesson: 'Lesson',
  lab: 'Lab',
  checkpoint: 'Checkpoint',
  exam: 'Practice exam',
  review: 'Review',
};
