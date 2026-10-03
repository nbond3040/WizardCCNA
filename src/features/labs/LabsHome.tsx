import { Link } from 'react-router';
import { Check, Clock, FlaskConical } from 'lucide-react';
import { LESSON_BY_ID, LESSONS, MODULES } from '../../content/curriculum';
import { useAllLabs } from '../../content/registry';
import { useProgress } from '../../store/progress';
import { GUI_LABS } from '../guilabs/registry';
import '../flashcards/flashcards.css';

interface LabRow {
  id: string;
  title: string;
  summary: string;
  difficulty: 1 | 2 | 3;
  minutes: number;
  lessons: string[];
}

export function LabsHome() {
  const { data: labs, loading } = useAllLabs();
  const progress = useProgress((s) => s.labs);
  if (loading && !labs) return <div className="page"><div className="loading"><div className="spinner" /> Loading labs…</div></div>;

  const order = new Map(LESSONS.map((l, i) => [l.id, i]));
  const rows: LabRow[] = [...Object.values(labs ?? {}), ...GUI_LABS];
  const lastLesson = (l: LabRow) => l.lessons.slice().sort((a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0)).pop() ?? '';
  const done = rows.filter((l) => progress[l.id]?.completedAt).length;

  const groups = MODULES.map((m) => ({
    module: m,
    labs: rows
      .filter((l) => LESSON_BY_ID[lastLesson(l)]?.moduleId === m.id)
      .sort((a, b) => (order.get(lastLesson(a)) ?? 0) - (order.get(lastLesson(b)) ?? 0) || a.difficulty - b.difficulty),
  })).filter((g) => g.labs.length);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="eyebrow">Labs</div>
          <h1>Hands-on labs</h1>
          <p>Configure real IOS commands on simulated routers, switches and PCs. Tasks are checked live as you type.</p>
        </div>
        <div className="stat" style={{ textAlign: 'right' }}>
          <div className="v">{done}<span className="muted" style={{ fontSize: 16 }}> / {rows.length}</span></div>
          <div className="k">labs completed</div>
        </div>
      </div>
      {rows.length === 0 ? (
        <div className="empty">Labs are being built.</div>
      ) : (
        groups.map(({ module, labs: list }) => (
          <div key={module.id} className="mt">
            <div className="fc-module">{module.title}</div>
            <div className="list">
              {list.map((l) => {
                const p = progress[l.id];
                return (
                  <Link key={l.id} to={`/labs/${l.id}`} className="list-item">
                    <span className="lesson-status" style={{ color: p?.completedAt ? 'var(--good)' : 'var(--text-2)' }}>{p?.completedAt ? <Check size={15} /> : <FlaskConical size={15} />}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="title">{l.title}</div>
                      <div className="sub">{l.summary}</div>
                      <div className="tiny muted mt-s">{l.lessons.map((x) => LESSON_BY_ID[x]?.title).filter(Boolean).join(' · ')}</div>
                    </div>
                    <span className="chip">{['', 'Guided', 'Standard', 'Challenge'][l.difficulty]}</span>
                    <span className="tiny muted row" style={{ gap: 4 }}><Clock size={12} /> {l.minutes}m</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
