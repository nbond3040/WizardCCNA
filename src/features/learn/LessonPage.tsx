import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronRight, Expand, FlaskConical, Layers, Lock, Minimize, NotebookText, RotateCcw } from 'lucide-react';
import { LESSONS, LESSON_BY_ID, MODULES } from '../../content/curriculum';
import { questionKey, useAllLabs, useLesson } from '../../content/registry';
import { QUIZ_PASS, useProgress, useSettings } from '../../store/progress';
import { RichParas } from '../../lib/rich';
import { hashString, shuffle, seededRandom } from '../../lib/random';
import { SlideView } from './SlideView';
import { QuizRunner, type RunResult } from '../quiz/QuizRunner';
import { ReviewList } from '../quiz/ResultsView';
import { BlueprintChips } from '../../components/BlueprintChips';
import './slides.css';

type View = 'deck' | 'done' | 'quiz' | 'results';

export function LessonPage() {
  const { lessonId = '' } = useParams();
  const meta = LESSON_BY_ID[lessonId];
  const { data: lesson, loading } = useLesson(lessonId);
  const [params, setParams] = useSearchParams();
  const progress = useProgress((s) => s.lessons[lessonId]);
  const setSlide = useProgress((s) => s.setSlide);
  const completeDeck = useProgress((s) => s.completeDeck);
  const recordQuiz = useProgress((s) => s.recordQuiz);
  const logMinutes = useProgress((s) => s.logMinutes);
  const notesOpen = useSettings((s) => s.notesOpen);
  const setNotesOpen = useSettings((s) => s.setNotesOpen);
  const navigate = useNavigate();
  const { data: labs } = useAllLabs();

  const view = (params.get('view') as View) || 'deck';
  const setView = (v: View) => setParams(v === 'deck' ? {} : { view: v }, { replace: false });

  const [index, setIndex] = useState(0);
  const [fs, setFs] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [quizSeed, setQuizSeed] = useState(() => Math.floor(Math.random() * 1e9));
  const stageRef = useRef<HTMLDivElement>(null);

  // resume position
  useEffect(() => {
    if (lesson) {
      const resume = progress?.deckDoneAt ? 0 : Math.min(progress?.slide ?? 0, lesson.slides.length - 1);
      setIndex(resume);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId, lesson]);

  // time on page → activity minutes
  useEffect(() => {
    const start = Date.now();
    return () => {
      const min = Math.min(90, (Date.now() - start) / 60000);
      if (min >= 0.5) logMinutes(Math.round(min));
    };
  }, [lessonId, logMinutes]);

  const total = lesson?.slides.length ?? 0;
  const maxSlide = Math.max(progress?.maxSlide ?? 0, index);
  const deckDone = !!progress?.deckDoneAt;

  const go = useCallback(
    (i: number) => {
      if (!lesson) return;
      const clamped = Math.max(0, Math.min(total - 1, i));
      setIndex(clamped);
      setSlide(lessonId, clamped, total);
      stageRef.current?.scrollTo?.({ top: 0 });
    },
    [lesson, total, lessonId, setSlide],
  );

  const next = useCallback(() => {
    if (index < total - 1) go(index + 1);
    else {
      completeDeck(lessonId, total);
      setFs(false);
      setView('done');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, total, go, completeDeck, lessonId]);

  useEffect(() => {
    if (view !== 'deck') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        go(index - 1);
      } else if (e.key.toLowerCase() === 'n') setNotesOpen(!notesOpen);
      else if (e.key.toLowerCase() === 'f') setFs((v) => !v);
      else if (e.key === 'Escape') setFs(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [view, next, go, index, notesOpen, setNotesOpen]);

  const quizItems = useMemo(() => {
    if (!lesson) return [];
    const refs = lesson.quiz.map((question) => ({ key: questionKey(lessonId, question.id), lessonId, question, pool: 'quiz' as const }));
    return shuffle(refs, seededRandom(quizSeed ^ hashString(lessonId)));
  }, [lesson, lessonId, quizSeed]);

  const relatedLabs = useMemo(() => Object.values(labs ?? {}).filter((l) => l.lessons.includes(lessonId)), [labs, lessonId]);

  if (!meta) return <div className="page"><div className="empty"><h3>Lesson not found</h3><Link to="/learn" className="btn mt">Back to curriculum</Link></div></div>;
  const mod = MODULES.find((m) => m.lessons.some((l) => l.id === lessonId))!;
  const pos = LESSONS.findIndex((l) => l.id === lessonId);
  const nextLesson = LESSONS[pos + 1];
  const prevLesson = LESSONS[pos - 1];

  const header = (
    <div className="deck-top">
      <div className="deck-crumbs">
        <Link to="/learn">Learn</Link>
        <ChevronRight size={13} />
        <span>{mod.title}</span>
      </div>
      <div className="spacer" />
      <BlueprintChips lesson={meta} />
    </div>
  );

  const tabs = (
    <div className="tabs">
      <button className={view === 'deck' ? 'on' : ''} onClick={() => setView('deck')}>
        <span className="row" style={{ gap: 6 }}><BookOpen size={14} /> Slides</span>
      </button>
      <button className={view === 'quiz' || view === 'results' ? 'on' : ''} onClick={() => setView('quiz')} disabled={!lesson}>
        <span className="row" style={{ gap: 6 }}>
          <NotebookText size={14} /> Quiz
          {progress?.quiz && <span className={`chip ${progress.quiz.best >= QUIZ_PASS ? 'good' : ''}`}>{Math.round(progress.quiz.best * 100)}%</span>}
        </span>
      </button>
      <button onClick={() => deckDone && navigate(`/flashcards/review?deck=${lessonId}`)} disabled={!deckDone} title={deckDone ? 'Study this lesson’s flashcards' : 'Finish the slide deck to unlock flashcards'}>
        <span className="row" style={{ gap: 6 }}>
          {deckDone ? <Layers size={14} /> : <Lock size={14} />} Flashcards {lesson && <span className="chip">{lesson.flashcards.length}</span>}
        </span>
      </button>
      {relatedLabs.map((l) => (
        <button key={l.id} onClick={() => navigate(`/labs/${l.id}`)}>
          <span className="row" style={{ gap: 6 }}><FlaskConical size={14} /> Lab: {l.title}</span>
        </button>
      ))}
    </div>
  );

  if (loading) return <div className="page"><div className="loading"><div className="spinner" /> Loading lesson…</div></div>;

  if (!lesson) {
    return (
      <div className="page">
        {header}
        <h1>{meta.title}</h1>
        <div className="empty mt-l">
          <h3>This lesson is being written</h3>
          <p>Content for “{meta.title}” isn’t available yet. It covers:</p>
          <ul className="focus-list">
            {meta.focus.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  const slide = lesson.slides[index];

  return (
    <div className="page">
      {header}
      <div className="row between mb" style={{ alignItems: 'flex-end' }}>
        <div>
          <h1>{meta.title}</h1>
          <p className="muted mt-s">{meta.summary}</p>
        </div>
      </div>
      {tabs}

      {view === 'deck' && (
        <div className="fade-in">
          <div className={`stage ${fs ? 'fs' : ''}`} ref={stageRef}>
            <div className="stage-inner">
              <SlideView slide={slide} meta={{ module: mod.title, index, total }} />
            </div>
            {fs && (
              <div className="deck-controls fs-controls">
                <button className="btn ghost icon" onClick={() => go(index - 1)} disabled={index === 0} aria-label="Previous slide"><ArrowLeft size={16} /></button>
                <div className="deck-count">{index + 1} / {total}</div>
                <button className="btn ghost icon" onClick={next} aria-label="Next slide"><ArrowRight size={16} /></button>
                <div className="spacer" />
                <button className="btn ghost icon" onClick={() => setFs(false)} aria-label="Exit full screen"><Minimize size={16} /></button>
              </div>
            )}
          </div>
          <div className="deck-controls">
            <button className="btn icon" onClick={() => go(index - 1)} disabled={index === 0} aria-label="Previous slide">
              <ArrowLeft size={16} />
            </button>
            <div className="deck-progress" aria-hidden>
              {lesson.slides.map((_, i) => (
                <button key={i} className={i === index ? 'cur' : i <= maxSlide ? 'seen' : ''} disabled={i > maxSlide + 1 && !deckDone} onClick={() => go(i)} title={`Slide ${i + 1}`} />
              ))}
            </div>
            <div className="deck-count">
              {index + 1} / {total}
            </div>
            <button className="btn icon ghost" onClick={() => setFs(true)} title="Full screen (F)">
              <Expand size={16} />
            </button>
            <button className={`btn ${index === total - 1 ? 'accent' : 'primary'}`} onClick={next}>
              {index === total - 1 ? (
                <>
                  <Check size={16} /> Finish deck
                </>
              ) : (
                <>
                  Next <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
          <div className="notes">
            <button className="notes-head btn ghost sm" style={{ padding: 0, height: 'auto' }} onClick={() => setNotesOpen(!notesOpen)}>
              <NotebookText size={14} /> Explanation {notesOpen ? '— hide (N)' : '— show (N)'}
            </button>
            {notesOpen && <RichParas className="notes-body" text={slide.notes} />}
          </div>
          <div className="row between mt tiny muted">
            <span>
              <span className="kbd">←</span> <span className="kbd">→</span> navigate · <span className="kbd">N</span> notes · <span className="kbd">F</span> full screen
            </span>
            <span className="row" style={{ gap: 14 }}>
              {prevLesson && <Link to={`/learn/${prevLesson.id}`}>← {prevLesson.title}</Link>}
              {nextLesson && <Link to={`/learn/${nextLesson.id}`}>{nextLesson.title} →</Link>}
            </span>
          </div>
        </div>
      )}

      {view === 'done' && (
        <div className="card deck-done fade-in">
          <div className="big-check"><Check size={30} /></div>
          <h2>Deck complete</h2>
          <p className="muted mt-s">
            You unlocked <strong>{lesson.flashcards.length} flashcards</strong> for {meta.title}. Lock it in with a short quiz.
          </p>
          <div className="row mt-l" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn accent lg" onClick={() => setView('quiz')}>
              Take the quiz · {lesson.quiz.length} questions <ArrowRight size={16} />
            </button>
            <button className="btn lg" onClick={() => navigate(`/flashcards/review?deck=${lessonId}`)}>
              <Layers size={16} /> Study flashcards
            </button>
          </div>
          <button className="btn ghost sm mt" onClick={() => { go(0); setView('deck'); }}>
            <RotateCcw size={13} /> Review slides
          </button>
        </div>
      )}

      {view === 'quiz' && (
        <div className="fade-in">
          {!deckDone && (
            <div className="callout warn mb">
              <Lock size={16} /> You haven’t finished the deck yet — the quiz works best right after the slides. Flashcards unlock when you finish the deck.
            </div>
          )}
          <QuizRunner
            key={quizSeed}
            items={quizItems}
            mode="study"
            seed={quizSeed}
            title={`${meta.title} — quiz`}
            onFinish={(r) => {
              recordQuiz(lessonId, r.correct, r.total);
              setResult(r);
              setView('results');
            }}
          />
        </div>
      )}

      {view === 'results' && (
        <div className="fade-in">
          {result ? (
            <>
              <div className="card quiz-result">
                <div className="row" style={{ gap: 24, flexWrap: 'wrap' }}>
                  <ScoreRing value={result.correct / result.total} />
                  <div style={{ flex: 1, minWidth: 220 }}>
                    <h2>{result.correct / result.total >= QUIZ_PASS ? 'Nice work — lesson mastered' : 'Keep going'}</h2>
                    <p className="muted mt-s">
                      {result.correct} of {result.total} correct.{' '}
                      {result.correct / result.total >= QUIZ_PASS
                        ? 'Missed questions were added to your review queue.'
                        : `Score ${Math.round(QUIZ_PASS * 100)}% to master this lesson. Review the explanation panel on the slides you missed.`}
                    </p>
                    <div className="row mt wrap">
                      {nextLesson && (
                        <Link className="btn primary" to={`/learn/${nextLesson.id}`}>
                          Next lesson: {nextLesson.title} <ArrowRight size={15} />
                        </Link>
                      )}
                      <button className="btn" onClick={() => { setQuizSeed(Math.floor(Math.random() * 1e9)); setView('quiz'); }}>
                        <RotateCcw size={14} /> Retake
                      </button>
                      <Link className="btn" to={`/flashcards/review?deck=${lessonId}`}>
                        <Layers size={14} /> Flashcards
                      </Link>
                      {relatedLabs[0] && (
                        <Link className="btn" to={`/labs/${relatedLabs[0].id}`}>
                          <FlaskConical size={14} /> Lab
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-l">
                <ReviewList
                  seed={quizSeed}
                  items={result.items.map((it) => ({ key: it.ref.key, lessonId: it.ref.lessonId, question: it.ref.question, response: it.response, points: it.points }))}
                />
              </div>
            </>
          ) : (
            <div className="empty">
              <h3>No quiz result yet</h3>
              <button className="btn mt" onClick={() => setView('quiz')}>Take the quiz</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ScoreRing({ value, size = 96, label }: { value: number; size?: number; label?: string }) {
  const r = size / 2 - 6;
  const c = 2 * Math.PI * r;
  const pct = Math.round(value * 100);
  const color = value >= QUIZ_PASS ? 'var(--good)' : value >= 0.6 ? 'var(--warn)' : 'var(--bad)';
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={6} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" strokeDasharray={`${c * value} ${c}`} />
      </svg>
      <div className="ring-label">
        <div style={{ fontSize: size / 4.2, fontWeight: 700, letterSpacing: '-0.03em' }}>{label ?? `${pct}%`}</div>
      </div>
    </div>
  );
}
