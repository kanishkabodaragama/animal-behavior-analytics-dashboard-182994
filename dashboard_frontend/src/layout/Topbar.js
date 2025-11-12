import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';

export default function Topbar() {
  const { user, logout } = useAuth();
  const { toggleTheme, toggleSidebar } = useUI();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval); 
  }, []);

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button className="btn ghost" onClick={toggleSidebar} aria-label="Toggle sidebar">☰</button>
        <div className="pill">
          <span>🐾 Animal Type</span>
          <strong>Ant Eater</strong>
        </div>
        <div className="pill">
          <span>🕒 {format(now, 'PPpp')}</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span className="muted">Signed in as {user?.name}</span>
        {/* <button className="btn ghost" onClick={toggleTheme}>Toggle Theme</button> */}
        <button className="btn" onClick={logout}>Logout</button>
      </div>
    </header>
  );
}
