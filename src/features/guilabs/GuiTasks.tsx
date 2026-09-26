import { useState } from 'react';
import { Check, Lightbulb } from 'lucide-react';
import { Rich } from '../../lib/rich';

export interface GuiTaskResult {
  id: string;
  title: string;
  hint?: string;
  result: string | true;
}

export function GuiTasks({ tasks }: { tasks: GuiTaskResult[] }) {
  const [hints, setHints] = useState<Record<string, boolean>>({});
  const done = tasks.filter((t) => t.result === true).length;
  return (
    <div className="task-panel">
      <div className="row between">
        <div className="card-title">Tasks</div>
        <span className={`chip ${done === tasks.length ? 'good' : ''}`}>{done} / {tasks.length}</span>
      </div>
      <div className="bar thin mt-s mb"><span style={{ width: `${(done / tasks.length) * 100}%`, background: 'var(--good)' }} /></div>
      <ol className="tasks">
        {tasks.map((t, i) => {
          const pass = t.result === true;
          return (
            <li key={t.id} className={`task ${pass ? 'pass' : ''}`}>
              <div className="task-head" style={{ cursor: 'default' }}>
                <span className="task-check">{pass ? <Check size={13} /> : i + 1}</span>
                <Rich text={t.title} className="task-title" />
              </div>
              {!pass && (
                <div className="task-body">
                  <div className="tiny muted">{t.result}</div>
                  {t.hint &&
                    (hints[t.id] ? (
                      <div className="callout accent small mt-s"><Lightbulb size={14} /> <Rich text={t.hint} /></div>
                    ) : (
                      <button className="btn ghost sm mt-s" onClick={() => setHints({ ...hints, [t.id]: true })}><Lightbulb size={13} /> Hint</button>
                    ))}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
