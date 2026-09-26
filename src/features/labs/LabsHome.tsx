import { Link } from 'react-router';
import { Check, Clock, FlaskConical } from 'lucide-react';
import { LESSON_BY_ID, LESSONS } from '../../content/curriculum';
import { useAllLabs } from '../../content/registry';
import { useProgress } from '../../store/progress';

export function LabsHome() {
  const { data: labs, loading } = useAllLabs();
  const progress = useProgress((s) => s.labs);
  if (loading || !labs) return <div className="page"><div className="loading"><div className="spinner" /> Loading labs…</div></div>;
  const order = new Map(LESSONS.map((l, i) => [l.id, i]));
  const list = Object.values(labs).sort((a, b) => Math.max(...a.lessons.map((x) => order.get(x) ?? 0)) - Math.max(...b.lessons.map((x) => order.get(x) ?? 0)));
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="eyebrow">Labs</div>
          <h1>Hands-on labs</h1>
          <p>Configure real IOS commands on simulated routers, switches and PCs. Tasks are checked live as you type.</p>
        </div>
      </div>
      {list.length === 0 ? (
        <div className="empty">Labs are being built.</div>
      ) : (
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
      )}
    </div>
  );
}
