import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, BookOpen, Check, Eye, Lock, RotateCcw, Route, Terminal as TerminalIcon, X } from 'lucide-react';
import { LESSON_BY_ID } from '../../content/curriculum';
import type { HostConfig, Lab } from '../../content/labTypes';
import { useLab } from '../../content/registry';
import { NetworkSim, type CheckResult, type PacketTrace, type SimSnapshot } from '../../sim';
import { clearLabSnapshot, loadLabSnapshot, saveLabSnapshot, useProgress } from '../../store/progress';
import { Rich } from '../../lib/rich';
import { CliBlock } from '../../components/CliBlock';
import { TopologyCanvas } from './TopologyCanvas';
import { Console } from './Console';
import { HostPanel } from './HostPanel';
import { TaskPanel } from './TaskPanel';
import './labs.css';
import { GUI_LAB_BY_ID } from '../guilabs/registry';
import { GuiLabPage } from '../guilabs/GuiLabPage';

function createSim(lab: Lab, fresh = false): NetworkSim {
  const topo = { devices: lab.devices, links: lab.links };
  if (!fresh) {
    const snap = loadLabSnapshot<SimSnapshot>(lab.id);
    if (snap) {
      try {
        return NetworkSim.fromSnapshot(topo, snap);
      } catch {
        /* incompatible snapshot — start fresh */
      }
    }
  }
  return new NetworkSim(topo);
}

function evaluate(sim: NetworkSim, lab: Lab): Record<string, CheckResult[]> {
  const out: Record<string, CheckResult[]> = {};
  for (const t of lab.tasks) {
    out[t.id] = t.checks.map((c) => {
      try {
        return sim.check(c);
      } catch (e) {
        return { pass: false, detail: `check error: ${(e as Error).message}` };
      }
    });
  }
  return out;
}

export function LabWorkspace() {
  const { labId = '' } = useParams();
  const gui = GUI_LAB_BY_ID[labId];
  const { data: lab, loading } = useLab(gui ? '' : labId);
  if (gui) return <GuiLabPage key={gui.id} meta={gui} />;
  if (loading) return <div className="page"><div className="loading"><div className="spinner" /> Loading lab…</div></div>;
  if (!lab) return <div className="page"><div className="empty"><h3>Lab not found</h3><Link to="/labs" className="btn mt">All labs</Link></div></div>;
  return <LabRunner key={lab.id} lab={lab} />;
}

