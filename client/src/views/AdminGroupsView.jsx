import React, { useEffect, useState } from 'react';
import { adminGroupApi } from '../api';
import FeedbackAlert from '../components/FeedbackAlert';

const EMPTY = { name: '', description: '', permission_ids: '', is_active: true };

function AdminGroupsView() {
  const [groups, setGroups]     = useState([]);
  const [form, setForm]         = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const load = async () => {
    try {
      setLoading(true);
      const res = await adminGroupApi.getAll();
      setGroups(res.data.groups || []);
    } catch {
      setFeedback({ type: 'danger', message: 'Failed to load admin groups.' });
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
    // permission_ids is stored as a comma-separated string in the form
    // but the API expects an array — split here before sending.
    const payload = {
      ...form,
      permission_ids: form.permission_ids
        ? form.permission_ids.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
    };
    try {
      setLoading(true);
      if (editingId) {
        await adminGroupApi.update(editingId, payload);
        setFeedback({ type: 'success', message: 'Admin group updated.' });
      } else {
        await adminGroupApi.create(payload);
        setFeedback({ type: 'success', message: 'Admin group created.' });
      }
      reset();
      await load();
    } catch (err) {
      setFeedback({ type: 'danger', message: err?.response?.data?.detail || 'Save failed.' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (g) => {
    setEditingId(g.group_id);
    setForm({
      name:           g.name           || '',
      description:    g.description    || '',
      // Join array to string for the text field; split back on submit
      permission_ids: (g.permission_ids || []).join(', '),
      is_active:      g.is_active      ?? true,
    });
    setFeedback({ type: 'info', message: 'Editing — update and save.' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this admin group permanently?')) return;
    try {
      setLoading(true);
      await adminGroupApi.remove(id);
      setFeedback({ type: 'success', message: 'Admin group deleted.' });
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
        <h1 className="view-title">{editingId ? 'Edit Admin Group' : 'Admin Groups'}</h1>
        <p className="view-subtitle">Group roles and permissions into manageable admin sets.</p>
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
              <div className="eyebrow">Admin Group</div>
              <h2 className="form-card__title">
                {editingId ? 'Update Group' : 'Add New Group'}
              </h2>
            </div>
            <span className={`mode-badge ${editingId ? 'mode-badge--edit' : 'mode-badge--new'}`}>
              {editingId ? 'Editing' : 'New'}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="model-form">
            <div className="form-field">
              <label className="form-label">Name <span className="required">*</span></label>
              <input className="form-input" name="name" placeholder="e.g. Super Admins"
                value={form.name} onChange={handleChange} required />
            </div>

            <div className="form-field">
              <label className="form-label">Description</label>
              <input className="form-input" name="description"
                placeholder="What this group manages"
                value={form.description} onChange={handleChange} />
            </div>

            <div className="form-field">
              <label className="form-label">Permission IDs</label>
              <input className="form-input" name="permission_ids"
                placeholder="Comma-separated ObjectIds"
                value={form.permission_ids} onChange={handleChange} />
              <span className="form-hint">Separate multiple IDs with commas</span>
            </div>

            <div className="checkbox-group">
              <label className="checkbox-label">
                <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
                Active
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn--primary" disabled={loading}>
                {loading ? 'Saving…' : editingId ? 'Save Changes' : 'Create Group'}
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
              <h2 className="table-card__title">All Admin Groups ({groups.length})</h2>
            </div>
            <button className="btn btn--ghost" onClick={load} disabled={loading}>Refresh</button>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Permissions</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {groups.length === 0 ? (
                  <tr><td colSpan="5" className="table-empty">No admin groups yet.</td></tr>
                ) : groups.map((g) => (
                  <tr key={g.group_id} className="data-table__row">
                    <td><strong>{g.name}</strong></td>
                    <td>{g.description || '—'}</td>
                    <td>{g.permission_ids?.length || 0} permission{g.permission_ids?.length !== 1 ? 's' : ''}</td>
                    <td>
                      <span className={`status-badge ${g.is_active ? 'status-badge--active' : 'status-badge--inactive'}`}>
                        {g.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="btn btn--edit" onClick={() => handleEdit(g)}>Edit</button>
                        <button className="btn btn--delete" onClick={() => handleDelete(g.group_id)}>Delete</button>
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

export default AdminGroupsView;
