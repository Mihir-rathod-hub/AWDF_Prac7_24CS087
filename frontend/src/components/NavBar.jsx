import React from 'react';
import { NavLink } from 'react-router-dom';
import useAuth from '../context/useAuth';

/**
 * NavBar Component
 * Provides clean navigation, theme toggle, and authentication actions.
 */
function NavBar({ theme, onToggleTheme }) {
  const { isAuthenticated, user, logout, openLogin } = useAuth();

  const displayName =
    user?.name || (user?.email ? user.email.split('@')[0] : 'User');

  return (
    <nav className="portfolio-nav">
      <div className="nav-brand">
        <NavLink to="/" className="brand-link">
          TaskManager
        </NavLink>
      </div>

      <div className="nav-links">
        <NavLink
          to="/"
          end
          className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
        >
          Home
        </NavLink>
        <NavLink
          to="/tasks"
          className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
        >
          Tasks
        </NavLink>
        <NavLink
          to="/contact"
          className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
        >
          Contact
        </NavLink>
      </div>

      <div className="nav-actions">
        {/* Authentication Controls */}
        {isAuthenticated ? (
          <div className="nav-user-controls">
            <span
              className="nav-user-chip"
              title={`Logged in as ${user?.email}`}
            >
              <svg
                className="user-chip-icon-svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span className="user-chip-name">{displayName}</span>
            </span>
            <button
              type="button"
              onClick={logout}
              className="nav-logout-btn"
              title="Sign out of your account"
              aria-label="Sign out"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => openLogin()}
            className="nav-login-btn"
            title="Sign in to your account"
            aria-label="Sign In"
          >
            Sign In
          </button>
        )}

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={onToggleTheme}
          className="theme-toggle-btn"
          aria-label="Toggle dark and light theme"
        >
          {theme === 'dark' ? (
            <span className="theme-toggle-content">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
              Light
            </span>
          ) : (
            <span className="theme-toggle-content">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
              Dark
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}

export default NavBar;
