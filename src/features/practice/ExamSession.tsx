import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { EXAM_VERSIONS, MODULES } from '../../content/curriculum';
import { useAllLessons } from '../../content/registry';
import { useProgress, type ExamKind, type ExamRecord } from '../../store/progress';
import { useExamVersion } from '../../store/version';
import { today } from '../../lib/date';
import { uid } from '../../lib/random';
import { QuizRunner } from '../quiz/QuizRunner';
import { scaledScore } from '../quiz/grading';
import { buildExam, domainOf } from './examBuilder';

export function ExamSession() {
  const [p] = useSearchParams();
  const version = useExamVersion();
  const { data: content, loading } = useAllLessons();
  const stats = useProgress((s) => s.questions);
  const missed = useProgress((s) => s.missedQuestions);
  const addExam = useProgress((s) => s.addExam);
  const logMinutes = useProgress((s) => s.logMinutes);
  const navigate = useNavigate();
  const [started] = useState(true);

  const kind = (p.get('kind') ?? 'custom') as ExamKind;
  const seed = Number(p.get('seed') ?? 1);
  const count = Number(p.get('count') ?? 20);
  const mode = (p.get('mode') ?? 'study') as 'study' | 'exam';
  const time = p.get('time') ? Number(p.get('time')) : undefined;
  const back = p.get('back') === '1';
  const domains = (p.get('domains') ?? '').split(',').filter(Boolean).map(Number);
  const moduleId = p.get('module') ?? undefined;
  const lessonIds = (p.get('lessons') ?? '').split(',').filter(Boolean);
  const weak = p.get('weak') === '1';

  const items = useMemo(() => {
    if (!content) return [];
    return buildExam(
      { kind, version, count, domains, moduleId: moduleId || undefined, lessonIds, seed, preferWeak: weak, missedKeys: missed },
      content,
      stats,
    );
    // freeze the question set for this session
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  if (loading || !content) return <div className="page"><div className="loading"><div className="spinner" /> Building your exam…</div></div>;
  if (!items.length) {
    return (
      <div className="page">
        <div className="empty">
          <h3>No questions match</h3>
          <p>Try a different selection.</p>
          <button className="btn mt" onClick={() => navigate('/practice')}>Back</button>
        </div>
      </div>
    );
  }

  const info = EXAM_VERSIONS[version];
  const title =
    kind === 'full'
      ? `${info.name} — full simulation`
      : kind === 'missed'
        ? 'Missed questions review'
        : kind === 'module'
          ? `Module review: ${MODULES.find((m) => m.id === moduleId)?.title ?? ''}`
          : kind === 'domain' && domains.length === 1
            ? `Domain ${domains[0]}: ${info.domains.find((d) => d.num === domains[0])?.title}`
            : 'Custom practice';

  return (
    <div className="page">
      {started && (
        <QuizRunner
          items={items}
          mode={mode}
          seed={seed}
          timeLimit={mode === 'exam' ? time : undefined}
          allowBack={back}
          title={title}
          onExit={() => {
            if (confirm('Leave this session? Your answers will not be scored.')) navigate('/practice');
          }}
          onFinish={(r) => {
            const byDomain: ExamRecord['byDomain'] = {};
            r.items.forEach((it) => {
              const d = domainOf(it.ref, version);
              byDomain[d] = byDomain[d] ?? { total: 0, points: 0 };
              byDomain[d].total += 1;
              byDomain[d].points += it.points;
            });
            const percent = r.total ? r.points / r.total : 0;
            const rec: ExamRecord = {
              id: uid(),
              kind,
              title,
              version,
              mode,
              startedAt: r.startedAt,
              finishedAt: new Date().toISOString(),
              date: today(),
              durationSec: r.durationSec,
              total: r.total,
              correct: r.correct,
              points: r.points,
              percent,
              scaled: scaledScore(percent),
              byDomain,
              items: r.items.map((it) => ({ key: it.ref.key, points: it.points, response: it.response })),
              moduleId,
            };
            addExam(rec);
            logMinutes(Math.round(r.durationSec / 60));
            navigate(`/practice/results/${rec.id}`, { replace: true });
          }}
        />
      )}
    </div>
  );
}
