import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, ArrowRight, Check, Flame, Shuffle, Timer, X, Zap } from 'lucide-react';
import { DRILLS, DRILL_BY_ID, MIXED_IDS, checkAnswer, type Problem } from './generators';
import { useProgress } from '../../store/progress';
import { formatDuration } from '../../lib/date';
import './drills.css';

const BEST_KEY = 'wizardccna-drill-best';

function loadBest(): Record<string, { streak: number; sprint: number }> {
  try {
    return JSON.parse(localStorage.getItem(BEST_KEY) ?? '{}');
  } catch {
    return {};
  }
}
function saveBest(b: Record<string, { streak: number; sprint: number }>) {
  try {
    localStorage.setItem(BEST_KEY, JSON.stringify(b));
  } catch {
    /* ignore */
  }
}

export function DrillsHome() {
  const params = useParams();
  const id = params['*'] || '';
  if (id) return <DrillSession key={id} id={id} />;
  const best = loadBest();
  const groups = ['IPv4', 'IPv6', 'Conversions'] as const;
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="eyebrow">Drills</div>
          <h1>Speed drills</h1>
          <p>Unlimited generated problems with worked explanations. The CCNA rewards fast, accurate subnetting — aim for a 20-streak and under 30 seconds per problem.</p>
        </div>
      </div>
      <div className="grid c2">
        <Link to="/drills/mixed" className="card hover drill-hero">
          <Shuffle size={20} />
          <div>
            <div className="card-title">Mixed subnetting</div>
            <div className="small muted">Network IDs, broadcasts, ranges, masks, wildcards and summaries — shuffled.</div>
          </div>
          <ArrowRight size={18} className="muted" />
        </Link>
        <Link to="/drills/mixed?sprint=1" className="card hover drill-hero">
          <Timer size={20} />
          <div>
            <div className="card-title">3-minute sprint</div>
            <div className="small muted">How many can you solve in 180 seconds? Best: {best.mixed?.sprint ?? 0}</div>
          </div>
          <ArrowRight size={18} className="muted" />
        </Link>
      </div>
      {groups.map((g) => (
        <div key={g}>
          <h3 className="section-title">{g}</h3>
          <div className="grid c3">
            {DRILLS.filter((d) => d.group === g).map((d) => (
              <Link key={d.id} to={`/drills/${d.id}`} className="card hover tight">
                <div className="row between">
                  <div className="card-title">{d.title}</div>
                  {best[d.id]?.streak ? <span className="chip"><Flame size={11} /> {best[d.id].streak}</span> : null}
                </div>
                <div className="small muted mt-s">{d.blurb}</div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function DrillSession({ id }: { id: string }) {
  const sprint = new URLSearchParams(window.location.hash.split('?')[1] ?? '').get('sprint') === '1';
  const ids = id === 'mixed' ? MIXED_IDS : [id];
  const def = DRILL_BY_ID[id];
  const logMinutes = useProgress((s) => s.logMinutes);
  const make = (): Problem & { drill: string } => {
    const d = ids[Math.floor(Math.random() * ids.length)];
    return { ...DRILL_BY_ID[d].gen(Math.random), drill: d };
  };
  const [problem, setProblem] = useState(make);
  const [value, setValue] = useState('');
  const [result, setResult] = useState<null | boolean>(null);
  const [stats, setStats] = useState({ right: 0, wrong: 0, streak: 0, best: 0 });
  const [startedAt] = useState(Date.now());
  const [qStart, setQStart] = useState(Date.now());
  const [times, setTimes] = useState<number[]>([]);
  const [now, setNow] = useState(Date.now());
  const inputRef = useRef<HTMLInputElement>(null);
  const SPRINT = 180;
  const remaining = sprint ? Math.max(0, SPRINT - Math.floor((now - startedAt) / 1000)) : 0;
  const over = sprint && remaining === 0;

  useEffect(() => {
    if (!sprint) return;
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, [sprint]);
  useEffect(() => () => {
    const min = (Date.now() - startedAt) / 60000;
    if (min >= 0.5) logMinutes(Math.round(Math.min(min, 90)));
  }, [startedAt, logMinutes]);
  useEffect(() => {
    inputRef.current?.focus();
  }, [problem]);

  const bestAll = useMemo(loadBest, []);

  const submit = (answer: string) => {
    if (result !== null || over) return;
    const ok = checkAnswer(problem, answer);
    setResult(ok);
    setTimes((t) => [...t, (Date.now() - qStart) / 1000]);
    setStats((s) => {
      const streak = ok ? s.streak + 1 : 0;
      const next = { right: s.right + (ok ? 1 : 0), wrong: s.wrong + (ok ? 0 : 1), streak, best: Math.max(s.best, streak) };
      const b = loadBest();
      const cur = b[id] ?? { streak: 0, sprint: 0 };
      b[id] = { streak: Math.max(cur.streak, next.best), sprint: sprint ? Math.max(cur.sprint, next.right) : cur.sprint };
      saveBest(b);
      return next;
    });
    if (sprint && ok) {
      // sprints move on immediately after a correct answer
      window.setTimeout(nextProblem, 350);
    }
  };
  const nextProblem = () => {
    setProblem(make());
    setValue('');
    setResult(null);
    setQStart(Date.now());
  };

  const avg = times.length ? times.reduce((a, b) => a + b, 0) / times.length : 0;
  const title = id === 'mixed' ? (sprint ? '3-minute sprint' : 'Mixed subnetting') : def?.title ?? 'Drill';

  return (
    <div className="page">
      <div className="row mb">
        <Link to="/drills" className="btn ghost sm"><ArrowLeft size={14} /> Drills</Link>
        <div className="runner-title">{title}</div>
        <div className="spacer" />
        {sprint && <span className={`chip ${remaining < 20 ? 'bad' : ''}`}><Timer size={12} /> {formatDuration(remaining)}</span>}
        <span className="chip good"><Check size={11} /> {stats.right}</span>
        <span className="chip bad"><X size={11} /> {stats.wrong}</span>
        <span className="chip"><Flame size={11} /> {stats.streak}</span>
        {times.length > 0 && <span className="chip"><Zap size={11} /> {avg.toFixed(1)}s</span>}
      </div>

      {over ? (
        <div className="card deck-done" style={{ textAlign: 'center', padding: 40 }}>
          <h2>Time!</h2>
          <p className="mt-s">You solved <strong>{stats.right}</strong> problems ({stats.wrong} wrong). Best sprint: {Math.max(bestAll[id]?.sprint ?? 0, stats.right)}.</p>
          <div className="row mt-l" style={{ justifyContent: 'center' }}>
            <Link to="/drills" className="btn">Back to drills</Link>
            <button className="btn primary" onClick={() => window.location.reload()}>Go again</button>
          </div>
        </div>
      ) : (
        <div className="card drill-card">
          {problem.given && <div className="drill-given mono">{problem.given}</div>}
          <div className="drill-prompt">{problem.prompt.replace(/`/g, '')}</div>
          {problem.choices ? (
            <div className="drill-choices">
              {problem.choices.map((c) => {
                const cls = result === null ? '' : problem.answers.includes(c) ? 'right' : value === c ? 'wrong' : 'dim';
                return (
                  <button key={c} className={`choice ${cls}`} onClick={() => { setValue(c); submit(c); }} disabled={result !== null}>
                    {c}
                  </button>
                );
              })}
            </div>
          ) : (
            <form
              className="drill-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (result === null) submit(value);
                else nextProblem();
              }}
            >
              <input
                ref={inputRef}
                className={`input mono drill-input ${result === null ? '' : result ? 'ok' : 'no'}`}
                value={value}
                onChange={(e) => result === null && setValue(e.target.value)}
                placeholder={problem.placeholder}
                autoComplete="off"
                spellCheck={false}
              />
              <button className="btn primary lg" type="submit">{result === null ? 'Check' : 'Next'}</button>
            </form>
          )}
          {result !== null && (
            <div className={`q-feedback mt ${result ? 'good' : 'bad'}`}>
              <div className="q-verdict">{result ? <Check size={16} /> : <X size={16} />} {result ? 'Correct' : `Answer: ${problem.answers[0]}`}</div>
              <ol className="drill-explain">
                {problem.explain.map((l, i) => <li key={i}>{l}</li>)}
              </ol>
            </div>
          )}
          {result !== null && problem.choices && (
            <div className="row mt"><button className="btn primary" onClick={nextProblem} autoFocus>Next <ArrowRight size={15} /></button></div>
          )}
          <div className="tiny muted mt">Press <span className="kbd">Enter</span> to check, then again for the next problem.</div>
        </div>
      )}
    </div>
  );
}
