// import React from 'react';
// import { NavLink } from 'react-router-dom';
// import { useUI } from '../contexts/UIContext';
// import logo from '../assets/logo.png';

// export default function Sidebar() {
//   const { sidebarOpen, closeSidebar } = useUI();

//   // return (
//   //   <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} aria-label="Sidebar navigation">
//   //     <div className="brand">ABA Dashboard</div>
//   //     <nav className="nav" onClick={closeSidebar}>
//   //       <NavLink to="/" end>{({ isActive }) => <span className={isActive ? 'active' : ''}>🏠 Dashboard</span>}</NavLink>
//   //       <NavLink to="/videos">{({ isActive }) => <span className={isActive ? 'active' : ''}>🎬 Videos</span>}</NavLink>
//   //       <NavLink to="/analytics">{({ isActive }) => <span className={isActive ? 'active' : ''}>📈 Analytics</span>}</NavLink>
//   //     </nav>
//   //   </aside>
//   // );

//   return (
//   <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} aria-label="Sidebar navigation">
//     <div className="brand">
//       <img 
//         src="/assets/logo.png" 
//         alt="ABA Dashboard Logo"
//         className="logo"
//       />
//     </div>
//     <nav className="nav" onClick={closeSidebar}>
//       <NavLink to="/" end>
//         {({ isActive }) => <span className={isActive ? 'active' : ''}>🏠 Dashboard</span>}
//       </NavLink>
//       <NavLink to="/videos">
//         {({ isActive }) => <span className={isActive ? 'active' : ''}>🎬 Videos</span>}
//       </NavLink>
//       <NavLink to="/analytics">
//         {({ isActive }) => <span className={isActive ? 'active' : ''}>📈 Analytics</span>}
//       </NavLink>
//     </nav>
//   </aside>
// );
// }

import React from 'react';
import { NavLink } from 'react-router-dom';
import { useUI } from '../contexts/UIContext';
import logo from '../assets/logo.png'; // ✅ logo imported from src/assets

export default function Sidebar() {
  const { sidebarOpen, closeSidebar } = useUI();

  return (
    <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} aria-label="Sidebar navigation">
      <div className="brand">
        <img
          src={logo} // ✅ use imported variable
          alt="ABA Dashboard Logo"
          className="logo"
          style={{
            width: '200px',      // smaller, fits sidebar width
            height: 'auto',     // keep aspect ratio
            margin: '15px auto', // center horizontally
            display: 'block',   // ensure it's centered
          }}
        />
      </div>

      <nav className="nav" onClick={closeSidebar}>
        <NavLink to="/" end>
          {({ isActive }) => (
            <span className={isActive ? 'active' : ''}>🏠 Dashboard</span>
          )}
        </NavLink>

        <NavLink to="/videos">
          {({ isActive }) => (
            <span className={isActive ? 'active' : ''}>🎬 Videos</span>
          )}
        </NavLink>

        <NavLink to="/analytics">
          {({ isActive }) => (
            <span className={isActive ? 'active' : ''}>📈 Analytics</span>
          )}
        </NavLink>
      </nav>
    </aside>
  );
}
