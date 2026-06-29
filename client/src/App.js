import React, { useState } from 'react';
import './App.css';

import Sidebar, { NAV_ITEMS } from './components/Sidebar';
import Topbar                  from './components/Topbar';
import DashboardView           from './views/DashboardView';
import StudentsView            from './views/StudentsView';
import UsersView               from './views/UsersView';
import RolesView               from './views/RolesView';
import AdminGroupsView         from './views/AdminGroupsView';
import ServicesView            from './views/ServicesView';
import PermissionsView         from './views/PermissionsView';
import EndpointsView           from './views/EndpointsView';

// App is intentionally thin — it owns only layout, navigation state,
// and the mobile-sidebar toggle.  All data fetching lives in the view files
// so each view is independently testable and doesn't bloat this context.
function App() {
  const [activeView, setActiveView]   = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigateTo = (view) => {
    setActiveView(view);
    setSidebarOpen(false);
  };

  const activeLabel = NAV_ITEMS.find((n) => n.id === activeView)?.label ?? '';

  const VIEW_MAP = {
    'dashboard':    <DashboardView   onNavigate={navigateTo} />,
    'students':     <StudentsView    />,
    'users':        <UsersView       />,
    'roles':        <RolesView       />,
    'admin-groups': <AdminGroupsView />,
    'services':     <ServicesView    />,
    'permissions':  <PermissionsView />,
    'endpoints':    <EndpointsView   />,
  };

  return (
    <div className="app-layout">
      <Sidebar
        activeView={activeView}
        onNavigate={navigateTo}
        isOpen={sidebarOpen}
      />

      <div className="main-area">
        <Topbar
          activeLabel={activeLabel}
          onMenuToggle={() => setSidebarOpen((o) => !o)}
        />

        <div className="content-wrapper">
          {VIEW_MAP[activeView] ?? <div>View not found.</div>}
        </div>
      </div>

      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}

export default App;