function LabRunner({ lab }: { lab: Lab }) {
  const [sim, setSim] = useState(() => createSim(lab));
  const [version, setVersion] = useState(0);
  const [selected, setSelected] = useState<string | undefined>(() => lab.devices.find((d) => !d.locked && d.model !== 'cloud')?.id);
  const [openTabs, setOpenTabs] = useState<string[]>(() => (selected ? [selected] : []));
  const [hostTab, setHostTab] = useState<Record<string, 'config' | 'cmd'>>({});
  const [results, setResults] = useState<Record<string, CheckResult[]>>(() => evaluate(sim, lab));
  const [showBrief, setShowBrief] = useState(true);
  const [showSolution, setShowSolution] = useState(false);
  const [trace, setTrace] = useState<PacketTrace | null>(null);
  const [traceFrom, setTraceFrom] = useState<string>('');
  const [traceTo, setTraceTo] = useState<string>('');
  const setLabTasks = useProgress((s) => s.setLabTasks);
  const completedAt = useProgress((s) => s.labs[lab.id]?.completedAt);
  const saveTimer = useRef<number | undefined>(undefined);
  const evalTimer = useRef<number | undefined>(undefined);

  // Re-render and re-grade whenever the simulator reports a change.
  const refresh = useCallback(() => {
    setVersion((v) => v + 1);
    window.clearTimeout(evalTimer.current);
    evalTimer.current = window.setTimeout(() => {
      const r = evaluate(sim, lab);
      setResults(r);
      const done = lab.tasks.filter((t) => r[t.id].every((x) => x.pass)).map((t) => t.id);
      setLabTasks(lab.id, done, done.length === lab.tasks.length);
    }, 150);
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => saveLabSnapshot(lab.id, sim.snapshot()), 400);
  }, [sim, lab, setLabTasks]);

  useEffect(() => sim.subscribe(refresh), [sim, refresh]);
  useEffect(() => () => {
    window.clearTimeout(saveTimer.current);
    saveLabSnapshot(lab.id, sim.snapshot());
  }, [sim, lab.id]);

  const devices = useMemo(() => sim.devices(), [sim, version]);
  const links = useMemo(() => sim.links(), [sim, version]);
  const dev = devices.find((d) => d.id === selected);
  const allDone = lab.tasks.every((t) => results[t.id]?.every((r) => r.pass));

  const open = (id: string) => {
    setSelected(id);
    if (!openTabs.includes(id)) setOpenTabs([...openTabs, id]);
  };
  const close = (id: string) => {
    const tabs = openTabs.filter((t) => t !== id);
    setOpenTabs(tabs);
    if (selected === id) setSelected(tabs[tabs.length - 1]);
  };

  const reset = () => {
    if (!confirm('Reset this lab to its starting configuration? Your changes will be lost.')) return;
    clearLabSnapshot(lab.id);
    const fresh = createSim(lab, true);
    setSim(fresh);
    setResults(evaluate(fresh, lab));
    setTrace(null);
    setVersion((v) => v + 1);
  };

  const runTrace = () => {
    if (!traceFrom || !traceTo) return;
    try {
      setTrace(sim.tracePing(traceFrom, traceTo));
    } catch (e) {
      setTrace({ success: false, summary: (e as Error).message, forward: [], reply: [] });
    }
    setVersion((v) => v + 1);
  };

  const isHost = dev && (dev.kind === 'host' || dev.kind === 'cloud');
  const tracePath = trace ? [...trace.forward.map((h) => h.device), ...trace.reply.map((h) => h.device)].filter((d, i, a) => i === 0 || a[i - 1] !== d) : undefined;

  return (
    <div className="page wide lab-page">
      <div className="row mb wrap">
        <Link to="/labs" className="btn ghost sm"><ArrowLeft size={14} /> Labs</Link>
        <h2 style={{ fontSize: 20 }}>{lab.title}</h2>
        <span className="chip">{['', 'Guided', 'Standard', 'Challenge'][lab.difficulty]}</span>
        <span className="chip">{lab.minutes} min</span>
        {completedAt && <span className="chip good"><Check size={11} /> Completed</span>}
        <div className="spacer" />
        <button className="btn sm" onClick={() => setShowBrief(!showBrief)}><BookOpen size={13} /> Brief</button>
        <button className="btn sm" onClick={() => (showSolution || confirm('Reveal the reference solution? Try the tasks on your own first.')) && setShowSolution(!showSolution)}><Eye size={13} /> Solution</button>
        <button className="btn sm ghost" onClick={reset}><RotateCcw size={13} /> Reset</button>
      </div>

      {allDone && (
        <div className="callout good mb">
          <Check size={16} /> <span><strong>Lab complete.</strong> Every task passes. Keep experimenting — try breaking something and fixing it, or open another lab.</span>
        </div>
      )}

      <div className="lab-grid">
        <div className="lab-main">
          <div className="card lab-topo">
            <TopologyCanvas devices={devices} links={links} selected={selected} onSelect={(id) => open(id)} path={tracePath} pathOk={trace?.success} />
            <div className="lab-topo-foot">
              <span className="tiny muted">Click a device to open its console.</span>
              <span className="spacer" />
              <span className="legend"><i className="lg-dot up" /> up</span>
              <span className="legend"><i className="lg-dot down" /> down</span>
              <span className="legend"><i className="lg-dot blk" /> STP blocking</span>
            </div>
          </div>

          <div className="card lab-term">
            <div className="term-tabs">
              {openTabs.map((id) => {
                const d = devices.find((x) => x.id === id);
                return (
                  <div key={id} className={`term-tab ${id === selected ? 'on' : ''}`} onClick={() => setSelected(id)}>
                    <TerminalIcon size={12} /> {d?.hostname ?? id}
                    <button className="term-tab-x" onClick={(e) => { e.stopPropagation(); close(id); }} aria-label={`Close ${id}`}><X size={11} /></button>
                  </div>
                );
              })}
              {openTabs.length === 0 && <div className="tiny muted" style={{ padding: '8px 10px' }}>No console open</div>}
            </div>
            {dev ? (
              dev.locked ? (
                <div className="term-locked"><Lock size={16} /> {dev.hostname} is managed by another team — you can't log in to it in this lab.</div>
              ) : isHost ? (
                <div className="host-wrap">
                  <div className="segmented" style={{ margin: '10px 12px 0' }}>
                    <button className={(hostTab[dev.id] ?? 'config') === 'config' ? 'on' : ''} onClick={() => setHostTab({ ...hostTab, [dev.id]: 'config' })}>IP Configuration</button>
                    <button className={hostTab[dev.id] === 'cmd' ? 'on' : ''} onClick={() => setHostTab({ ...hostTab, [dev.id]: 'cmd' })}>Command Prompt</button>
                  </div>
                  {(hostTab[dev.id] ?? 'config') === 'config' ? (
                    <HostPanel sim={sim} deviceId={dev.id} onChange={refresh} />
                  ) : (
                    <Console term={sim.terminal(dev.id)} onActivity={refresh} />
                  )}
                </div>
              ) : (
                <Console term={sim.terminal(dev.id)} onActivity={refresh} />
              )
            ) : (
              <div className="term-locked">Select a device in the topology.</div>
            )}
          </div>
        </div>

        <div className="lab-side">
          {showBrief && (
            <div className="card">
              <div className="card-title">Scenario</div>
              <Rich as="div" className="small mt-s lab-scenario" text={lab.scenario} />
              <div className="tiny muted mt">
                Reinforces: {lab.lessons.map((l, i) => (
                  <span key={l}>{i > 0 && ', '}<Link to={`/learn/${l}`} style={{ textDecoration: 'underline' }}>{LESSON_BY_ID[l]?.title ?? l}</Link></span>
                ))}
              </div>
            </div>
          )}
          <div className="card">
            <TaskPanel lab={lab} results={results} />
          </div>
          <div className="card">
            <div className="card-title row" style={{ gap: 6 }}><Route size={15} /> Trace a ping</div>
            <div className="row mt-s wrap">
              <select className="select" value={traceFrom} onChange={(e) => setTraceFrom(e.target.value)}>
                <option value="">From…</option>
                {devices.filter((d) => d.kind !== 'cloud').map((d) => <option key={d.id} value={d.id}>{d.hostname}</option>)}
              </select>
              <input className="input mono" placeholder="to IP or device" value={traceTo} onChange={(e) => setTraceTo(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && runTrace()} style={{ width: 150 }} />
              <button className="btn sm" onClick={runTrace} disabled={!traceFrom || !traceTo}>Trace</button>
            </div>
            {trace && (
              <div className="trace mt">
                <div className={`chip ${trace.success ? 'good' : 'bad'}`}>{trace.summary}</div>
                <ol className="trace-hops">
                  {trace.forward.map((h, i) => <li key={`f${i}`} className={h.ok ? '' : 'bad'}><strong>{h.device}</strong>{h.iface ? ` ${h.iface}` : ''} — {h.action}</li>)}
                  {trace.reply.length > 0 && <li className="trace-sep">reply</li>}
                  {trace.reply.map((h, i) => <li key={`r${i}`} className={h.ok ? '' : 'bad'}><strong>{h.device}</strong>{h.iface ? ` ${h.iface}` : ''} — {h.action}</li>)}
                </ol>
              </div>
            )}
          </div>
          {showSolution && (
            <div className="card">
              <div className="card-title">Reference solution</div>
              <div className="stack mt-s">
                {Object.entries(lab.solution).map(([id, sol]) => (
                  <div key={id}>
                    <div className="tiny muted mb" style={{ marginBottom: 6 }}>{id}</div>
                    {typeof sol === 'string' ? <CliBlock code={sol} /> : <HostSolution cfg={sol} />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function HostSolution({ cfg }: { cfg: HostConfig }) {
  return (
    <div className="small mono host-sol">
      {cfg.dhcp ? 'DHCP' : `IP ${cfg.ip ?? '—'} / ${cfg.mask ?? '—'} · GW ${cfg.gateway ?? '—'}${cfg.dns ? ` · DNS ${cfg.dns}` : ''}`}
      {cfg.ipv6 && ` · IPv6 ${cfg.ipv6}${cfg.ipv6Gateway ? ` via ${cfg.ipv6Gateway}` : ''}`}
    </div>
  );
}
