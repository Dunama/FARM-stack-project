import React, { useEffect, useState } from 'react';
import { adminApi } from '../api';

function DashboardView({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Stats are fetched from the server rather than computed locally so the
    // dashboard reflects counts from ALL collections, not just what the client
    // happens to have loaded in state at this moment.
    adminApi.stats()
      .then((res) => setStats(res.data.stats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { value: stats.students           ?? '—', label: 'Total Students',       variant: 'primary' },
    { value: stats.users?.total       ?? '—', label: 'Total Users',          variant: 'info'    },
    { value: stats.users?.active      ?? '—', label: 'Active Users',         variant: 'success' },
    { value: stats.roles              ?? '—', label: 'Roles',                variant: 'primary' },
    { value: stats.groups             ?? '—', label: 'Admin Groups',         variant: 'info'    },
    { value: stats.services           ?? '—', label: 'Services',             variant: 'primary' },
    { value: stats.permissions        ?? '—', label: 'Permissions',          variant: 'success' },
    { value: stats.verification?.verified ?? '—', label: 'Verified Users',   variant: 'success' },
    { value: stats.verification?.pending  ?? '—', label: 'Pending Verification', variant: 'warning' },
  ] : [];

  const quickLinks = [
    { id: 'students',     label: 'Students'     },
    { id: 'users',        label: 'Users'        },
    { id: 'roles',        label: 'Roles'        },
    { id: 'admin-groups', label: 'Admin Groups' },
    { id: 'services',     label: 'Services'     },
    { id: 'permissions',  label: 'Permissions'  },
    { id: 'endpoints',    label: 'API Endpoints' },
  ];

  return (
    <div>
      <div className="view-header">
        <h1 className="view-title">Dashboard</h1>
        <p className="view-subtitle">System-wide overview fetched live from the API</p>
      </div>

      {loading ? (
        <div className="loading-state">Loading stats…</div>
      ) : stats ? (
        <div className="stats-grid">
          {statCards.map((card) => (
            <div className="stat-card" key={card.label}>
              <div className="stat-card__value">{card.value}</div>
              <div className="stat-card__label">{card.label}</div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted">Could not load stats — is the API running?</p>
      )}

      <div className="section-header" style={{ marginTop: '36px' }}>
        <h2 className="section-title">Quick Actions</h2>
      </div>
      <div className="quick-actions">
        {quickLinks.map((item) => (
          <button
            key={item.id}
            className="quick-action-btn"
            onClick={() => onNavigate(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default DashboardView;
