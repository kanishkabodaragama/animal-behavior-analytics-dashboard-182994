import React from 'react';
import { NavLink } from 'react-router-dom';
import { useUI } from '../contexts/UIContext';
import logo from '../assets/logo.png';

export default function Sidebar() {
  const { sidebarOpen } = useUI();

  return (
    <aside
      className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}
      aria-label="Sidebar navigation"
    >
      <div className="brand">
        <img
          src={logo}
          alt="ABA Dashboard Logo"
          className="logo"
        />
      </div>

      <nav className="nav">
        <NavLink to="/" end>
          {({ isActive }) => (
            <div className={`nav-item ${isActive ? 'active' : ''}`}>
              <span className="icon">🏠</span>
              <span className="label">Dashboard</span>
            </div>
          )}
        </NavLink>

        <NavLink to="/videos">
          {({ isActive }) => (
            <div className={`nav-item ${isActive ? 'active' : ''}`}>
              <span className="icon">🎬</span>
              <span className="label">Videos</span>
            </div>
          )}
        </NavLink>

        <NavLink to="/analytics">
          {({ isActive }) => (
            <div className={`nav-item ${isActive ? 'active' : ''}`}>
              <span className="icon">📈</span>
              <span className="label">Analytics</span>
            </div>
          )}
        </NavLink>
      </nav>
    </aside>
  );
}
