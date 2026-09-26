import { Link, useParams } from 'react-router';
import { ArrowLeft, Clock, RotateCcw } from 'lucide-react';
import { EXAM_VERSIONS, LESSON_BY_ID } from '../../content/curriculum';
import { questionKey, useAllLessons } from '../../content/registry';
import { useProgress } from '../../store/progress';
import { formatDate, formatDuration } from '../../lib/date';
import { hashString } from '../../lib/random';
import { PASSING_SCALED } from '../quiz/grading';
import type { Response } from '../quiz/grading';
import { ReviewList, type ReviewItem } from '../quiz/ResultsView';
import './practice.css';

export function ExamResults() {
  const { id = '' } = useParams();
  const exam = useProgress((s) => s.exams.find((e) => e.id === id));
  const { data: content } = useAllLessons();
  if (!exam) return <div className="page"><div className="empty"><h3>Result not found</h3><Link className="btn mt" to="/practice">Back to practice</Link></div></div>;
  const info = EXAM_VERSIONS[exam.version];
  const pass = exam.scaled >= PASSING_SCALED;

  const review: ReviewItem[] = [];
  if (content) {
    for (const it of exam.items) {
      const [lessonId, qid] = it.key.split('/');
      const lesson = content[lessonId];
      const question = lesson?.exam.find((q) => questionKey(lessonId, q.id) === it.key || q.id === qid) ?? lesson?.quiz.find((q) => q.id === qid);
      if (question) review.push({ key: it.key, lessonId, question, response: it.response as Response, points: it.points });
    }
  }

  // Weakest lessons in this attempt
  const byLesson: Record<string, { total: number; points: number }> = {};
  exam.items.forEach((it) => {
    const l = it.key.split('/')[0];
    byLesson[l] = byLesson[l] ?? { total: 0, points: 0 };
    byLesson[l].total += 1;
    byLesson[l].points += it.points;
  });
  const weak = Object.entries(byLesson)
    .filter(([, v]) => v.points / v.total < 0.75)
    .sort((a, b) => a[1].points / a[1].total - b[1].points / b[1].total)
    .slice(0, 6);

  return (
    <div className="page">
      <Link to="/practice" className="btn ghost sm mb"><ArrowLeft size={14} /> Practice</Link>
      <div className="card result-hero">
        <div>
          <div className="eyebrow">{exam.title}</div>
          {exam.kind === 'full' ? (
            <>
              <div className="scaled" style={{ color: pass ? 'var(--good)' : 'var(--bad)' }}>{exam.scaled}</div>
              <div className="scaled-scale">out of 1000 · {pass ? 'above' : 'below'} the ~{PASSING_SCALED} passing mark</div>
            </>
          ) : (
            <>
              <div className="scaled">{Math.round(exam.percent * 100)}%</div>
              <div className="scaled-scale">{exam.correct} of {exam.total} correct</div>
            </>
          )}
        </div>
        <div className="spacer" />
        <div className="stack s small">
          <div><strong>{exam.correct}</strong> / {exam.total} fully correct ({Math.round(exam.percent * 100)}% with partial credit)</div>
          <div className="muted"><Clock size={12} style={{ display: 'inline', verticalAlign: '-1px' }} /> {formatDuration(exam.durationSec)} · {formatDate(exam.date, { year: true })} · {info.name}</div>
          <div className="row mt-s">
            <Link to="/practice" className="btn sm"><RotateCcw size={13} /> New attempt</Link>
          </div>
        </div>
      </div>

      <div className="grid c2 mt">
        <div className="card">
          <div className="card-title mb">Score by domain</div>
          {info.domains.map((d) => {
            const v = exam.byDomain[d.num];
            const pct = v ? v.points / v.total : null;
            return (
              <div key={d.num} className="domain-row">
                <div>
                  <div style={{ fontWeight: 550 }}>D{d.num} · {d.title}</div>
                  <div className="tiny muted">{v ? `${v.total} questions` : 'not tested'} · {d.weight}% of exam</div>
                </div>
                <div className={`bar ${pct !== null && pct >= 0.85 ? 'good' : ''}`}><span style={{ width: `${(pct ?? 0) * 100}%`, background: pct !== null && pct < 0.7 ? 'var(--bad)' : undefined }} /></div>
                <div className="num" style={{ textAlign: 'right', fontWeight: 650 }}>{pct === null ? '—' : `${Math.round(pct * 100)}%`}</div>
              </div>
            );
          })}
        </div>
        <div className="card">
          <div className="card-title mb">Study next</div>
          {weak.length === 0 ? (
            <p className="muted small">No weak lessons in this attempt. Keep your flashcards current and try another simulation.</p>
          ) : (
            <div className="stack s">
              {weak.map(([l, v]) => (
                <Link key={l} to={`/learn/${l}`} className="row between list-link">
                  <span>{LESSON_BY_ID[l]?.title ?? l}</span>
                  <span className="chip bad">{Math.round((v.points / v.total) * 100)}%</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-l">
        {content ? <ReviewList items={review} seed={hashString(exam.id)} onlyMissedDefault={exam.kind === 'full'} /> : <div className="loading"><div className="spinner" /></div>}
      </div>
    </div>
  );
}
