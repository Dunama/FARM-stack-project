import React, { useEffect, useState } from 'react';
import { permissionApi } from '../api';
import FeedbackAlert from '../components/FeedbackAlert';

const EMPTY = { name: '', resource: '', action: '', description: '' };

function PermissionsView() {
  const [permissions, setPermissions] = useState([]);
  const [form, setForm]               = useState(EMPTY);
  const [editingId, setEditingId]     = useState(null);
  const [loading, setLoading]         = useState(false);
  const [feedback, setFeedback]       = useState({ type: '', message: '' });

  const load = async () => {
    try {
      setLoading(true);
      const res = await permissionApi.getAll();
      setPermissions(res.data.permissions || []);
    } catch {
      setFeedback({ type: 'danger', message: 'Failed to load permissions.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const reset = () => {
    setForm(EMPTY);
    setEditingId(null);
    setFeedback({ type: '', message: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = Object.fromEntries(
      Object.entries(form).filter(([, v]) => v !== '')
    );
    try {
      setLoading(true);
      if (editingId) {
        await permissionApi.update(editingId, payload);
        setFeedback({ type: 'success', message: 'Permission updated.' });
      } else {
        await permissionApi.create(payload);
        setFeedback({ type: 'success', message: 'Permission created.' });
      }
      reset();
      await load();
    } catch (err) {
      setFeedback({ type: 'danger', message: err?.response?.data?.detail || 'Save failed.' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (p) => {
    setEditingId(p.permission_id);
    setForm({
      name:        p.name        || '',
      resource:    p.resource    || '',
      action:      p.action      || '',
      description: p.description || '',
    });
    setFeedback({ type: 'info', message: 'Editing — update and save.' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this permission permanently?')) return;
    try {
      setLoading(true);
      await permissionApi.remove(id);
      setFeedback({ type: 'success', message: 'Permission deleted.' });
      await load();
    } catch (err) {
      setFeedback({ type: 'danger', message: err?.response?.data?.detail || 'Delete failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="view-header">
        <h1 className="view-title">{editingId ? 'Edit Permission' : 'Permissions'}</h1>
        <p className="view-subtitle">Define fine-grained resource + action permissions.</p>
      </div>

      <FeedbackAlert
        type={feedback.type}
        message={feedback.message}
        onClose={() => setFeedback({ type: '', message: '' })}
      />

      <div className="crud-layout">
        {/* ── Form ── */}
        <div className="form-card">
          <div className="form-card__header">
            <div>
              <div className="eyebrow">Permission</div>
              <h2 className="form-card__title">
                {editingId ? 'Update Permission' : 'Add New Permission'}
              </h2>
            </div>
            <span className={`mode-badge ${editingId ? 'mode-badge--edit' : 'mode-badge--new'}`}>
              {editingId ? 'Editing' : 'New'}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="model-form">
            <div className="form-field">
              <label className="form-label">Name <span className="required">*</span></label>
              <input className="form-input" name="name" placeholder="e.g. view-users"
                value={form.name} onChange={handleChange} required />
            </div>

            <div className="form-row">
              <div className="form-field">
                <label className="form-label">Resource <span className="required">*</span></label>
                <input className="form-input" name="resource" placeholder="e.g. users"
                  value={form.resource} onChange={handleChange} required />
              </div>
              <div className="form-field">
                <label className="form-label">Action <span className="required">*</span></label>
                <input className="form-input" name="action" placeholder="e.g. read"
                  value={form.action} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-field">
              <label className="form-label">Description</label>
              <input className="form-input" name="description"
                placeholder="What this permission grants"
                value={form.description} onChange={handleChange} />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn--primary" disabled={loading}>
                {loading ? 'Saving…' : editingId ? 'Save Changes' : 'Create Permission'}
              </button>
              <button type="button" className="btn btn--secondary" onClick={reset}>Clear</button>
            </div>
          </form>
        </div>

        {/* ── Table ── */}
        <div className="table-card">
          <div className="table-card__header">
            <div>
              <div className="eyebrow">Records</div>
              <h2 className="table-card__title">All Permissions ({permissions.length})</h2>
            </div>
            <button className="btn btn--ghost" onClick={load} disabled={loading}>Refresh</button>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Resource</th>
                  <th>Action</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {permissions.length === 0 ? (
                  <tr><td colSpan="5" className="table-empty">No permissions yet.</td></tr>
                ) : permissions.map((p) => (
                  <tr key={p.permission_id} className="data-table__row">
                    <td><strong>{p.name}</strong></td>
                    <td><code className="endpoint-path">{p.resource}</code></td>
                    <td><span className="level-tag">{p.action}</span></td>
                    <td>{p.description || '—'}</td>
                    <td>
                      <div className="action-btns">
                        <button className="btn btn--edit" onClick={() => handleEdit(p)}>Edit</button>
                        <button className="btn btn--delete" onClick={() => handleDelete(p.permission_id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PermissionsView;
