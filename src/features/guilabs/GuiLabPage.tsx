import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Check, RotateCcw } from 'lucide-react';
import { LESSON_BY_ID } from '../../content/curriculum';
import { clearLabSnapshot, loadLabSnapshot, saveLabSnapshot, useProgress } from '../../store/progress';
import { Rich } from '../../lib/rich';
import type { GuiLabMeta } from './registry';
import { WlcGui } from './WlcGui';
import { initialWlc, WLC_LABS, type WlcState } from './wlcModel';
import { ApiSandbox } from './ApiSandbox';
import { API_TASKS, initialApi, type ApiState } from './apiModel';
import { GuiTasks, type GuiTaskResult } from './GuiTasks';
import '../labs/labs.css';

type Saved = { wlc?: WlcState; api?: ApiState; answers?: Record<string, string> };

const API_SCENARIO =
  'Your team is automating inventory reports with the **Catalyst Center Intent API** (northbound REST API). The sandbox controller accepts the credentials **devnetuser / Cisco123!**. Authenticate for a token, pull the device inventory, read values out of the JSON response, filter with a query parameter, and create a new area in the site hierarchy.';

export function GuiLabPage({ meta }: { meta: GuiLabMeta }) {
  const [saved, setSaved] = useState<Saved>(() => loadLabSnapshot<Saved>(meta.id) ?? {});
  const setLabTasks = useProgress((s) => s.setLabTasks);
  const completedAt = useProgress((s) => s.labs[meta.id]?.completedAt);
  const wlc = saved.wlc ?? initialWlc();
  const api = saved.api ?? initialApi();
  const answers = saved.answers ?? {};

  const tasks: GuiTaskResult[] = useMemo(() => {
    if (meta.kind === 'wlc') return (WLC_LABS[meta.id]?.tasks ?? []).map((t) => ({ id: t.id, title: t.title, hint: t.hint, result: t.check(wlc) }));
    return API_TASKS.map((t) => ({
      id: t.id,
      title: t.title,
      hint: t.hint,
      result: t.answer
        ? t.answer.some((a) => a.toLowerCase() === (answers[t.id] ?? '').trim().toLowerCase()) || (answers[t.id] ? 'Not quite — check the response again' : 'Answer below')
        : t.check!(api),
    }));
  }, [meta, wlc, api, answers]);

  useEffect(() => {
    saveLabSnapshot(meta.id, saved);
    const done = tasks.filter((t) => t.result === true).map((t) => t.id);
    setLabTasks(meta.id, done, done.length === tasks.length);
  }, [saved, tasks, meta.id, setLabTasks]);

  const allDone = tasks.every((t) => t.result === true);
  const scenario = meta.kind === 'wlc' ? WLC_LABS[meta.id]?.scenario ?? '' : API_SCENARIO;

  return (
    <div className="page wide lab-page">
      <div className="row mb wrap">
        <Link to="/labs" className="btn ghost sm"><ArrowLeft size={14} /> Labs</Link>
        <h2 style={{ fontSize: 20 }}>{meta.title}</h2>
        <span className="chip">{['', 'Guided', 'Standard', 'Challenge'][meta.difficulty]}</span>
        <span className="chip">{meta.minutes} min</span>
        {completedAt && <span className="chip good"><Check size={11} /> Completed</span>}
        <div className="spacer" />
        <button className="btn sm ghost" onClick={() => { if (confirm('Reset this lab?')) { clearLabSnapshot(meta.id); setSaved({}); } }}><RotateCcw size={13} /> Reset</button>
      </div>
      {allDone && <div className="callout good mb"><Check size={16} /> <strong>Lab complete.</strong> Every task passes.</div>}
      <div className="lab-grid">
        <div className="lab-main">
          {meta.kind === 'wlc' ? (
            <WlcGui state={wlc} onApply={(s) => setSaved({ ...saved, wlc: s })} />
          ) : (
            <ApiSandbox state={api} onState={(s) => setSaved({ ...saved, api: s })} />
          )}
        </div>
        <div className="lab-side">
          <div className="card">
            <div className="card-title">Scenario</div>
            <Rich as="div" className="small mt-s" text={scenario} />
            <div className="tiny muted mt">
              Reinforces: {meta.lessons.map((l, i) => <span key={l}>{i > 0 && ', '}<Link to={`/learn/${l}`} style={{ textDecoration: 'underline' }}>{LESSON_BY_ID[l]?.title ?? l}</Link></span>)}
            </div>
          </div>
          <div className="card">
            <GuiTasks tasks={tasks} />
            {meta.kind === 'api' && (
              <div className="stack s mt">
                {API_TASKS.filter((t) => t.answer).map((t) => (
                  <label key={t.id} className="field">
                    <span className="label">Answer: {t.id === 'serial' ? 'serial number' : t.id === 'unreach' ? 'unreachable devices' : 'status code'}</span>
                    <input className="input mono" value={answers[t.id] ?? ''} onChange={(e) => setSaved({ ...saved, answers: { ...answers, [t.id]: e.target.value } })} />
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
