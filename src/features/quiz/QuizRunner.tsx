import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Clock, Flag } from 'lucide-react';
import type { QuestionRef } from '../../content/registry';
import { useProgress } from '../../store/progress';
import { formatDuration } from '../../lib/date';
import { QuestionView } from './QuestionView';
import { emptyResponse, grade, isAnswered, type Response } from './grading';

export interface RunResult {
  items: { ref: QuestionRef; response: Response; points: number }[];
  correct: number;
  points: number;
  total: number;
  durationSec: number;
  startedAt: string;
}

interface Props {
  items: QuestionRef[];
  mode: 'study' | 'exam';
  seed: number;
  /** Seconds; exam mode only. */
  timeLimit?: number;
  /** Exam mode: allow going back and flagging (the real CCNA does not). */
  allowBack?: boolean;
  onFinish: (r: RunResult) => void;
  onExit?: () => void;
  title?: string;
}

export function QuizRunner({ items, mode, seed, timeLimit, allowBack = false, onFinish, onExit, title }: Props) {
  const recordAnswer = useProgress((s) => s.recordAnswer);
  const [idx, setIdx] = useState(0);
  const [responses, setResponses] = useState<Response[]>(() => items.map((it) => emptyResponse(it.question, seed)));
  const [revealed, setRevealed] = useState<boolean[]>(() => items.map(() => false));
  const [flags, setFlags] = useState<boolean[]>(() => items.map(() => false));
  const [startedAt] = useState(() => new Date().toISOString());
  const startMs = useRef(Date.now());
  const [now, setNow] = useState(Date.now());
  const finished = useRef(false);

  useEffect(() => {
    if (mode !== 'exam' || !timeLimit) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [mode, timeLimit]);

  const elapsed = Math.floor((now - startMs.current) / 1000);
  const remaining = timeLimit ? timeLimit - elapsed : undefined;

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    const graded = items.map((ref, i) => ({ ref, response: responses[i], points: grade(ref.question, responses[i]) }));
    // In study mode answers were already recorded when checked.
    if (mode === 'exam') graded.forEach((g) => recordAnswer(g.ref.key, g.points >= 0.999));
    onFinish({
      items: graded,
      correct: graded.filter((g) => g.points >= 0.999).length,
      points: graded.reduce((a, g) => a + g.points, 0),
      total: items.length,
      durationSec: Math.round((Date.now() - startMs.current) / 1000),
      startedAt,
    });
  };

  useEffect(() => {
    if (remaining !== undefined && remaining <= 0) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining]);

  const cur = items[idx];
  const answered = isAnswered(cur.question, responses[idx]);
  const isRevealed = revealed[idx];
  const last = idx === items.length - 1;

  const check = () => {
    const r = revealed.slice();
    r[idx] = true;
    setRevealed(r);
    recordAnswer(cur.key, grade(cur.question, responses[idx]) >= 0.999);
  };
  const next = () => (last ? finish() : setIdx(idx + 1));

  // keyboard: Enter = check/next
  const keyRef = useRef<() => void>(() => {});
  keyRef.current = () => {
    if (mode === 'study') {
      if (!isRevealed && answered) check();
      else if (isRevealed) next();
    }
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !(e.target instanceof HTMLInputElement && mode === 'exam')) {
        if (e.target instanceof HTMLButtonElement) return;
        keyRef.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mode]);

  const answeredCount = useMemo(() => items.filter((it, i) => isAnswered(it.question, responses[i])).length, [items, responses]);

  return (
    <div className="runner">
      <div className="runner-top">
        {onExit && (
          <button className="btn ghost sm" onClick={onExit}>
            <ArrowLeft size={14} /> Exit
          </button>
        )}
        {title && <div className="runner-title">{title}</div>}
        <div className="spacer" />
        {mode === 'exam' && remaining !== undefined && (
          <div className={`chip ${remaining < 300 ? 'bad' : ''}`}>
            <Clock size={12} /> {formatDuration(remaining)}
          </div>
        )}
        <div className="chip">
          {idx + 1} / {items.length}
        </div>
      </div>
      <div className="bar thin" style={{ marginBottom: 24 }}>
        <span style={{ width: `${((mode === 'exam' ? answeredCount : idx + (isRevealed ? 1 : 0)) / items.length) * 100}%` }} />
      </div>

      <div className="card runner-card">
        <QuestionView
          key={cur.key + idx}
          q={cur.question}
          value={responses[idx]}
          onChange={(r) => {
            const next = responses.slice();
            next[idx] = r;
            setResponses(next);
          }}
          reveal={mode === 'study' && isRevealed}
          seed={seed}
          number={idx + 1}
          total={items.length}
        />
      </div>

      <div className="runner-actions">
        {mode === 'exam' && allowBack && (
          <>
            <button className="btn" onClick={() => setIdx(Math.max(0, idx - 1))} disabled={idx === 0}>
              <ArrowLeft size={15} /> Back
            </button>
            <button
              className={`btn ${flags[idx] ? 'accent' : ''}`}
              onClick={() => {
                const f = flags.slice();
                f[idx] = !f[idx];
                setFlags(f);
              }}
            >
              <Flag size={14} /> {flags[idx] ? 'Flagged' : 'Flag'}
            </button>
          </>
        )}
        <div className="spacer" />
        {mode === 'study' ? (
          !isRevealed ? (
            <button className="btn primary lg" onClick={check} disabled={!answered}>
              Check answer
            </button>
          ) : (
            <button className="btn primary lg" onClick={next}>
              {last ? 'See results' : 'Next question'} <ArrowRight size={16} />
            </button>
          )
        ) : last ? (
          <button className="btn accent lg" onClick={finish}>
            Finish exam
          </button>
        ) : (
          <button className="btn primary lg" onClick={next}>
            {answered ? 'Next' : 'Skip'} <ArrowRight size={16} />
          </button>
        )}
      </div>

      {mode === 'exam' && allowBack && (
        <div className="runner-map">
          {items.map((it, i) => (
            <button
              key={it.key + i}
              className={`map-cell ${i === idx ? 'cur' : ''} ${isAnswered(it.question, responses[i]) ? 'ans' : ''} ${flags[i] ? 'flag' : ''}`}
              onClick={() => setIdx(i)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
