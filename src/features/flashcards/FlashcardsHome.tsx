import { Link } from 'react-router';
import { Layers, Lock, RotateCcw, Sparkles, Target } from 'lucide-react';
import { MODULES, lessonInVersion } from '../../content/curriculum';
import { useAllLessons } from '../../content/registry';
import { useProgress, useSettings } from '../../store/progress';
import { useExamVersion } from '../../store/version';
import { buildQueue, computeStats, isUnlocked, versionCards } from './deck';
import './flashcards.css';

export function FlashcardsHome() {
  const { data: content, loading } = useAllLessons();
  const version = useExamVersion();
  const lessons = useProgress((s) => s.lessons);
  const cardState = useProgress((s) => s.cards);
  const missed = useProgress((s) => s.missedCards);
  const newLimit = useSettings((s) => s.newCardsPerDay);
  const setNewLimit = useSettings((s) => s.setNewCardsPerDay);

  if (loading || !content) return <div className="page"><div className="loading"><div className="spinner" /> Loading flashcards…</div></div>;

  const cards = versionCards(content, version);
  const stats = computeStats(cards, cardState, lessons, missed);
  const todayQueue = buildQueue({ kind: 'today' }, cards, cardState, lessons, missed, newLimit);
  const missedSet = new Set(missed);
  const qMissed = todayQueue.filter((c) => missedSet.has(c.key)).length;
  const qNew = todayQueue.filter((c) => !cardState[c.key]).length;
  const qReviews = todayQueue.length - qMissed - qNew;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="eyebrow">Flashcards</div>
          <h1>Remember everything</h1>
          <p>Each lesson's cards unlock when you finish its slide deck. Cards you miss join the missed queue and come back until you get them right.</p>
        </div>
      </div>

      <div className="grid c4">
        <div className="card stat">
          <div className="k">Due today</div>
          <div className="v">{todayQueue.length}</div>
          <div className="s">{qMissed} missed · {qReviews} reviews · {qNew} new</div>
        </div>
        <div className="card stat">
          <div className="k">Missed queue</div>
          <div className="v" style={{ color: stats.missed ? 'var(--bad)' : undefined }}>{stats.missed}</div>
          <div className="s">cards to relearn</div>
        </div>
        <div className="card stat">
          <div className="k">Unlocked</div>
          <div className="v">{stats.unlocked}</div>
          <div className="s">of {stats.total} total</div>
        </div>
        <div className="card stat">
          <div className="k">Mastered</div>
          <div className="v">{stats.mastered}</div>
          <div className="s">interval ≥ 21 days</div>
        </div>
      </div>

      <div className="grid c2 mt">
        <div className="card fc-cta">
          <div className="row">
            <Sparkles size={18} />
            <div className="card-title">Today's review</div>
          </div>
          <p className="muted small mt-s">Missed cards first, then everything due, then up to {newLimit} new cards from lessons you've finished.</p>
          <div className="row mt">
            {todayQueue.length ? (
              <Link to="/flashcards/review?mode=today" className="btn primary">
                Start · {todayQueue.length} cards
              </Link>
            ) : (
              <span className="muted small">{stats.unlocked ? 'All caught up for today.' : 'Finish a slide deck to unlock your first cards.'}</span>
            )}
          </div>
        </div>
        <div className="card fc-cta">
          <div className="row">
            <RotateCcw size={18} />
            <div className="card-title">Missed queue</div>
          </div>
          <p className="muted small mt-s">Every card you answer “Again” lands here and stays until you recall it correctly.</p>
          <div className="row mt">
            {stats.missed ? (
              <Link to="/flashcards/review?mode=missed" className="btn bad">
                Relearn · {stats.missed} cards
              </Link>
            ) : (
              <span className="muted small">Empty — nothing to relearn.</span>
            )}
          </div>
        </div>
      </div>

      <div className="row between mt-l">
        <h3 className="section-title" style={{ margin: 0 }}>Decks</h3>
        <label className="row small muted" style={{ gap: 8 }}>
          New cards per day
          <select className="select" value={newLimit} onChange={(e) => setNewLimit(Number(e.target.value))} style={{ height: 32 }}>
            {[10, 15, 20, 25, 30, 40, 50, 75, 100].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>
      </div>

      {MODULES.map((m) => {
        const ls = m.lessons.filter((l) => lessonInVersion(l, version));
        if (!ls.length) return null;
        return (
          <div key={m.id} className="mt">
            <div className="fc-module">{m.title}</div>
            <div className="list">
              {ls.map((l) => {
                const lc = cards.filter((c) => c.lessonId === l.id);
                const unlocked = isUnlocked(l.id, lessons);
                const st = computeStats(lc, cardState, lessons, missed);
                const has = !!content[l.id];
                return (
                  <div key={l.id} className={`list-item ${unlocked ? '' : 'locked'}`}>
                    <div className="fc-deck-icon">{unlocked ? <Layers size={16} /> : <Lock size={15} />}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="title">{l.title}</div>
                      <div className="sub">
                        {!has
                          ? 'Content coming soon'
                          : unlocked
                            ? `${lc.length} cards · ${st.mastered} mastered · ${st.fresh} new${st.missed ? ` · ${st.missed} missed` : ''}`
                            : `${lc.length} cards — finish the slide deck to unlock`}
                      </div>
                    </div>
                    {unlocked && lc.length > 0 && (
                      <div className="fc-mini-bar" title={`${st.mastered} mastered, ${st.learning} learning, ${st.fresh} new`}>
                        <span style={{ width: `${(st.mastered / lc.length) * 100}%`, background: 'var(--good)' }} />
                        <span style={{ width: `${(st.learning / lc.length) * 100}%`, background: 'var(--accent)' }} />
                      </div>
                    )}
                    {unlocked ? (
                      <Link to={`/flashcards/review?deck=${l.id}`} className="btn sm">
                        Study
                      </Link>
                    ) : has ? (
                      <Link to={`/learn/${l.id}`} className="btn sm ghost">
                        <Target size={13} /> Open deck
                      </Link>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
