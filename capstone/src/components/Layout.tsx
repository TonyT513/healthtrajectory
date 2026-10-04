import {
  Activity, FileText, FlaskConical, Folder, LayoutDashboard, Menu, Settings, Target, User, X,
} from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useData } from '../lib/store';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/labs', label: 'Lab Results', icon: FlaskConical },
  { to: '/trends', label: 'Trends', icon: Activity },
  { to: '/history', label: 'Health History', icon: FileText },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/documents', label: 'Documents', icon: Folder },
];
const NAV_2 = [
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Logo() {
  return (
    <span className="logo">
      <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden>
        <rect width="32" height="32" rx="7" fill="var(--accent)" />
        <path d="M7 21l6-6 4 4 8-8" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      HealthTrajectory
    </span>
  );
}

export function Layout() {
  const { data } = useData();
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  useEffect(() => setOpen(false), [loc.pathname]);

  const link = ({ to, label, icon: Icon, end }: (typeof NAV)[number]) => (
    <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`}>
      <Icon size={18} strokeWidth={1.75} aria-hidden />
      {label}
    </NavLink>
  );

  return (
    <div className="shell">
      <header className="topbar">
        <Logo />
        <button className="icon-btn" onClick={() => setOpen((o) => !o)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>
      <aside className={`sidebar${open ? ' is-open' : ''}`}>
        <div className="sidebar-logo"><Logo /></div>
        <nav aria-label="Main">
          {NAV.map(link)}
          <div className="nav-sep" />
          {NAV_2.map(link)}
        </nav>
        <div className="sidebar-foot">
          <div className="who">
            <span className="avatar" aria-hidden>{initials(data.profile.name)}</span>
            <span className="who-name">{data.profile.name || data.profile.email}</span>
          </div>
          <p className="disclaimer">For your records only. HealthTrajectory doesn’t diagnose. Talk to your clinician about your results.</p>
        </div>
      </aside>
      {open && <div className="scrim" onClick={() => setOpen(false)} />}
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((s) => s[0]!.toUpperCase()).join('') || '·';
}

export function PageHeader({ title, sub, actions }: { title: ReactNode; sub?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="page-head">
      <div>
        {sub && <div className="page-sub">{sub}</div>}
        <h1>{title}</h1>
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}

export function Empty({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}
