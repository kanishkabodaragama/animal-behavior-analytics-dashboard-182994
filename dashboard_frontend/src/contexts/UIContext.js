import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const UIContext = createContext(null);

// PUBLIC_INTERFACE
export function useUI() {
  /** Access UI context (theme, sidebar controls). */
  return useContext(UIContext);
}

// PUBLIC_INTERFACE
export function UIProvider({ children }) {
  /**
   * Manages UI global state including theme and sidebar visibility.
   * Persists theme to localStorage and applies [data-theme] to documentElement.
   */
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);
  const toggleSidebar = () => setSidebarOpen(s => !s);

  const value = useMemo(() => ({
    theme,
    sidebarOpen,
    toggleTheme,
    openSidebar,
    closeSidebar,
    toggleSidebar
  }), [theme, sidebarOpen]);

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}
