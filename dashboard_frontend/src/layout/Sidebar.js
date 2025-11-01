import React from 'react';
import { NavLink } from 'react-router-dom';
import { useUI } from '../contexts/UIContext';

export default function Sidebar() {
  const { sidebarOpen, closeSidebar } = useUI();

  return (
    <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} aria-label="Sidebar navigation">
      <div className="brand">ABA Dashboard</div>
      <nav className="nav" onClick={closeSidebar}>
        <NavLink to="/" end>{({ isActive }) => <span className={isActive ? 'active' : ''}>🏠 Dashboard</span>}</NavLink>
        <NavLink to="/videos">{({ isActive }) => <span className={isActive ? 'active' : ''}>🎬 Videos</span>}</NavLink>
        <NavLink to="/analytics">{({ isActive }) => <span className={isActive ? 'active' : ''}>📈 Analytics</span>}</NavLink>
      </nav>
    </aside>
  );
}
