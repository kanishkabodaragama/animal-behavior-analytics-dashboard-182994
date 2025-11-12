import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useUI } from '../contexts/UIContext';

export default function MainLayout() {
  const { sidebarOpen } = useUI();

  return (
    <div className={`app-shell ${sidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
      <Sidebar />
      <Topbar />
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
