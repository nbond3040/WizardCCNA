import { Link } from 'react-router';
import { ArrowRight, BookOpen, CalendarDays, Check, Flame, FlaskConical, Layers, RotateCcw, Sparkles, Trophy } from 'lucide-react';
import { EXAM_VERSIONS, LESSONS, lessonInVersion } from '../../content/curriculum';
import { AVAILABLE_LABS, useAllLabs, useAllLessons } from '../../content/registry';
import { GUI_LABS } from '../guilabs/registry';
import { useProgress, useSettings } from '../../store/progress';
import { useExamVersion } from '../../store/version';
import { addDays, formatDate, formatMinutes, relativeDay, today } from '../../lib/date';
import { usePlan } from '../plan/usePlan';
import { StatusChip } from '../plan/PlanPage';
import { ITEM_ICON, ITEM_LABEL } from '../plan/itemMeta';
import { buildQueue, versionCards } from '../flashcards/deck';
import { computeReadiness, streak } from './readiness';
import { ScoreRing } from '../learn/LessonPage';
import { domainOf, versionQuestions } from '../practice/examBuilder';
import '../plan/plan.css';
import './dashboard.css';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

export function Dashboard() {
  const plan = useProgress((s) => s.plan);
  const r = usePlan();
  const version = useExamVersion();
  const info = EXAM_VERSIONS[version];
  const { data: content } = useAllLessons();
  const { data: labDefs } = useAllLabs();
  const lessons = useProgress((s) => s.lessons);
  const cards = useProgress((s) => s.cards);
  const missedCards = useProgress((s) => s.missedCards);
  const missedQuestions = useProgress((s) => s.missedQuestions);
  const questions = useProgress((s) => s.questions);
  const exams = useProgress((s) => s.exams);
  const labs = useProgress((s) => s.labs);
  const activity = useProgress((s) => s.activity);
  const newLimit = useSettings((s) => s.newCardsPerDay);

  const vc = content ? versionCards(content, version) : [];
  const due = content ? buildQueue({ kind: 'today' }, vc, cards, lessons, missedCards, newLimit).length : 0;
  const inVersion = (l: { lessons: string[] }) => l.lessons.some((id) => LESSONS.find((x) => x.id === id && lessonInVersion(x, version)));
  const labTotal = Object.values(labDefs ?? {}).filter(inVersion).length + GUI_LABS.filter(inVersion).length || AVAILABLE_LABS.length + GUI_LABS.length;
  const ready = computeReadiness({ version, content, lessons, cards, questions, exams, labs, labTotal });
  const days = streak(activity);
  const inProgress = LESSONS.find((l) => lessonInVersion(l, version) && lessons[l.id] && !lessons[l.id].deckDoneAt);
  const nextUp = LESSONS.find((l) => lessonInVersion(l, version) && !lessons[l.id]?.deckDoneAt);

  if (!plan || !r) {
    const totals = content
      ? {
          slides: Object.values(content).reduce((a, c) => a + c.slides.length, 0),
          cards: Object.values(content).reduce((a, c) => a + c.flashcards.length, 0),
          questions: Object.values(content).reduce((a, c) => a + c.exam.length + c.quiz.length, 0),
        }
      : null;
    return (
      <div className="page">
        <div className="hero">
          <div className="eyebrow">CCNA 200-301 · v1.1 & v2.0</div>
          <h1 className="hero-title">Everything you need to pass the CCNA — on a schedule that ends on exam day.</h1>
          <p className="hero-sub">
            Set your exam date and WizardCCNA builds a day-by-day path through {LESSONS.length} lessons, hands-on labs in a built-in network simulator, spaced-repetition flashcards and full-length practice exams.
          </p>
          <div className="row mt-l wrap">
            <Link to="/plan" className="btn accent lg"><CalendarDays size={17} /> Set my exam date</Link>
            <Link to={`/learn/${LESSONS[0].id}`} className="btn lg">Start the first lesson <ArrowRight size={16} /></Link>
          </div>
        </div>
        <div className="grid c4 mt-l">
          <Feature icon={BookOpen} title="Slide decks" text="Minimal slides with an instructor's explanation for every one — and a quiz at the end of each deck." stat={totals ? `${totals.slides} slides` : `${LESSONS.length} lessons`} to="/learn" />
          <Feature icon={Layers} title="Flashcards" text="Unlocked as you finish decks. Spaced repetition; misses go to a queue until you know them." stat={totals ? `${totals.cards} cards` : ''} to="/flashcards" />
          <Feature icon={FlaskConical} title="Network labs" text="Configure routers and switches in a Packet-Tracer-style simulator with live grading." stat={`${AVAILABLE_LABS.length + GUI_LABS.length} labs`} to="/labs" />
          <Feature icon={Trophy} title="Practice exams" text="Timed, blueprint-weighted simulations with drag-and-drop, exhibits and a 300–1000 score." stat={totals ? `${totals.questions} questions` : ''} to="/practice" />
        </div>
      </div>
    );
  }

  const upcoming = r.days.filter((d) => d.date > today() && d.items.length).slice(0, 3);
  const todayItems = r.todayItems;
  const pool = content ? versionQuestions(content, version) : [];
  const domainStats = info.domains.map((d) => {
    let seen = 0;
    let correct = 0;
    pool.filter((q) => domainOf(q, version) === d.num).forEach((q) => {
      const s = questions[q.key];
      if (s) {
        seen += s.seen;
        correct += s.correct;
      }
    });
    return { d, pct: seen ? correct / seen : null };
  });
  const week = Array.from({ length: 7 }, (_, i) => addDays(today(), i - 6));
  const maxMin = Math.max(30, ...week.map((d) => activity[d]?.minutes ?? 0));

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="eyebrow">{greeting()}</div>
          <h1>
            {r.daysLeft} day{r.daysLeft === 1 ? '' : 's'} to your {version} exam
          </h1>
          <p>
            {formatDate(plan.goalDate, { weekday: true, year: true })} · {formatMinutes(r.dailyBudget)} per study day · {Math.round((r.doneMinutes / Math.max(1, r.totalMinutes)) * 100)}% of your path complete
          </p>
        </div>
        <div className="row">
          <StatusChip r={r} />
          <Link to="/plan" className="btn">Full plan</Link>
        </div>
      </div>

      <div className="dash-grid">
        <div className="stack l">
          <div className="card">
            <div className="row between">
              <div className="card-title">Today{!r.isStudyDay && todayItems.length === 0 ? ' · rest day' : ''}</div>
              <span className="muted small">{formatDate(today(), { weekday: true })}</span>
            </div>
            <div className="today-list mt">
              {todayItems.map((it) => {
                const Icon = ITEM_ICON[it.type];
                return (
                  <Link key={it.id} to={it.href} className={`today-item ${it.done ? 'done' : ''}`}>
                    <span className={`today-check ${it.done ? 'on' : ''}`}>{it.done ? <Check size={13} /> : <Icon size={14} />}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="today-title">{it.title}</div>
                      <div className="tiny muted">{ITEM_LABEL[it.type]}{it.moduleTitle ? ` · ${it.moduleTitle}` : ''} · {formatMinutes(it.minutes)}</div>
                    </div>
                    {!it.done && <ArrowRight size={15} className="muted" />}
                  </Link>
                );
              })}
              <Link to="/flashcards/review?mode=today" className={`today-item ${due === 0 ? 'done' : ''}`}>
                <span className={`today-check ${due === 0 ? 'on' : ''}`}>{due === 0 ? <Check size={13} /> : <Layers size={14} />}</span>
                <div style={{ flex: 1 }}>
                  <div className="today-title">Flashcard review</div>
                  <div className="tiny muted">{due ? `${due} cards due` : 'All caught up'}{missedCards.length ? ` · ${missedCards.length} in missed queue` : ''}</div>
                </div>
                {due > 0 && <ArrowRight size={15} className="muted" />}
              </Link>
              {missedQuestions.length > 0 && (
                <Link to="/practice" className="today-item">
                  <span className="today-check"><RotateCcw size={14} /></span>
                  <div style={{ flex: 1 }}>
                    <div className="today-title">Missed questions</div>
                    <div className="tiny muted">{missedQuestions.length} to review</div>
                  </div>
                  <ArrowRight size={15} className="muted" />
                </Link>
              )}
              {todayItems.length === 0 && !r.isStudyDay && (
                <div className="muted small" style={{ padding: '6px 2px' }}>No study session planned today. A quick flashcard review keeps everything fresh.</div>
              )}
            </div>
          </div>

          {(inProgress || nextUp) && (
            <Link to={`/learn/${(inProgress ?? nextUp)!.id}`} className="card hover continue">
              <div className="continue-icon"><Sparkles size={18} /></div>
              <div style={{ flex: 1 }}>
                <div className="tiny muted">{inProgress ? 'Continue where you left off' : 'Up next'}</div>
                <div className="card-title">{(inProgress ?? nextUp)!.title}</div>
                {inProgress && lessons[inProgress.id] && (
                  <div className="bar thin mt-s" style={{ maxWidth: 280 }}>
                    <span style={{ width: `${((lessons[inProgress.id].maxSlide + 1) / Math.max(1, lessons[inProgress.id].total)) * 100}%` }} />
                  </div>
                )}
              </div>
              <ArrowRight size={18} />
            </Link>
          )}

          <div className="card">
            <div className="card-title">Coming up</div>
            <div className="stack s mt">
              {upcoming.length === 0 && <div className="muted small">Nothing else scheduled.</div>}
              {upcoming.map((d) => (
                <div key={d.date} className="upcoming">
                  <div className="upcoming-day">{relativeDay(d.date)}</div>
                  <div className="upcoming-items">
                    {d.items.map((it) => (
                      <span key={it.id} className="chip">{it.title}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="stack l">
          <div className="card">
            <div className="row" style={{ gap: 18 }}>
              <ScoreRing value={ready.score} size={92} />
              <div>
                <div className="card-title">Exam readiness</div>
                <div className="small muted">
                  {ready.predictedScaled ? `Predicted ~${ready.predictedScaled}/1000` : 'Take a full practice exam for a score prediction'}
                </div>
              </div>
            </div>
            <div className="stack s mt">
              {ready.parts.map((p) => (
                <div key={p.key}>
                  <div className="row between tiny">
                    <span style={{ fontWeight: 600 }}>{p.label}</span>
                    <span className="muted">{p.detail}</span>
                  </div>
                  <div className="bar thin mt-s"><span style={{ width: `${p.value * 100}%` }} /></div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="row between">
              <div className="card-title row" style={{ gap: 6 }}><Flame size={16} /> {days}-day streak</div>
              <span className="tiny muted">last 7 days</span>
            </div>
            <div className="week-bars mt">
              {week.map((d) => {
                const m = activity[d]?.minutes ?? 0;
                const any = !!activity[d] && (m > 0 || activity[d].cards > 0 || activity[d].questions > 0);
                return (
                  <div key={d} className="week-bar" title={`${formatDate(d)}: ${m} min`}>
                    <div className="week-bar-fill" style={{ height: `${Math.max(any ? 10 : 3, (m / maxMin) * 100)}%`, background: any ? 'var(--text)' : 'var(--surface-3)' }} />
                    <div className="tiny muted">{formatDate(d, { weekday: true }).slice(0, 2)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <div className="card-title">Domain accuracy</div>
            <div className="stack s mt">
              {domainStats.map(({ d, pct }) => (
                <div key={d.num}>
                  <div className="row between tiny">
                    <span>D{d.num} {d.title}</span>
                    <span className="muted num">{pct === null ? '—' : `${Math.round(pct * 100)}%`}</span>
                  </div>
                  <div className={`bar thin mt-s ${pct !== null && pct >= 0.85 ? 'good' : ''}`}><span style={{ width: `${(pct ?? 0) * 100}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, title, text, stat, to }: { icon: typeof BookOpen; title: string; text: string; stat: string; to: string }) {
  return (
    <Link to={to} className="card hover feature">
      <Icon size={20} />
      <div className="card-title mt">{title}</div>
      <p className="small muted mt-s">{text}</p>
      {stat && <div className="tiny mt" style={{ fontWeight: 650 }}>{stat}</div>}
    </Link>
  );
}
