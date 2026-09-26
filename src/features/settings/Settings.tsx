import { useRef } from 'react';
import { Link } from 'react-router';
import { Download, Upload, Trash2 } from 'lucide-react';
import { EXAM_VERSIONS, LESSONS } from '../../content/curriculum';
import { AVAILABLE_LABS, AVAILABLE_LESSONS } from '../../content/registry';
import { useProgress, useSettings, type Theme } from '../../store/progress';
import { useExamVersion } from '../../store/version';

export function Settings() {
  const theme = useSettings((s) => s.theme);
  const setTheme = useSettings((s) => s.setTheme);
  const newCards = useSettings((s) => s.newCardsPerDay);
  const setNewCards = useSettings((s) => s.setNewCardsPerDay);
  const resetAll = useProgress((s) => s.resetAll);
  const importState = useProgress((s) => s.importState);
  const version = useExamVersion();
  const fileRef = useRef<HTMLInputElement>(null);

  const exportData = () => {
    const raw = localStorage.getItem('wizardccna-progress') ?? '{}';
    const labs: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)!;
      if (k.startsWith('wizardccna-lab-')) labs[k] = JSON.parse(localStorage.getItem(k)!);
    }
    const blob = new Blob([JSON.stringify({ app: 'wizardccna', exportedAt: new Date().toISOString(), progress: JSON.parse(raw), labs }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `wizardccna-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importData = async (f: File) => {
    try {
      const data = JSON.parse(await f.text());
      if (data.app !== 'wizardccna' || !data.progress?.state) throw new Error('Not a WizardCCNA export');
      importState(data.progress.state);
      Object.entries(data.labs ?? {}).forEach(([k, v]) => localStorage.setItem(k, JSON.stringify(v)));
      alert('Progress imported.');
    } catch (e) {
      alert(`Import failed: ${(e as Error).message}`);
    }
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="eyebrow">Settings</div>
          <h1>Preferences & data</h1>
        </div>
      </div>
      <div className="stack l" style={{ maxWidth: 720 }}>
        <div className="card">
          <div className="card-title">Appearance</div>
          <div className="segmented mt">
            {(['system', 'light', 'dark'] as Theme[]).map((t) => (
              <button key={t} className={theme === t ? 'on' : ''} onClick={() => setTheme(t)}>
                {t[0].toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-title">Exam</div>
          <p className="small muted mt-s">
            You're preparing for <strong>{EXAM_VERSIONS[version].name}</strong>. The version follows your plan's exam date (v2.0 from Feb 3, 2027) — change it in <Link to="/plan" style={{ textDecoration: 'underline' }}>your plan</Link>.
          </p>
        </div>
        <div className="card">
          <div className="card-title">Flashcards</div>
          <div className="row mt">
            <span className="small">New cards per day</span>
            <input className="input" type="number" min={5} max={200} value={newCards} onChange={(e) => setNewCards(Math.max(5, Math.min(200, Number(e.target.value) || 25)))} style={{ width: 90 }} />
          </div>
        </div>
        <div className="card">
          <div className="card-title">Your data</div>
          <p className="small muted mt-s">Progress is stored only in this browser. Export it to move to another device or keep a backup.</p>
          <div className="row mt wrap">
            <button className="btn" onClick={exportData}><Download size={14} /> Export progress</button>
            <button className="btn" onClick={() => fileRef.current?.click()}><Upload size={14} /> Import</button>
            <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && importData(e.target.files[0])} />
            <button
              className="btn danger"
              onClick={() => {
                if (confirm('Erase all progress, flashcard history, exam results and your plan? This cannot be undone.')) {
                  resetAll();
                  Object.keys(localStorage).filter((k) => k.startsWith('wizardccna-lab-')).forEach((k) => localStorage.removeItem(k));
                }
              }}
            >
              <Trash2 size={14} /> Reset everything
            </button>
          </div>
        </div>
        <div className="card">
          <div className="card-title">About</div>
          <p className="small muted mt-s">
            WizardCCNA · {AVAILABLE_LESSONS.size}/{LESSONS.length} lessons available · {AVAILABLE_LABS.length} labs. An independent study resource — not affiliated with or endorsed by Cisco. CCNA and Cisco are trademarks of Cisco Systems, Inc. Always check the official exam topics on the Cisco Learning Network before you book.
          </p>
        </div>
      </div>
    </div>
  );
}
