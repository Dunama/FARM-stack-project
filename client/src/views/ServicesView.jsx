import React, { useEffect, useState } from 'react';
import { serviceApi } from '../api';
import FeedbackAlert from '../components/FeedbackAlert';

const EMPTY = { name: '', description: '', endpoint: '', is_active: true };

function ServicesView() {
  const [services, setServices] = useState([]);
  const [form, setForm]         = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const load = async () => {
    try {
      setLoading(true);
      const res = await serviceApi.getAll();
      setServices(res.data.services || []);
    } catch {
      setFeedback({ type: 'danger', message: 'Failed to load services.' });
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
        await serviceApi.update(editingId, payload);
        setFeedback({ type: 'success', message: 'Service updated.' });
      } else {
        await serviceApi.create(payload);
        setFeedback({ type: 'success', message: 'Service created.' });
      }
      reset();
      await load();
    } catch (err) {
      setFeedback({ type: 'danger', message: err?.response?.data?.detail || 'Save failed.' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (s) => {
    setEditingId(s.service_id);
    setForm({
      name:        s.name        || '',
      description: s.description || '',
      endpoint:    s.endpoint    || '',
      is_active:   s.is_active   ?? true,
    });
    setFeedback({ type: 'info', message: 'Editing — update and save.' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this service permanently?')) return;
    try {
      setLoading(true);
      await serviceApi.remove(id);
      setFeedback({ type: 'success', message: 'Service deleted.' });
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
        <h1 className="view-title">{editingId ? 'Edit Service' : 'Services'}</h1>
        <p className="view-subtitle">Register services that users can be assigned to.</p>
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
              <div className="eyebrow">Service</div>
              <h2 className="form-card__title">
                {editingId ? 'Update Service' : 'Add New Service'}
              </h2>
            </div>
            <span className={`mode-badge ${editingId ? 'mode-badge--edit' : 'mode-badge--new'}`}>
              {editingId ? 'Editing' : 'New'}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="model-form">
            <div className="form-field">
              <label className="form-label">Name <span className="required">*</span></label>
              <input className="form-input" name="name" placeholder="e.g. Payment Service"
                value={form.name} onChange={handleChange} required />
            </div>

            <div className="form-field">
              <label className="form-label">Description</label>
              <input className="form-input" name="description"
                placeholder="What this service does"
                value={form.description} onChange={handleChange} />
            </div>

            <div className="form-field">
              <label className="form-label">Endpoint URL</label>
              <input className="form-input" name="endpoint"
                placeholder="https://api.example.com/service"
                value={form.endpoint} onChange={handleChange} />
            </div>

            <div className="checkbox-group">
              <label className="checkbox-label">
                <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
                Active
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn--primary" disabled={loading}>
                {loading ? 'Saving…' : editingId ? 'Save Changes' : 'Create Service'}
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
              <h2 className="table-card__title">All Services ({services.length})</h2>
            </div>
            <button className="btn btn--ghost" onClick={load} disabled={loading}>Refresh</button>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Endpoint</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.length === 0 ? (
                  <tr><td colSpan="5" className="table-empty">No services yet.</td></tr>
                ) : services.map((s) => (
                  <tr key={s.service_id} className="data-table__row">
                    <td><strong>{s.name}</strong></td>
                    <td>{s.description || '—'}</td>
                    <td>
                      {s.endpoint
                        ? <code className="endpoint-path">{s.endpoint}</code>
                        : '—'}
                    </td>
                    <td>
                      <span className={`status-badge ${s.is_active ? 'status-badge--active' : 'status-badge--inactive'}`}>
                        {s.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="btn btn--edit" onClick={() => handleEdit(s)}>Edit</button>
                        <button className="btn btn--delete" onClick={() => handleDelete(s.service_id)}>Delete</button>
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

export default ServicesView;
