import type { PropsWithChildren } from "react";
import { BookOpen, Flag, LayoutDashboard, Map, Menu, Search, Settings, X } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useAppStore } from "../state/appStore";
import { AuthDialog } from "./AuthDialog";
import { BrandMark } from "./BrandMark";
import { CommandPalette } from "./CommandPalette";
import { SyncBadge } from "./SyncBadge";

const routes = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/path", label: "Path", icon: Map },
  { to: "/milestones", label: "Milestones", icon: Flag },
  { to: "/reference", label: "Reference", icon: BookOpen },
];

export function AppShell({ children }: PropsWithChildren) {
  const { user, signOut } = useAuth();
  const { mobileNavOpen, setMobileNavOpen, setCommandOpen, setAuthOpen } = useAppStore();

  return (
    <div className="app-frame">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="brand-link" aria-label="ActionDev home">
            <BrandMark />
            <span>ActionDev</span>
          </Link>
          <nav className="desktop-nav" aria-label="Primary navigation">
            {routes.map(({ to, label }) => (
              <NavLink key={to} to={to} className={({ isActive }) => (isActive ? "active" : undefined)}>{label}</NavLink>
            ))}
          </nav>
          <div className="topbar-actions">
            <button className="search-button" onClick={() => setCommandOpen(true)} aria-label="Search ActionDev">
              <Search size={15} />
              <span>Search</span>
              <kbd>⌘ K</kbd>
            </button>
            <SyncBadge />
            {user ? (
              <div className="account-group">
                <Link className="account-avatar" to="/settings" aria-label="Account settings">
                  {(user.email?.[0] ?? "A").toUpperCase()}
                </Link>
                <button className="text-button desktop-only" onClick={() => void signOut()}>Sign out</button>
              </div>
            ) : (
              <button className="button button-compact" onClick={() => setAuthOpen(true)}>Sign in</button>
            )}
            <button className="icon-button mobile-menu-button" onClick={() => setMobileNavOpen(!mobileNavOpen)} aria-expanded={mobileNavOpen} aria-controls="mobile-nav" aria-label="Toggle navigation">
              {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>
      {mobileNavOpen && (
        <nav id="mobile-nav" className="mobile-nav" aria-label="Mobile navigation">
          {routes.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to}><Icon size={18} />{label}</NavLink>)}
          <NavLink to="/settings"><Settings size={18} />Settings</NavLink>
          {user && <button onClick={() => void signOut()}>Sign out</button>}
        </nav>
      )}
      <main id="main-content">{children}</main>
      <footer className="footer">
        <div>
          <Link to="/" className="brand-link" aria-label="ActionDev home"><BrandMark /><span>ActionDev</span></Link>
          <p>Learn the architecture. Build the game yourself.</p>
        </div>
        <div className="footer-links">
          <Link to="/path">Curriculum</Link>
          <Link to="/reference">Reference</Link>
          <Link to="/settings">Privacy & account</Link>
        </div>
      </footer>
      <AuthDialog />
      <CommandPalette />
    </div>
  );
}
