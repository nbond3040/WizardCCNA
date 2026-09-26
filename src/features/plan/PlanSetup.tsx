import { useMemo, useState } from 'react';
import { GUI_LABS } from '../guilabs/registry';
import { CalendarDays } from 'lucide-react';
import { EXAM_VERSIONS, versionForDate, type ExamVersion } from '../../content/curriculum';
import { useAllLabs } from '../../content/registry';
import { useProgress, type PlanSettings } from '../../store/progress';
import { addDays, DAY_LETTERS, DAY_NAMES, formatDate, formatMinutes, today } from '../../lib/date';
import { computePlan } from './planner';

const QUICK = [
  { label: '4 weeks', days: 28 },
  { label: '8 weeks', days: 56 },
  { label: '12 weeks', days: 84 },
  { label: '16 weeks', days: 112 },
  { label: '6 months', days: 182 },
];

export function PlanSetup({ onDone, initial }: { onDone?: () => void; initial?: PlanSettings | null }) {
  const setPlan = useProgress((s) => s.setPlan);
  const lessons = useProgress((s) => s.lessons);
  const labs = useProgress((s) => s.labs);
  const exams = useProgress((s) => s.exams);
  const { data: labDefs } = useAllLabs();
  const t = today();
  const [goal, setGoal] = useState(initial?.goalDate ?? addDays(t, 84));
  const [days, setDays] = useState<number[]>(initial?.studyDays ?? [1, 2, 3, 4, 5, 6]);
  const [daily, setDaily] = useState<number | null>(initial?.dailyMinutes ?? null);
  const [version, setVersion] = useState<'auto' | ExamVersion>(initial?.version ?? 'auto');
  const [experience, setExperience] = useState<PlanSettings['experience']>(initial?.experience ?? 'new');

  const draft: PlanSettings = {
    goalDate: goal,
    startDate: initial?.startDate && initial.goalDate === goal ? initial.startDate : t,
    version,
    studyDays: days,
    dailyMinutes: daily,
    experience,
    createdAt: initial?.createdAt ?? t,
  };
  const resolved: ExamVersion = version === 'auto' ? versionForDate(goal) : version;
  const preview = useMemo(
    () => (goal > t && days.length ? computePlan({ plan: draft, version: resolved, lessons, labs, labDefs: [...Object.values(labDefs ?? {}), ...GUI_LABS], exams, today: t }) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [goal, days.join(','), daily, version, experience, labDefs, lessons, labs, exams],
  );

  const autoV = versionForDate(goal);
  const valid = goal > t && days.length > 0;

  return (
    <div className="card plan-setup">
      <div className="row"><CalendarDays size={18} /><h2>When is your exam?</h2></div>
      <p className="muted mt-s">Pick a target date. WizardCCNA builds a day-by-day path — lessons, labs, checkpoints and practice exams — and re-plans automatically as you go.</p>

      <div className="grid c2 mt-l" style={{ gap: 28 }}>
        <div className="stack l">
          <div className="field">
            <label>Exam date</label>
            <input className="input" type="date" value={goal} min={addDays(t, 1)} onChange={(e) => setGoal(e.target.value)} />
            <div className="row wrap" style={{ gap: 6 }}>
              {QUICK.map((q) => (
                <button key={q.label} className={`chip ${goal === addDays(t, q.days) ? 'solid' : ''}`} style={{ cursor: 'pointer', height: 26 }} onClick={() => setGoal(addDays(t, q.days))}>
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label>Study days</label>
            <div className="daypicker">
              {DAY_LETTERS.map((d, i) => (
                <button key={i} className={days.includes(i) ? 'on' : ''} title={DAY_NAMES[i]} onClick={() => setDays(days.includes(i) ? days.filter((x) => x !== i) : [...days, i].sort())}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label>Daily study time</label>
            <div className="segmented" style={{ flexWrap: 'wrap' }}>
              <button className={daily === null ? 'on' : ''} onClick={() => setDaily(null)}>Pace me</button>
              {[30, 45, 60, 90, 120, 180].map((m) => (
                <button key={m} className={daily === m ? 'on' : ''} onClick={() => setDaily(m)}>{m < 60 ? `${m}m` : `${m / 60}h`}</button>
              ))}
            </div>
            <div className="help">“Pace me” computes exactly how much you need each day to be ready on time.</div>
          </div>

          <div className="field">
            <label>Networking experience</label>
            <div className="segmented">
              <button className={experience === 'new' ? 'on' : ''} onClick={() => setExperience('new')}>New</button>
              <button className={experience === 'some' ? 'on' : ''} onClick={() => setExperience('some')}>Some</button>
              <button className={experience === 'experienced' ? 'on' : ''} onClick={() => setExperience('experienced')}>Experienced</button>
            </div>
          </div>
        </div>

        <div className="stack l">
          <div className="field">
            <label>Exam version</label>
            <div className="segmented">
              <button className={version === 'auto' ? 'on' : ''} onClick={() => setVersion('auto')}>Auto ({autoV})</button>
              <button className={version === 'v1.1' ? 'on' : ''} onClick={() => setVersion('v1.1')}>v1.1</button>
              <button className={version === 'v2.0' ? 'on' : ''} onClick={() => setVersion('v2.0')}>v2.0</button>
            </div>
            <div className="help">
              CCNA 200-301 v1.1 is the live exam through {formatDate(EXAM_VERSIONS['v1.1'].until!, { year: true })}; v2.0 starts {formatDate(EXAM_VERSIONS['v2.0'].from!, { year: true })}. Your date selects <strong>{autoV}</strong>
              {version !== 'auto' && version !== autoV ? ` — but you chose ${version}; make sure it matches the exam you book.` : '.'}
            </div>
          </div>

          <div className="plan-preview">
            {preview ? (
              <>
                <div className="eyebrow">Your path</div>
                <div className="plan-preview-big">
                  {daily ? formatMinutes(daily) : formatMinutes(preview.dailyBudget)} <span className="muted">/ study day</span>
                </div>
                <div className="small muted mt-s">
                  {preview.studyDaysLeft} study days · {preview.items.filter((i) => !i.done).length} activities · {formatMinutes(preview.remainingMinutes)} of work + daily flashcards
                </div>
                <div className="small mt-s">
                  {EXAM_VERSIONS[resolved].name} · {preview.items.filter((i) => i.type === 'lesson').length} lessons · {preview.items.filter((i) => i.type === 'lab').length} labs · 3 full practice exams
                </div>
                {preview.status === 'no-time' ? (
                  <div className="callout bad mt small">
                    At this pace you would finish on {preview.finishDate ? formatDate(preview.finishDate, { year: true }) : '—'}, after your exam. You need about {formatMinutes(preview.requiredDaily)} per study day, more study days, or a later date.
                  </div>
                ) : (
                  <div className="callout good mt small">Ready by {preview.finishDate ? formatDate(preview.finishDate, { weekday: true, year: true }) : '—'}, the day before your exam at the latest.</div>
                )}
              </>
            ) : (
              <div className="muted small">Choose a future date and at least one study day.</div>
            )}
          </div>
        </div>
      </div>

      <div className="row mt-l">
        <button
          className="btn accent lg"
          disabled={!valid}
          onClick={() => {
            setPlan(draft);
            onDone?.();
          }}
        >
          {initial ? 'Update my plan' : 'Create my plan'}
        </button>
        {onDone && initial && (
          <button className="btn ghost lg" onClick={onDone}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
