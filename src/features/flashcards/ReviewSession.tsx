import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { ArrowLeft, Check, RotateCcw } from 'lucide-react';
import { LESSON_BY_ID } from '../../content/curriculum';
import { useAllLessons, type CardRef } from '../../content/registry';
import { useProgress, useSettings } from '../../store/progress';
import { useExamVersion } from '../../store/version';
import { Rich } from '../../lib/rich';
import { buildQueue, isUnlocked, versionCards } from './deck';
import { previewInterval, type Grade } from './srs';
import './flashcards.css';

const GRADES: { g: Grade; label: string; key: string; cls: string }[] = [
  { g: 'again', label: 'Again', key: '1', cls: 'again' },
  { g: 'hard', label: 'Hard', key: '2', cls: 'hard' },
  { g: 'good', label: 'Good', key: '3', cls: 'good' },
  { g: 'easy', label: 'Easy', key: '4', cls: 'easy' },
];

/** How many cards later a missed card comes back within the same session. */
const REQUEUE_GAP = 4;

export function ReviewSession() {
  const [params] = useSearchParams();
  const { data: content, loading } = useAllLessons();
  const version = useExamVersion();
  const lessons = useProgress((s) => s.lessons);
  const cardState = useProgress((s) => s.cards);
  const missed = useProgress((s) => s.missedCards);
  const reviewCard = useProgress((s) => s.reviewCard);
  const newLimit = useSettings((s) => s.newCardsPerDay);

  const deck = params.get('deck');
  const mode = deck ? ({ kind: 'deck', lessonId: deck } as const) : params.get('mode') === 'missed' ? ({ kind: 'missed' } as const) : params.get('mode') === 'all' ? ({ kind: 'all' } as const) : ({ kind: 'today' } as const);

  const [queue, setQueue] = useState<CardRef[] | null>(null);
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [tally, setTally] = useState({ reviewed: 0, again: 0, right: 0 });
  const [missedThisSession, setMissedThisSession] = useState<Set<string>>(new Set());
  const [fixed, setFixed] = useState<Set<string>>(new Set());
  const started = useRef(Date.now());
  const logMinutes = useProgress((s) => s.logMinutes);

  // Build the queue once content is ready (snapshot; grading changes state but not the session order).
  useEffect(() => {
    if (!content || queue) return;
    const cards = versionCards(content, version);
    setQueue(buildQueue(mode, cards, cardState, lessons, missed, newLimit));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  useEffect(() => () => {
    const min = (Date.now() - started.current) / 60000;
    if (min >= 0.5) logMinutes(Math.round(Math.min(min, 90)));
  }, [logMinutes]);

  const cur = queue?.[pos];
  const done = queue !== null && pos >= queue.length;

  const rate = (g: Grade) => {
    if (!cur || !queue) return;
    reviewCard(cur.key, g);
    setTally((t) => ({ reviewed: t.reviewed + 1, again: t.again + (g === 'again' ? 1 : 0), right: t.right + (g !== 'again' ? 1 : 0) }));
    if (g === 'again') {
      // Requeue a few cards later so it is studied again this session.
      const q = queue.slice();
      q.splice(Math.min(q.length, pos + 1 + REQUEUE_GAP), 0, cur);
      setQueue(q);
      setMissedThisSession((s) => new Set(s).add(cur.key));
    } else if (missedThisSession.has(cur.key) || missed.includes(cur.key)) {
      setFixed((s) => new Set(s).add(cur.key));
    }
    setFlipped(false);
    setPos((p) => p + 1);
  };

  const keyHandler = useRef<(e: KeyboardEvent) => void>(() => {});
  keyHandler.current = (e: KeyboardEvent) => {
    if (!cur) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      setFlipped((f) => !f);
    } else if (flipped) {
      const g = GRADES.find((x) => x.key === e.key);
      if (g) rate(g.g);
    }
  };
  useEffect(() => {
    const h = (e: KeyboardEvent) => keyHandler.current(e);
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const stillMissed = useMemo(() => [...missedThisSession].filter((k) => missed.includes(k)).length, [missedThisSession, missed]);

  if (loading || !queue) return <div className="page"><div className="loading"><div className="spinner" /> Preparing cards…</div></div>;

  const title = deck ? LESSON_BY_ID[deck]?.title ?? 'Deck' : mode.kind === 'missed' ? 'Missed queue' : mode.kind === 'all' ? 'All unlocked cards' : "Today's review";

  if (deck && !isUnlocked(deck, lessons)) {
    return (
      <div className="page">
        <div className="empty">
          <h3>Locked</h3>
          <p>Finish the “{LESSON_BY_ID[deck]?.title}” slide deck to unlock its flashcards.</p>
          <Link to={`/learn/${deck}`} className="btn primary mt">Open the deck</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="row mb">
        <Link to="/flashcards" className="btn ghost sm"><ArrowLeft size={14} /> Flashcards</Link>
        <div className="runner-title">{title}</div>
        <div className="spacer" />
        {!done && <div className="chip">{Math.min(pos + 1, queue.length)} / {queue.length}</div>}
        {tally.again > 0 && <div className="chip bad">{tally.again} missed</div>}
      </div>
      <div className="bar thin mb-l"><span style={{ width: `${queue.length ? (Math.min(pos, queue.length) / queue.length) * 100 : 100}%` }} /></div>

      {queue.length === 0 && (
        <div className="empty">
          <h3>Nothing to review</h3>
          <p>{mode.kind === 'missed' ? 'Your missed queue is empty.' : 'No cards are due. Finish another slide deck to unlock more.'}</p>
          <Link to="/learn" className="btn mt">Go to lessons</Link>
        </div>
      )}

      {cur && (
        <div className="fc-stage">
          <button className={`fc-card ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped(!flipped)} aria-label="Flip card">
            <div className="fc-meta">
              <span>{LESSON_BY_ID[cur.lessonId]?.title}</span>
              {missed.includes(cur.key) && <span className="chip bad">missed</span>}
              {!cardState[cur.key] && <span className="chip accent">new</span>}
            </div>
            <div className="fc-face">
              <Rich as="div" className="fc-front" text={cur.card.front} />
              {flipped && (
                <>
                  <div className="fc-sep" />
                  <Rich as="div" className="fc-back" text={cur.card.back} />
                </>
              )}
            </div>
            {!flipped && <div className="fc-tap">Click or press <span className="kbd">Space</span> to reveal</div>}
          </button>
          {flipped ? (
            <div className="fc-grades">
              {GRADES.map((g) => (
                <button key={g.g} className={`fc-grade ${g.cls}`} onClick={() => rate(g.g)}>
                  <span className="fc-grade-label">{g.label}</span>
                  <span className="fc-grade-int">{g.g === 'again' ? 'missed queue' : previewInterval(cardState[cur.key], g.g)}</span>
                  <span className="kbd">{g.key}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="fc-grades placeholder">
              <button className="btn primary lg" onClick={() => setFlipped(true)}>Show answer</button>
            </div>
          )}
        </div>
      )}

      {done && queue.length > 0 && (
        <div className="card deck-done fade-in" style={{ textAlign: 'center', padding: 40 }}>
          <div className="big-check" style={{ margin: '0 auto 16px' }}><Check size={28} /></div>
          <h2>Session complete</h2>
          <p className="muted mt-s">
            {tally.reviewed} reviews · {tally.right} recalled · {tally.again} missed{fixed.size ? ` · ${fixed.size} relearned` : ''}
          </p>
          {stillMissed > 0 ? (
            <p className="mt">
              <strong>{stillMissed}</strong> card{stillMissed === 1 ? ' is' : 's are'} still in your missed queue.
            </p>
          ) : null}
          <div className="row mt-l" style={{ justifyContent: 'center' }}>
            {missed.length > 0 && (
              <Link to="/flashcards/review?mode=missed" className="btn bad">
                <RotateCcw size={14} /> Study missed ({missed.length})
              </Link>
            )}
            <Link to="/flashcards" className="btn">Back to decks</Link>
            <Link to="/" className="btn primary">Dashboard</Link>
          </div>
        </div>
      )}
    </div>
  );
}
