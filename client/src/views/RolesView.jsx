import React, { useEffect, useState } from 'react';
import { roleApi } from '../api';
import FeedbackAlert from '../components/FeedbackAlert';

const EMPTY = { name: '', description: '', is_active: true };

function RolesView() {
  const [roles, setRoles]       = useState([]);
  const [form, setForm]         = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const load = async () => {
    try {
      setLoading(true);
      const res = await roleApi.getAll();
      setRoles(res.data.roles || []);
    } catch {
      setFeedback({ type: 'danger', message: 'Failed to load roles.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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
        await roleApi.update(editingId, payload);
        setFeedback({ type: 'success', message: 'Role updated.' });
      } else {
        await roleApi.create(payload);
        setFeedback({ type: 'success', message: 'Role created.' });
      }
      reset();
      await load();
    } catch (err) {
      setFeedback({ type: 'danger', message: err?.response?.data?.detail || 'Save failed.' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (r) => {
    setEditingId(r.role_id);
    setForm({
      name:        r.name        || '',
      description: r.description || '',
      is_active:   r.is_active   ?? true,
    });
    setFeedback({ type: 'info', message: 'Editing — update and save.' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this role permanently?')) return;
    try {
      setLoading(true);
      await roleApi.remove(id);
      setFeedback({ type: 'success', message: 'Role deleted.' });
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
        <h1 className="view-title">{editingId ? 'Edit Role' : 'Roles'}</h1>
        <p className="view-subtitle">Define roles that can be assigned to users.</p>
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
              <div className="eyebrow">Role</div>
              <h2 className="form-card__title">{editingId ? 'Update Role' : 'Add New Role'}</h2>
            </div>
            <span className={`mode-badge ${editingId ? 'mode-badge--edit' : 'mode-badge--new'}`}>
              {editingId ? 'Editing' : 'New'}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="model-form">
            <div className="form-field">
              <label className="form-label">Name <span className="required">*</span></label>
              <input className="form-input" name="name" placeholder="e.g. Admin"
                value={form.name} onChange={handleChange} required />
            </div>

            <div className="form-field">
              <label className="form-label">Description</label>
              <input className="form-input" name="description"
                placeholder="What this role allows"
                value={form.description} onChange={handleChange} />
            </div>

            <div className="checkbox-group">
              <label className="checkbox-label">
                <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
                Active
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn--primary" disabled={loading}>
                {loading ? 'Saving…' : editingId ? 'Save Changes' : 'Create Role'}
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
              <h2 className="table-card__title">All Roles ({roles.length})</h2>
            </div>
            <button className="btn btn--ghost" onClick={load} disabled={loading}>Refresh</button>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.length === 0 ? (
                  <tr><td colSpan="4" className="table-empty">No roles yet.</td></tr>
                ) : roles.map((r) => (
                  <tr key={r.role_id} className="data-table__row">
                    <td><strong>{r.name}</strong></td>
                    <td>{r.description || '—'}</td>
                    <td>
                      <span className={`status-badge ${r.is_active ? 'status-badge--active' : 'status-badge--inactive'}`}>
                        {r.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="btn btn--edit" onClick={() => handleEdit(r)}>Edit</button>
                        <button className="btn btn--delete" onClick={() => handleDelete(r.role_id)}>Delete</button>
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

export default RolesView;
