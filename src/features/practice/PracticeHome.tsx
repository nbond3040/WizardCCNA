import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Clock, History, ListChecks, RotateCcw, Timer, Trophy } from 'lucide-react';
import { EXAM_VERSIONS, MODULES, lessonInVersion } from '../../content/curriculum';
import { useAllLessons } from '../../content/registry';
import { useProgress } from '../../store/progress';
import { useExamVersion } from '../../store/version';
import { formatDate } from '../../lib/date';
import { PASSING_SCALED } from '../quiz/grading';
import { domainOf, poolSizeByDomain, versionQuestions } from './examBuilder';
import './practice.css';

export function PracticeHome() {
  const version = useExamVersion();
  const info = EXAM_VERSIONS[version];
  const { data: content, loading } = useAllLessons();
  const exams = useProgress((s) => s.exams);
  const stats = useProgress((s) => s.questions);
  const missed = useProgress((s) => s.missedQuestions);
  const navigate = useNavigate();
  const [allowBack, setAllowBack] = useState(false);
  const [custom, setCustom] = useState<{ domains: number[]; count: number; mode: 'study' | 'exam'; weak: boolean; module: string }>({
    domains: [],
    count: 20,
    mode: 'study',
    weak: true,
    module: '',
  });

  if (loading || !content) return <div className="page"><div className="loading"><div className="spinner" /> Loading question bank…</div></div>;

  const pool = versionQuestions(content, version);
  const byDomain = poolSizeByDomain(content, version);
  const poolKeys = new Set(pool.map((q) => q.key));
  const missedInPool = missed.filter((k) => poolKeys.has(k));
  const full = exams.filter((e) => e.kind === 'full').slice().reverse();
  const seed = () => Math.floor(Math.random() * 1e9);

  const domainAccuracy = info.domains.map((d) => {
    const qs = pool.filter((q) => domainOf(q, version) === d.num);
    let seen = 0;
    let correct = 0;
    qs.forEach((q) => {
      const s = stats[q.key];
      if (s) {
        seen += s.seen;
        correct += s.correct;
      }
    });
    return { d, seen, pct: seen ? correct / seen : null };
  });

  const start = (q: Record<string, string | number | boolean | undefined>) => {
    const p = new URLSearchParams();
    Object.entries(q).forEach(([k, v]) => v !== undefined && v !== '' && p.set(k, String(v)));
    navigate(`/practice/session?${p}`);
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="eyebrow">Practice</div>
          <h1>Practice exams</h1>
          <p>
            {pool.length} exam-style questions for {info.name}, weighted by the official blueprint. Wrong answers go to your missed-questions queue.
          </p>
        </div>
      </div>

      <div className="card exam-hero">
        <div className="row top" style={{ gap: 20, flexWrap: 'wrap' }}>
          <div className="exam-hero-icon"><Trophy size={22} /></div>
          <div style={{ flex: 1, minWidth: 260 }}>
            <h2>Full exam simulation</h2>
            <p className="muted mt-s">
              {info.questionCount} questions · {info.durationMin} minutes · weighted {info.domains.map((d) => `${d.weight}%`).join(' / ')} across {info.domains.length} domains.
              Scored 300–1000; about {PASSING_SCALED} is the commonly cited passing mark.
            </p>
            <label className="check mt">
              <input type="checkbox" checked={allowBack} onChange={(e) => setAllowBack(e.target.checked)} />
              <span className="small">Allow going back and flagging questions (the real exam does not)</span>
            </label>
            <div className="row mt">
              <button
                className="btn accent lg"
                disabled={pool.length < 20}
                onClick={() => start({ kind: 'full', count: Math.min(info.questionCount, pool.length), time: info.durationMin * 60, back: allowBack ? 1 : 0, mode: 'exam', seed: seed(), weak: 1 })}
              >
                <Timer size={16} /> Start exam
              </button>
              {pool.length < info.questionCount && <span className="small muted">Question bank is still growing ({pool.length} available).</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="grid c2 mt">
        <div className="card">
          <div className="row"><ListChecks size={18} /><div className="card-title">Custom practice</div></div>
          <div className="stack mt">
            <div className="field">
              <label>Domains</label>
              <div className="row wrap" style={{ gap: 6 }}>
                {info.domains.map((d) => {
                  const on = custom.domains.includes(d.num);
                  return (
                    <button
                      key={d.num}
                      className={`chip ${on ? 'solid' : ''}`}
                      style={{ cursor: 'pointer', height: 28 }}
                      onClick={() => setCustom({ ...custom, domains: on ? custom.domains.filter((x) => x !== d.num) : [...custom.domains, d.num] })}
                      title={d.title}
                    >
                      D{d.num} {d.title} <span className="faint">{byDomain[d.num] ?? 0}</span>
                    </button>
                  );
                })}
              </div>
              <div className="help">None selected = all domains.</div>
            </div>
            <div className="field">
              <label>Module (optional)</label>
              <select className="select" value={custom.module} onChange={(e) => setCustom({ ...custom, module: e.target.value })}>
                <option value="">Any module</option>
                {MODULES.filter((m) => m.lessons.some((l) => lessonInVersion(l, version))).map((m) => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </select>
            </div>
            <div className="row wrap">
              <div className="field">
                <label>Questions</label>
                <div className="segmented">
                  {[10, 20, 30, 50].map((n) => (
                    <button key={n} className={custom.count === n ? 'on' : ''} onClick={() => setCustom({ ...custom, count: n })}>{n}</button>
                  ))}
                </div>
              </div>
              <div className="field">
                <label>Mode</label>
                <div className="segmented">
                  <button className={custom.mode === 'study' ? 'on' : ''} onClick={() => setCustom({ ...custom, mode: 'study' })}>Study</button>
                  <button className={custom.mode === 'exam' ? 'on' : ''} onClick={() => setCustom({ ...custom, mode: 'exam' })}>Timed</button>
                </div>
              </div>
            </div>
            <label className="check">
              <input type="checkbox" checked={custom.weak} onChange={(e) => setCustom({ ...custom, weak: e.target.checked })} />
              <span className="small">Prioritize unseen and previously missed questions</span>
            </label>
            <div>
              <button
                className="btn primary"
                onClick={() =>
                  start({
                    kind: custom.module ? 'module' : custom.domains.length === 1 ? 'domain' : 'custom',
                    count: custom.count,
                    mode: custom.mode,
                    time: custom.mode === 'exam' ? Math.round(custom.count * 72) : undefined,
                    back: 1,
                    domains: custom.domains.join(','),
                    module: custom.module,
                    weak: custom.weak ? 1 : 0,
                    seed: seed(),
                  })
                }
              >
                Start practice
              </button>
            </div>
          </div>
        </div>

        <div className="stack">
          <div className="card">
            <div className="row"><RotateCcw size={18} /><div className="card-title">Missed questions</div></div>
            <p className="muted small mt-s">Questions you got wrong anywhere — quizzes or exams. Answer one correctly to clear it.</p>
            <div className="row mt">
              <button
                className="btn bad"
                disabled={!missedInPool.length}
                onClick={() => start({ kind: 'missed', count: Math.min(50, missedInPool.length), mode: 'study', seed: seed() })}
              >
                Review {missedInPool.length} missed
              </button>
            </div>
          </div>
          <div className="card">
            <div className="card-title">Accuracy by domain</div>
            <div className="stack s mt">
              {domainAccuracy.map(({ d, pct, seen }) => (
                <div key={d.num}>
                  <div className="row between small">
                    <span>D{d.num} · {d.title}</span>
                    <span className="muted num">{pct === null ? '—' : `${Math.round(pct * 100)}%`} <span className="faint">({seen})</span></span>
                  </div>
                  <div className={`bar thin mt-s ${pct !== null && pct >= 0.85 ? 'good' : ''}`}><span style={{ width: `${(pct ?? 0) * 100}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <h3 className="section-title"><span className="row" style={{ gap: 6 }}><History size={14} /> History</span></h3>
      {exams.length === 0 ? (
        <div className="empty">No attempts yet. Your first full simulation makes a great baseline.</div>
      ) : (
        <div className="list">
          {exams.slice().reverse().slice(0, 25).map((e) => (
            <Link key={e.id} to={`/practice/results/${e.id}`} className="list-item">
              <div className={`score-pill ${e.kind === 'full' ? (e.scaled >= PASSING_SCALED ? 'good' : 'bad') : ''}`}>{e.kind === 'full' ? e.scaled : `${Math.round(e.percent * 100)}%`}</div>
              <div style={{ flex: 1 }}>
                <div className="title">{e.title}</div>
                <div className="sub">
                  {formatDate(e.date, { year: true })} · {e.correct}/{e.total} correct · <Clock size={11} style={{ display: 'inline', verticalAlign: '-1px' }} /> {Math.round(e.durationSec / 60)} min · {e.version}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      {full.length > 0 && <p className="tiny muted mt">Best full-exam score: {Math.max(...full.map((e) => e.scaled))}</p>}
    </div>
  );
}
