import { Link } from 'react-router';
import { Check, CircleDashed, Clock, Lock, PlayCircle } from 'lucide-react';
import { EXAM_VERSIONS, MODULES, lessonDomain, lessonInVersion } from '../../content/curriculum';
import { AVAILABLE_LESSONS } from '../../content/registry';
import { QUIZ_PASS, useProgress } from '../../store/progress';
import { useExamVersion } from '../../store/version';
import { formatMinutes } from '../../lib/date';
import './learn.css';

export function Curriculum() {
  const version = useExamVersion();
  const info = EXAM_VERSIONS[version];
  const lessons = useProgress((s) => s.lessons);
  const all = MODULES.flatMap((m) => m.lessons).filter((l) => lessonInVersion(l, version));
  const done = all.filter((l) => lessons[l.id]?.deckDoneAt).length;
  const totalMin = all.reduce((a, l) => a + l.minutes, 0);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="eyebrow">Course · {info.name}</div>
          <h1>Learn</h1>
          <p>
            {all.length} lessons · {formatMinutes(totalMin)} of slides and quizzes. Finish a deck to unlock its flashcards; each deck ends with a short quiz.
          </p>
        </div>
        <div className="stat" style={{ textAlign: 'right' }}>
          <div className="v">{done}<span className="muted" style={{ fontSize: 16 }}> / {all.length}</span></div>
          <div className="k">decks complete</div>
        </div>
      </div>

      <div className="stack l">
        {MODULES.map((m, mi) => {
          const ls = m.lessons;
          const inV = ls.filter((l) => lessonInVersion(l, version));
          const mDone = inV.filter((l) => lessons[l.id]?.deckDoneAt).length;
          return (
            <section key={m.id} className="module">
              <div className="module-head">
                <div className="module-num">{String(mi + 1).padStart(2, '0')}</div>
                <div style={{ flex: 1 }}>
                  <h2>{m.title}</h2>
                  <p className="muted small mt-s">{m.description}</p>
                </div>
                <div className="module-progress">
                  <div className="tiny muted">{mDone}/{inV.length}</div>
                  <div className="bar thin" style={{ width: 90 }}><span style={{ width: `${(mDone / Math.max(1, inV.length)) * 100}%` }} /></div>
                </div>
              </div>
              <div className="list">
                {ls.map((l) => {
                  const p = lessons[l.id];
                  const inVersion = lessonInVersion(l, version);
                  const available = AVAILABLE_LESSONS.has(l.id);
                  const mastered = (p?.quiz?.best ?? 0) >= QUIZ_PASS;
                  const status = mastered ? 'mastered' : p?.deckDoneAt ? 'done' : p ? 'progress' : 'new';
                  const dom = lessonDomain(l, version);
                  return (
                    <Link key={l.id} to={`/learn/${l.id}`} className={`list-item lesson-row ${!inVersion ? 'off' : ''}`}>
                      <span className={`lesson-status s-${status}`}>
                        {status === 'mastered' ? <Check size={14} /> : status === 'done' ? <Check size={14} /> : status === 'progress' ? <PlayCircle size={15} /> : <CircleDashed size={15} />}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="title">{l.title}</div>
                        <div className="sub lesson-sub">{l.summary}</div>
                      </div>
                      <div className="lesson-tags">
                        {!inVersion && <span className="chip">not on {version}</span>}
                        {inVersion && !l.v11?.length && <span className="chip accent">v2.0</span>}
                        {dom && <span className="chip">D{dom}</span>}
                        {!available && <span className="chip warn">soon</span>}
                        {p?.quiz && <span className={`chip ${mastered ? 'good' : ''}`}>quiz {Math.round(p.quiz.best * 100)}%</span>}
                        {!p?.deckDoneAt && available && <span className="lesson-lock" title="Flashcards unlock when you finish the deck"><Lock size={12} /></span>}
                        <span className="tiny muted row" style={{ gap: 4 }}><Clock size={12} />{l.minutes}m</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
