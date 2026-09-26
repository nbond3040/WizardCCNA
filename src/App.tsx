import { useEffect, useState } from 'react';
import { createHashRouter, NavLink, Outlet, RouterProvider, useLocation } from 'react-router';
import { BookOpen, Calculator, CalendarDays, FlaskConical, Home, Layers, Menu, Settings as SettingsIcon, Trophy, X } from 'lucide-react';
import { Dashboard } from './features/dashboard/Dashboard';
import { PlanPage } from './features/plan/PlanPage';
import { Curriculum } from './features/learn/Curriculum';
import { LessonPage } from './features/learn/LessonPage';
import { FlashcardsHome } from './features/flashcards/FlashcardsHome';
import { ReviewSession } from './features/flashcards/ReviewSession';
import { PracticeHome } from './features/practice/PracticeHome';
import { ExamSession } from './features/practice/ExamSession';
import { ExamResults } from './features/practice/ExamResults';
import { LabsHome } from './features/labs/LabsHome';
import { LabWorkspace } from './features/labs/LabWorkspace';
import { DrillsHome } from './features/drills/DrillsHome';
import { Settings } from './features/settings/Settings';
import { useAllLessons } from './content/registry';
import { useProgress, useSettings } from './store/progress';
import { useExamVersion } from './store/version';
import { buildQueue, versionCards } from './features/flashcards/deck';

function useDueCount() {
  const { data } = useAllLessons();
  const version = useExamVersion();
  const lessons = useProgress((s) => s.lessons);
  const cards = useProgress((s) => s.cards);
  const missed = useProgress((s) => s.missedCards);
  const limit = useSettings((s) => s.newCardsPerDay);
  if (!data) return 0;
  return buildQueue({ kind: 'today' }, versionCards(data, version), cards, lessons, missed, limit).length;
}

function Shell() {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const due = useDueCount();
  const plan = useProgress((s) => s.plan);
  const version = useExamVersion();
  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
  }, [loc.pathname]);

  const link = (to: string, Icon: typeof Home, label: string, extra?: React.ReactNode) => (
    <NavLink to={to} end={to === '/'} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
      <Icon size={17} strokeWidth={1.8} />
      {label}
      {extra}
    </NavLink>
  );

  return (
    <div className="app">
      <div className="topbar">
        <button className="btn ghost icon" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={18} /></button>
        <div className="brand" style={{ padding: 0 }}><span className="brand-mark"><Logo /></span>WizardCCNA</div>
      </div>
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="row between">
          <div className="brand"><span className="brand-mark"><Logo /></span>WizardCCNA</div>
          {open && <button className="btn ghost icon sm" onClick={() => setOpen(false)} aria-label="Close menu"><X size={16} /></button>}
        </div>
        {link('/', Home, 'Dashboard')}
        {link('/plan', CalendarDays, 'Study plan')}
        <div className="nav-section">Study</div>
        {link('/learn', BookOpen, 'Lessons')}
        {link('/flashcards', Layers, 'Flashcards', due > 0 ? <span className="count hot">{due}</span> : null)}
        {link('/labs', FlaskConical, 'Labs')}
        {link('/drills', Calculator, 'Drills')}
        {link('/practice', Trophy, 'Practice exams')}
        <div className="sidebar-foot">
          {link('/settings', SettingsIcon, 'Settings')}
          <div className="tiny faint" style={{ padding: '10px 10px 0' }}>
            Preparing for CCNA {version}
            {!plan && ' · no plan yet'}
          </div>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}

function Logo() {
  return (
    <svg width="16" height="16" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
      <circle cx="16" cy="16" r="7" />
      <path d="M16 3v6M16 23v6M3 16h6M23 16h6" />
    </svg>
  );
}

function ReviewSessionKeyed() {
  const loc = useLocation();
  return <ReviewSession key={loc.search} />;
}

function ExamSessionKeyed() {
  const loc = useLocation();
  return <ExamSession key={loc.search} />;
}

function NotFound() {
  return (
    <div className="page">
      <div className="empty">
        <h3>Page not found</h3>
        <NavLink to="/" className="btn mt">Go to dashboard</NavLink>
      </div>
    </div>
  );
}

const router = createHashRouter([
  {
    path: '/',
    element: <Shell />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'plan', element: <PlanPage /> },
      { path: 'learn', element: <Curriculum /> },
      { path: 'learn/:lessonId', element: <LessonPage /> },
      { path: 'flashcards', element: <FlashcardsHome /> },
      { path: 'flashcards/review', element: <ReviewSessionKeyed /> },
      { path: 'practice', element: <PracticeHome /> },
      { path: 'practice/session', element: <ExamSessionKeyed /> },
      { path: 'practice/results/:id', element: <ExamResults /> },
      { path: 'labs', element: <LabsHome /> },
      { path: 'labs/:labId', element: <LabWorkspace /> },
      { path: 'drills/*', element: <DrillsHome /> },
      { path: 'settings', element: <Settings /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
