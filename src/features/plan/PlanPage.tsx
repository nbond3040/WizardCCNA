import { useState } from 'react';
import { Link } from 'react-router';
import { Check, ChevronDown, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import { EXAM_VERSIONS } from '../../content/curriculum';
import { useProgress } from '../../store/progress';
import { formatDate, formatMinutes, relativeDay, today } from '../../lib/date';
import { PlanSetup } from './PlanSetup';
import { usePlan } from './usePlan';
import { ITEM_ICON, ITEM_LABEL } from './itemMeta';
import type { PlanDay, PlanResult } from './planner';
import './plan.css';

export function StatusChip({ r }: { r: PlanResult }) {
  const map = {
    ahead: ['good', 'Ahead of schedule'],
    'on-track': ['good', 'On track'],
    behind: ['warn', 'Behind — daily load increased'],
    'no-time': ['bad', 'Not enough time'],
    done: ['good', 'Plan complete'],
    'not-started': ['', 'Ready to start'],
  } as const;
  const [cls, label] = map[r.status];
  return <span className={`chip ${cls}`}>{label}</span>;
}

function weekKey(date: string) {
  const d = new Date(date + 'T00:00:00');
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return monday.toISOString().slice(0, 10);
}

export function PlanPage() {
  const plan = useProgress((s) => s.plan);
  const setPlan = useProgress((s) => s.setPlan);
  const r = usePlan();
  const [editing, setEditing] = useState(false);
  const [openWeeks, setOpenWeeks] = useState<Record<string, boolean>>({});

  if (!plan || editing || !r) {
    return (
      <div className="page">
        <div className="page-head">
          <div>
            <div className="eyebrow">Study plan</div>
            <h1>{plan ? 'Edit your plan' : 'Build your path to the CCNA'}</h1>
          </div>
        </div>
        <PlanSetup initial={plan} onDone={() => setEditing(false)} />
      </div>
    );
  }

  const info = EXAM_VERSIONS[r.version];
  const learn = r.items.filter((i) => i.phase === 'learn');
  const final = r.items.filter((i) => i.phase === 'final');
  const t = today();

  const weeks: { key: string; days: PlanDay[] }[] = [];
  for (const d of r.days) {
    const k = weekKey(d.date);
    const w = weeks.find((x) => x.key === k);
    if (w) w.days.push(d);
    else weeks.push({ key: k, days: [d] });
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="eyebrow">Study plan · {info.name}</div>
          <h1>Exam on {formatDate(plan.goalDate, { weekday: true, year: true })}</h1>
          <p>
            {r.daysLeft} days to go · {r.studyDaysLeft} study days left · about <strong>{formatMinutes(r.dailyBudget)}</strong> per study day including {`15 min`} of flashcards.
          </p>
        </div>
        <div className="row">
          <StatusChip r={r} />
          <button className="btn" onClick={() => setEditing(true)}><Pencil size={14} /> Edit</button>
          <button className="btn ghost danger" onClick={() => confirm('Delete your study plan? Progress is kept.') && setPlan(null)}><Trash2 size={14} /></button>
        </div>
      </div>

      {r.status === 'no-time' && (
        <div className="callout bad mb">
          At {formatMinutes(r.dailyBudget)} per day you'd finish on {r.finishDate ? formatDate(r.finishDate, { year: true }) : '—'} — after your exam. You need about {formatMinutes(r.requiredDaily)} per study day. Edit the plan to add time or move the date.
        </div>
      )}
      {r.status === 'behind' && (
        <div className="callout warn mb">You're about {formatMinutes(-r.paceDelta)} behind the original pace. The remaining work has been spread over your remaining days — {formatMinutes(r.dailyBudget)} per day now.</div>
      )}

      <div className="grid c3">
        <div className="card">
          <div className="stat"><div className="k">Overall</div><div className="v">{Math.round((r.doneMinutes / Math.max(1, r.totalMinutes)) * 100)}%</div><div className="s">{formatMinutes(r.doneMinutes)} of {formatMinutes(r.totalMinutes)}</div></div>
          <div className="bar mt"><span style={{ width: `${(r.doneMinutes / Math.max(1, r.totalMinutes)) * 100}%` }} /></div>
        </div>
        <div className="card">
          <div className="stat"><div className="k">Phase 1 · Learn</div><div className="v">{learn.filter((i) => i.done).length}<span className="muted" style={{ fontSize: 16 }}> / {learn.length}</span></div><div className="s">lessons, labs & checkpoints</div></div>
          <div className="bar mt accent"><span style={{ width: `${(learn.filter((i) => i.done).length / Math.max(1, learn.length)) * 100}%` }} /></div>
        </div>
        <div className="card">
          <div className="stat"><div className="k">Phase 2 · Exam readiness</div><div className="v">{final.filter((i) => i.done).length}<span className="muted" style={{ fontSize: 16 }}> / {final.length}</span></div><div className="s">practice exams & reviews</div></div>
          <div className="bar mt good"><span style={{ width: `${(final.filter((i) => i.done).length / Math.max(1, final.length)) * 100}%` }} /></div>
        </div>
      </div>

      <h3 className="section-title">Your path</h3>
      <div className="stack">
        {weeks.map((w, wi) => {
          const open = openWeeks[w.key] ?? wi < 2;
          const mins = w.days.reduce((a, d) => a + d.minutes + (d.items.length ? d.flashcardMinutes : 0), 0);
          const doneCount = w.days.flatMap((d) => d.items).filter((i) => i.done).length;
          const total = w.days.flatMap((d) => d.items).length;
          return (
            <div key={w.key} className="week">
              <button className="week-head" onClick={() => setOpenWeeks({ ...openWeeks, [w.key]: !open })}>
                {open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                <span className="week-title">Week of {formatDate(w.key)}</span>
                <span className="muted small">{total} activities · {formatMinutes(mins)}</span>
                {w.days.some((d) => d.overflow) && <span className="chip bad">after exam date</span>}
                <span className="spacer" />
                {doneCount > 0 && <span className="chip good">{doneCount} done</span>}
              </button>
              {open && (
                <div className="week-days">
                  {w.days.map((d) => (
                    <div key={d.date} className={`day ${d.date === t ? 'today' : ''} ${d.overflow ? 'overflow' : ''}`}>
                      <div className="day-label">
                        <div className="day-name">{relativeDay(d.date)}</div>
                        <div className="tiny muted">{formatDate(d.date)}</div>
                      </div>
                      <div className="day-items">
                        {d.items.length === 0 && <div className="muted small">Flashcards & review</div>}
                        {d.items.map((it) => {
                          const Icon = ITEM_ICON[it.type];
                          return (
                            <Link key={it.id} to={it.href} className={`day-item t-${it.type} ${it.done ? 'done' : ''}`}>
                              <span className="day-item-icon">{it.done ? <Check size={13} /> : <Icon size={13} />}</span>
                              <span className="day-item-title">{it.title}</span>
                              <span className="day-item-meta">{ITEM_LABEL[it.type]} · {formatMinutes(it.minutes)}</span>
                            </Link>
                          );
                        })}
                      </div>
                      <div className="day-mins muted small num">{d.items.length ? formatMinutes(d.minutes + d.flashcardMinutes) : ''}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <div className="day exam-day">
          <div className="day-label"><div className="day-name">Exam day</div><div className="tiny muted">{formatDate(plan.goalDate, { weekday: true })}</div></div>
          <div className="day-items"><div className="small">{info.name} · {info.durationMin} minutes. Light flashcard review only — you've got this.</div></div>
        </div>
      </div>
    </div>
  );
}
