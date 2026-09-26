import type { LessonContent } from '../../content/types';
import { LESSONS, lessonInVersion, type ExamVersion } from '../../content/curriculum';
import type { CardState } from '../flashcards/srs';
import type { ExamRecord, LabProgress, LessonProgress, QuestionStat } from '../../store/progress';
import { versionCards } from '../flashcards/deck';
import { addDays, today } from '../../lib/date';

export interface Readiness {
  score: number; // 0..1
  parts: { key: string; label: string; value: number; weight: number; detail: string }[];
  predictedScaled?: number;
}

export function computeReadiness(args: {
  version: ExamVersion;
  content?: Record<string, LessonContent>;
  lessons: Record<string, LessonProgress>;
  cards: Record<string, CardState>;
  questions: Record<string, QuestionStat>;
  exams: ExamRecord[];
  labs: Record<string, LabProgress>;
  labTotal: number;
}): Readiness {
  const { version, content, lessons, cards, questions, exams, labs, labTotal } = args;
  const ls = LESSONS.filter((l) => lessonInVersion(l, version));
  const done = ls.filter((l) => lessons[l.id]?.deckDoneAt && lessons[l.id]?.quiz).length;
  const coverage = ls.length ? done / ls.length : 0;

  const quizzes = ls.map((l) => lessons[l.id]?.quiz?.best).filter((x): x is number => x !== undefined);
  const quiz = quizzes.length ? (quizzes.reduce((a, b) => a + b, 0) / quizzes.length) * (quizzes.length / Math.max(1, ls.length)) : 0;

  let flash = 0;
  let flashDetail = 'no cards reviewed yet';
  if (content) {
    const vc = versionCards(content, version);
    const reviewed = vc.filter((c) => cards[c.key]);
    const good = reviewed.filter((c) => cards[c.key].lastGrade !== 'again' && cards[c.key].interval >= 3).length;
    flash = vc.length ? good / vc.length : 0;
    flashDetail = `${good} of ${vc.length} cards retained`;
  }

  const fulls = exams.filter((e) => e.kind === 'full' && e.version === version).slice(-3);
  let practice = 0;
  let practiceDetail = 'take a practice exam';
  let predictedScaled: number | undefined;
  if (fulls.length) {
    practice = fulls.reduce((a, e) => a + e.percent, 0) / fulls.length;
    predictedScaled = Math.round(fulls.reduce((a, e) => a + e.scaled, 0) / fulls.length);
    practiceDetail = `avg of last ${fulls.length} full exam${fulls.length > 1 ? 's' : ''}`;
  } else {
    const stats = Object.values(questions);
    const seen = stats.reduce((a, s) => a + s.seen, 0);
    const correct = stats.reduce((a, s) => a + s.correct, 0);
    if (seen >= 20) {
      practice = (correct / seen) * 0.85;
      practiceDetail = `${Math.round((correct / seen) * 100)}% on ${seen} answers`;
    }
  }

  const labsDone = Object.values(labs).filter((l) => l.completedAt).length;
  const labScore = labTotal ? Math.min(1, labsDone / labTotal) : 0;

  const parts = [
    { key: 'coverage', label: 'Lessons', value: coverage, weight: 0.3, detail: `${done} of ${ls.length} complete` },
    { key: 'practice', label: 'Practice exams', value: practice, weight: 0.3, detail: practiceDetail },
    { key: 'flash', label: 'Flashcards', value: flash, weight: 0.15, detail: flashDetail },
    { key: 'labs', label: 'Labs', value: labScore, weight: 0.15, detail: `${labsDone} of ${labTotal} done` },
    { key: 'quiz', label: 'Deck quizzes', value: quiz, weight: 0.1, detail: `${quizzes.length} taken` },
  ];
  const score = parts.reduce((a, p) => a + p.value * p.weight, 0);
  return { score, parts, predictedScaled };
}

export function streak(activity: Record<string, { minutes: number; cards: number; questions: number }>): number {
  let d = today();
  const active = (x: string) => {
    const a = activity[x];
    return !!a && (a.minutes > 0 || a.cards > 0 || a.questions > 0);
  };
  if (!active(d)) d = addDays(d, -1);
  let n = 0;
  while (active(d)) {
    n++;
    d = addDays(d, -1);
  }
  return n;
}
