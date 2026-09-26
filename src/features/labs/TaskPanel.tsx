import { useState } from 'react';
import { Check, ChevronDown, ChevronRight, Lightbulb } from 'lucide-react';
import type { Lab } from '../../content/labTypes';
import type { CheckResult } from '../../sim';
import { Rich } from '../../lib/rich';

export function TaskPanel({ lab, results }: { lab: Lab; results: Record<string, CheckResult[]> }) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [hints, setHints] = useState<Record<string, boolean>>({});
  const done = lab.tasks.filter((t) => results[t.id]?.every((r) => r.pass)).length;
  return (
    <div className="task-panel">
      <div className="row between">
        <div className="card-title">Tasks</div>
        <span className={`chip ${done === lab.tasks.length ? 'good' : ''}`}>{done} / {lab.tasks.length}</span>
      </div>
      <div className="bar thin mt-s mb"><span style={{ width: `${(done / lab.tasks.length) * 100}%`, background: 'var(--good)' }} /></div>
      <ol className="tasks">
        {lab.tasks.map((t, i) => {
          const rs = results[t.id] ?? [];
          const pass = rs.length > 0 && rs.every((r) => r.pass);
          const passed = rs.filter((r) => r.pass).length;
          const isOpen = open[t.id];
          return (
            <li key={t.id} className={`task ${pass ? 'pass' : ''}`}>
              <button className="task-head" onClick={() => setOpen({ ...open, [t.id]: !isOpen })}>
                <span className="task-check">{pass ? <Check size={13} /> : i + 1}</span>
                <Rich text={t.title} className="task-title" />
                {!pass && rs.length > 1 && <span className="tiny muted">{passed}/{rs.length}</span>}
                {isOpen ? <ChevronDown size={14} className="muted" /> : <ChevronRight size={14} className="muted" />}
              </button>
              {isOpen && (
                <div className="task-body">
                  {t.details && <Rich as="div" className="small" text={t.details} />}
                  <ul className="task-checks">
                    {rs.map((r, j) => (
                      <li key={j} className={r.pass ? 'ok' : 'no'}>
                        {r.pass ? '✓' : '·'} {r.detail}
                      </li>
                    ))}
                  </ul>
                  {t.hint && (
                    hints[t.id] ? (
                      <div className="callout accent small mt-s"><Lightbulb size={14} /> <Rich text={t.hint} /></div>
                    ) : (
                      <button className="btn ghost sm mt-s" onClick={() => setHints({ ...hints, [t.id]: true })}><Lightbulb size={13} /> Show hint</button>
                    )
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
