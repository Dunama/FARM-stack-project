import React, { useEffect, useState } from 'react';
import { userApi } from '../api';
import FeedbackAlert from '../components/FeedbackAlert';

const EMPTY = {
  full_name: '', email: '', phone: '', address: '', city: '',
  state: '', country: '', date_of_birth: '', nin: '', specialization: '',
  profile_image_url: '', role_id: '', admin_group_id: '',
  service_id: '', permission_id: '',
  verification_status: 'pending',
  marketing_consent: false, is_active: true, is_available: true,
};

function UsersView() {
  const [users, setUsers]       = useState([]);
  const [form, setForm]         = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const load = async () => {
    try {
      setLoading(true);
      const res = await userApi.getAll();
      setUsers(res.data.users || []);
    } catch {
      setFeedback({ type: 'danger', message: 'Failed to load users.' });
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
    // Drop empty strings so optional fields aren't sent as "" — the API
    // rejects "" for ObjectId fields and would overwrite valid values on update.
    const payload = Object.fromEntries(
      Object.entries(form).filter(([, v]) => v !== '')
    );
    try {
      setLoading(true);
      if (editingId) {
        await userApi.update(editingId, payload);
        setFeedback({ type: 'success', message: 'User updated successfully.' });
      } else {
        await userApi.create(payload);
        setFeedback({ type: 'success', message: 'User created successfully.' });
      }
      reset();
      await load();
    } catch (err) {
      setFeedback({ type: 'danger', message: err?.response?.data?.detail || 'Save failed.' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (u) => {
    setEditingId(u.user_id);
    setForm({
      full_name:         u.full_name         || '',
      email:             u.email             || '',
      phone:             u.phone             || '',
      address:           u.address           || '',
      city:              u.city              || '',
      state:             u.state             || '',
      country:           u.country           || '',
      date_of_birth:     u.date_of_birth     || '',
      nin:               u.nin               || '',
      specialization:    u.specialization    || '',
      profile_image_url: u.profile_image_url || '',
      role_id:           u.role_id           || '',
      admin_group_id:    u.admin_group_id    || '',
      service_id:        u.service_id        || '',
      permission_id:     u.permission_id     || '',
      verification_status: u.verification_status || 'pending',
      marketing_consent: u.marketing_consent ?? false,
      is_active:         u.is_active         ?? true,
      is_available:      u.is_available      ?? true,
    });
    setFeedback({ type: 'info', message: 'Editing — update and save.' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try {
      setLoading(true);
      await userApi.remove(id);
      setFeedback({ type: 'success', message: 'User deleted.' });
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
        <h1 className="view-title">{editingId ? 'Edit User' : 'Users'}</h1>
        <p className="view-subtitle">Manage platform users and their profiles.</p>
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
              <div className="eyebrow">User Profile</div>
              <h2 className="form-card__title">
                {editingId ? 'Update User' : 'Add New User'}
              </h2>
            </div>
            <span className={`mode-badge ${editingId ? 'mode-badge--edit' : 'mode-badge--new'}`}>
              {editingId ? 'Editing' : 'New'}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="model-form">
            <div className="form-section-label">Identity</div>

            <div className="form-field">
              <label className="form-label">Full Name <span className="required">*</span></label>
              <input className="form-input" name="full_name" placeholder="John Doe"
                value={form.full_name} onChange={handleChange} required />
            </div>

            <div className="form-field">
              <label className="form-label">
                Email {!editingId && <span className="required">*</span>}
              </label>
              <input type="email" className="form-input" name="email"
                placeholder="john@example.com" value={form.email}
                onChange={handleChange} required={!editingId} />
            </div>

            <div className="form-row">
              <div className="form-field">
                <label className="form-label">Phone</label>
                <input className="form-input" name="phone" placeholder="+234 800 000 0000"
                  value={form.phone} onChange={handleChange} />
              </div>
              <div className="form-field">
                <label className="form-label">Date of Birth</label>
                <input type="date" className="form-input" name="date_of_birth"
                  value={form.date_of_birth} onChange={handleChange} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label className="form-label">NIN</label>
                <input className="form-input" name="nin" placeholder="National ID number"
                  value={form.nin} onChange={handleChange} />
              </div>
              <div className="form-field">
                <label className="form-label">Specialization</label>
                <input className="form-input" name="specialization"
                  placeholder="e.g. Engineering" value={form.specialization} onChange={handleChange} />
              </div>
            </div>

            <div className="form-section-label">Location</div>

            <div className="form-field">
              <label className="form-label">Address</label>
              <input className="form-input" name="address" placeholder="Street address"
                value={form.address} onChange={handleChange} />
            </div>

            <div className="form-row">
              <div className="form-field">
                <label className="form-label">City</label>
                <input className="form-input" name="city" placeholder="Lagos"
                  value={form.city} onChange={handleChange} />
              </div>
              <div className="form-field">
                <label className="form-label">State</label>
                <input className="form-input" name="state" placeholder="Lagos State"
                  value={form.state} onChange={handleChange} />
              </div>
            </div>

            <div className="form-field">
              <label className="form-label">Country</label>
              <input className="form-input" name="country" placeholder="Nigeria"
                value={form.country} onChange={handleChange} />
            </div>

            <div className="form-section-label">Access Control</div>

            <div className="form-row">
              <div className="form-field">
                <label className="form-label">Role ID</label>
                <input className="form-input" name="role_id" placeholder="MongoDB ObjectId"
                  value={form.role_id} onChange={handleChange} />
              </div>
              <div className="form-field">
                <label className="form-label">Admin Group ID</label>
                <input className="form-input" name="admin_group_id" placeholder="MongoDB ObjectId"
                  value={form.admin_group_id} onChange={handleChange} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label className="form-label">Service ID</label>
                <input className="form-input" name="service_id" placeholder="MongoDB ObjectId"
                  value={form.service_id} onChange={handleChange} />
              </div>
              <div className="form-field">
                <label className="form-label">Permission ID</label>
                <input className="form-input" name="permission_id" placeholder="MongoDB ObjectId"
                  value={form.permission_id} onChange={handleChange} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label className="form-label">Verification Status</label>
                <select className="form-input" name="verification_status"
                  value={form.verification_status} onChange={handleChange}>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Profile Image URL</label>
                <input className="form-input" name="profile_image_url"
                  placeholder="https://..." value={form.profile_image_url} onChange={handleChange} />
              </div>
            </div>

            <div className="form-section-label">Status Flags</div>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
                Active
              </label>
              <label className="checkbox-label">
                <input type="checkbox" name="is_available" checked={form.is_available} onChange={handleChange} />
                Available
              </label>
              <label className="checkbox-label">
                <input type="checkbox" name="marketing_consent" checked={form.marketing_consent} onChange={handleChange} />
                Marketing Consent
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn--primary" disabled={loading}>
                {loading ? 'Saving…' : editingId ? 'Save Changes' : 'Create User'}
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
              <h2 className="table-card__title">All Users ({users.length})</h2>
            </div>
            <button className="btn btn--ghost" onClick={load} disabled={loading}>Refresh</button>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Verification</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan="5" className="table-empty">No users yet.</td></tr>
                ) : users.map((u) => (
                  <tr key={u.user_id} className="data-table__row">
                    <td>
                      <div className="name-cell">
                        <div className="avatar">{u.full_name?.[0]}</div>
                        <div>
                          <div className="name-primary">{u.full_name}</div>
                          <div className="name-id">{u.user_id}</div>
                        </div>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`status-badge ${u.is_active ? 'status-badge--active' : 'status-badge--inactive'}`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-badge--${u.verification_status}`}>
                        {u.verification_status}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="btn btn--edit" onClick={() => handleEdit(u)}>Edit</button>
                        <button className="btn btn--delete" onClick={() => handleDelete(u.user_id)}>Delete</button>
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

export default UsersView;
