import React from 'react';

// NAV_ITEMS is defined here rather than in App.js so Sidebar owns its own
// structure — App.js only needs to know which id is active, not the full list.
export const NAV_ITEMS = [
  { id: 'dashboard',    label: 'Dashboard'     },
  { id: 'students',     label: 'Students'      },
  { id: 'users',        label: 'Users'         },
  { id: 'roles',        label: 'Roles'         },
  { id: 'admin-groups', label: 'Admin Groups'  },
  { id: 'services',     label: 'Services'      },
  { id: 'permissions',  label: 'Permissions'   },
  { id: 'endpoints',    label: 'API Endpoints' },
];

function Sidebar({ activeView, onNavigate, isOpen }) {
  return (
    <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
      <div className="sidebar__brand">
        <div className="sidebar__logo">F</div>
        <span className="sidebar__title">FARM Stack</span>
      </div>

      <nav className="sidebar__nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`sidebar__nav-item ${activeView === item.id ? 'sidebar__nav-item--active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar__footer">
        <span className="api-status-dot" />
        <span>API Connected</span>
      </div>
    </aside>
  );
}

export default Sidebar;
