import React, { useEffect, useState } from 'react';
import { adminApi } from '../api';

function EndpointsView() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch routes from the server rather than keeping them hardcoded in the
    // client. This way adding a new backend endpoint automatically appears here
    // without any frontend change.
    adminApi.routes()
      .then((res) => setRoutes(res.data.routes || []))
      .catch(() => setError('Could not load routes — is the API running?'))
      .finally(() => setLoading(false));
  }, []);

  // Group routes by tag for a cleaner sectioned layout
  const grouped = routes.reduce((acc, route) => {
    const tag = route.tags?.[0] || 'Other';
    if (!acc[tag]) acc[tag] = [];
    acc[tag].push(route);
    return acc;
  }, {});

  return (
    <div>
      <div className="view-header">
        <h1 className="view-title">API Endpoints</h1>
        <p className="view-subtitle">
          Live route registry — fetched directly from the running server.
        </p>
      </div>

      <div className="base-url-card" style={{ marginBottom: '28px' }}>
        <div className="base-url-label">Base URL</div>
        <code className="base-url-text">
          {process.env.REACT_APP_API_URL || 'http://localhost:8000'}
        </code>
      </div>

      {loading && <div className="loading-state">Loading routes…</div>}
      {error   && <div className="table-empty">{error}</div>}

      {Object.entries(grouped).map(([tag, tagRoutes]) => (
        <div key={tag} style={{ marginBottom: '32px' }}>
          <div className="section-header">
            <h2 className="section-title">{tag}</h2>
            <span className="topbar__badge">{tagRoutes.length} route{tagRoutes.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="endpoints-grid">
            {tagRoutes.map((ep, i) => (
              <div key={i} className="endpoint-card">
                <div className="endpoint-card__top">
                  <span className={`method-badge method-badge--${ep.method.toLowerCase()}`}>
                    {ep.method}
                  </span>
                  <code className="endpoint-path">{ep.path}</code>
                </div>
                {ep.description && (
                  <p className="endpoint-description">{ep.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default EndpointsView;
