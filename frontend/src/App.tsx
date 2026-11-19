import { useEffect, useState } from 'react';
import ThemeToggle from './components/ThemeToggle';
import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ParetoExplorer from './pages/ParetoExplorer';
import Designer from './pages/Designer';
import Login from './pages/Login';
import CalendarPage from './pages/CalendarPage';
import Requests from './pages/Requests';
import Manage from './pages/Manage';
import Disruptions from './pages/Disruptions';
import Timetables from './pages/Timetables';
import MyAvailability from './pages/MyAvailability';
import TimetableView from './pages/TimetableView';
import Inbox from './components/Inbox';
import AccountBox from './components/AccountBox';
import Hero from './components/Hero';
import Backdrop from './components/Backdrop';
import ClickSpark from './reactbits/ClickSpark';
import ShinyText from './reactbits/ShinyText';
import AnimatedContent from './reactbits/AnimatedContent';
import { useSiteColors } from './lib/siteTheme';
import { api, useAuth, type Role } from './auth';

const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const ICONS = {
  overview: 'M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z',
  pareto: 'M4 20V4M4 20h16M8 16l3-5 3 2 5-7',
  designer: 'M12 3a9 9 0 1 0 0 18c1.5 0 2-1 2-2s-1-1.5-1-2.5S14 15 15 15h2a4 4 0 0 0 4-4c0-4.4-4-8-9-8zM7.5 11.5h.01M10 7.5h.01M15 7.5h.01',
  timetable: 'M4 5h16v15H4zM4 10h16M9 5v15',
  calendar: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
  requests: 'M7 7h10l-3-3M17 17H7l3 3',
  mine: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  manage: 'M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0M14 4v4M8 10v4M16 16v4',
  alert: 'M12 3 2 20h20L12 3zM12 10v4M12 17h.01',
  edit: 'M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4',
};

// which pages each role sees, in sidebar order
const PAGES: { path: string; label: string; icon: keyof typeof ICONS; roles: Role[]; element: JSX.Element }[] = [
  { path: '/', label: 'Overview', icon: 'overview', roles: ['admin'], element: <Dashboard /> },
  { path: '/pareto', label: 'Pareto front', icon: 'pareto', roles: ['admin'], element: <ParetoExplorer /> },
  { path: '/timetables', label: 'Edit timetables', icon: 'edit', roles: ['admin'], element: <Timetables /> },
  { path: '/designer', label: 'Designer', icon: 'designer', roles: ['admin'], element: <Designer /> },
  { path: '/timetable', label: 'Timetable', icon: 'timetable', roles: ['admin', 'teacher', 'student'], element: <TimetableView /> },
  { path: '/calendar', label: 'Calendar', icon: 'calendar', roles: ['admin', 'teacher', 'student'], element: <CalendarPage /> },
  { path: '/requests', label: 'Requests', icon: 'requests', roles: ['admin', 'teacher'], element: <Requests /> },
  { path: '/mine', label: 'My teaching', icon: 'mine', roles: ['teacher'], element: <MyAvailability /> },
  { path: '/disruptions', label: 'Disruptions', icon: 'alert', roles: ['admin'], element: <Disruptions /> },
  { path: '/manage', label: 'Manage', icon: 'manage', roles: ['admin'], element: <Manage /> },
];

/** Number of open disruptions, refreshed on navigation and every 30 s (admins only). */
export function useOpenDisruptions(enabled: boolean) {
  const [n, setN] = useState(0);
  const loc = useLocation();
  useEffect(() => {
    if (!enabled) return;
    const load = () =>
      api<{ items: { status: string }[] }>('/disruptions')
        .then((r) => setN(r.items.filter((d) => d.status === 'open').length))
        .catch(() => undefined);
    load();
    const t = setInterval(load, 30000);
    window.addEventListener('clockwork:disruptions', load);
    return () => {
      clearInterval(t);
      window.removeEventListener('clockwork:disruptions', load);
    };
  }, [enabled, loc.pathname]);
  return n;
}

const INLINE_LINKS = 4; // pages shown in the top bar; the menu lists all of them

export default function App() {
  const site = useSiteColors();
  const user = useAuth((s) => s.user);
  const openDisruptions = useOpenDisruptions(user?.role === 'admin');
  const loc = useLocation();
  const [menu, setMenu] = useState(false);
  useEffect(() => setMenu(false), [loc.pathname]);
  if (!user) return <Login />;
  const pages = PAGES.filter((p) => p.roles.includes(user.role));
  const home = user.role === 'admin' ? '/' : user.role === 'teacher' ? '/calendar' : '/timetable';
  const inline = pages.slice(0, INLINE_LINKS);
  const current = pages.find((p) => p.path === loc.pathname);
  if (current && !inline.includes(current)) inline.push(current);
  const badge = (path: string) =>
    path === '/disruptions' && openDisruptions > 0 ? <span className="badge">{openDisruptions}</span> : null;

  return (
    <ClickSpark sparkColor={site.sparks} sparkCount={9} sparkRadius={22} sparkSize={9} duration={450}>
    <div className="shell">
      <Backdrop />
      <header className="topbar">
        <NavLink to={home} className="logo" aria-label="Clockwork home">
          <ShinyText text="Clockwork" color={site.ink} shineColor={site.light} speed={3.2} delay={2} />
        </NavLink>
        <button className={`burger${menu ? ' open' : ''}`} aria-label="All pages" aria-expanded={menu} onClick={() => setMenu(!menu)}>
          <i />
          <i />
          <i />
        </button>
        <nav className="topnav">
          {inline.map((p) => (
            <NavLink key={p.path} to={p.path} end={p.path === '/'}>
              {p.label}
              {badge(p.path)}
            </NavLink>
          ))}
        </nav>
        <div className="top-tools">
          <ThemeToggle />
          <Inbox />
          <AccountBox />
        </div>
      </header>
      {menu && (
        <>
          <div className="menu-scrim" onClick={() => setMenu(false)} />
          <nav className="menu-drawer nav" aria-label="All pages">
            {pages.map((p, n) => (
              <NavLink key={p.path} to={p.path} end={p.path === '/'} aria-label={p.label}>
                <em>{String(n + 1).padStart(2, '0')}</em>
                <Icon d={ICONS[p.icon]} />
                <span>{p.label}</span>
                {badge(p.path)}
              </NavLink>
            ))}
          </nav>
        </>
      )}
      <main className="main">
        {loc.pathname === home && <Hero links={pages.filter((p) => p.path !== home).slice(0, 3).map((p) => ({ to: p.path, label: p.label }))} />}
        <AnimatedContent key={loc.pathname} trigger="mount" distance={36} duration={0.6} ease="power3.out" initialOpacity={0}>
          <Routes>
            {pages.map((p) => (
              <Route key={p.path} path={p.path} element={p.element} />
            ))}
            <Route path="*" element={<Navigate to={home} />} />
          </Routes>
        </AnimatedContent>
      </main>
    </div>
    </ClickSpark>
  );
}
