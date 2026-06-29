import React, { useEffect, useState } from 'react';
import { studentApi } from '../api';
import FeedbackAlert from '../components/FeedbackAlert';

const EMPTY = { fname: '', lname: '', age: '', level: '', email: '', gpa: '', cgpa: '' };

function StudentsView() {
  const [students, setStudents] = useState([]);
  const [form, setForm]         = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const load = async () => {
    try {
      setLoading(true);
      const res = await studentApi.getAll();
      setStudents(res.data.students || []);
    } catch (err) {
      setFeedback({ type: 'danger', message: err?.response?.data?.error || 'Failed to load students.' });
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
    // age/gpa/cgpa arrive as strings from the form; coerce before sending
    // so the API receives the correct numeric types matching the Pydantic model.
    const payload = {
      ...form,
      age:  Number(form.age),
      gpa:  Number(form.gpa),
      cgpa: Number(form.cgpa),
    };
    try {
      setLoading(true);
      if (editingId) {
        await studentApi.update(editingId, payload);
        setFeedback({ type: 'success', message: 'Student updated successfully.' });
      } else {
        await studentApi.create(payload);
        setFeedback({ type: 'success', message: 'Student created successfully.' });
      }
      reset();
      await load();
    } catch (err) {
      setFeedback({ type: 'danger', message: err?.response?.data?.error || 'Save failed.' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (s) => {
    setEditingId(s.student_id);
    setForm({
      fname: s.fname  || '',
      lname: s.lname  || '',
      age:   s.age    ?? '',
      level: s.level  || '',
      email: s.email  || '',
      gpa:   s.gpa    ?? '',
      cgpa:  s.cgpa   ?? '',
    });
    setFeedback({ type: 'info', message: 'Editing — update the fields below and save.' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student permanently?')) return;
    try {
      setLoading(true);
      await studentApi.remove(id);
      setFeedback({ type: 'success', message: 'Student deleted.' });
      await load();
    } catch (err) {
      setFeedback({ type: 'danger', message: err?.response?.data?.error || 'Delete failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="view-header">
        <h1 className="view-title">{editingId ? 'Edit Student' : 'Students'}</h1>
        <p className="view-subtitle">
          {editingId ? 'Update the fields and save changes.' : 'Create and manage student records.'}
        </p>
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
              <div className="eyebrow">Student Record</div>
              <h2 className="form-card__title">
                {editingId ? 'Update Student' : 'Add New Student'}
              </h2>
            </div>
            <span className={`mode-badge ${editingId ? 'mode-badge--edit' : 'mode-badge--new'}`}>
              {editingId ? 'Editing' : 'New'}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="model-form">
            <div className="form-row">
              <div className="form-field">
                <label className="form-label">First Name <span className="required">*</span></label>
                <input className="form-input" name="fname" placeholder="John"
                  value={form.fname} onChange={handleChange} required />
              </div>
              <div className="form-field">
                <label className="form-label">Last Name <span className="required">*</span></label>
                <input className="form-input" name="lname" placeholder="Doe"
                  value={form.lname} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-row form-row--asymmetric">
              <div className="form-field">
                <label className="form-label">Age <span className="required">*</span></label>
                <input type="number" className="form-input" name="age" min="1" placeholder="20"
                  value={form.age} onChange={handleChange} required />
              </div>
              <div className="form-field">
                <label className="form-label">Level <span className="required">*</span></label>
                <input className="form-input" name="level" placeholder="300L"
                  value={form.level} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-field">
              <label className="form-label">Email <span className="required">*</span></label>
              <input type="email" className="form-input" name="email" placeholder="john@example.com"
                value={form.email} onChange={handleChange} required />
            </div>

            <div className="form-row">
              <div className="form-field">
                <label className="form-label">GPA <span className="required">*</span></label>
                <input type="number" step="0.01" min="0" max="5" className="form-input"
                  name="gpa" placeholder="3.50" value={form.gpa} onChange={handleChange} required />
              </div>
              <div className="form-field">
                <label className="form-label">CGPA <span className="required">*</span></label>
                <input type="number" step="0.01" min="0" max="5" className="form-input"
                  name="cgpa" placeholder="3.40" value={form.cgpa} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn--primary" disabled={loading}>
                {loading ? 'Saving…' : editingId ? 'Save Changes' : 'Add Student'}
              </button>
              <button type="button" className="btn btn--secondary" onClick={reset}>
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* ── Table ── */}
        <div className="table-card">
          <div className="table-card__header">
            <div>
              <div className="eyebrow">Records</div>
              <h2 className="table-card__title">All Students ({students.length})</h2>
            </div>
            <button className="btn btn--ghost" onClick={load} disabled={loading}>Refresh</button>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Level</th>
                  <th>Email</th>
                  <th>Age</th>
                  <th>GPA</th>
                  <th>CGPA</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="table-empty">
                      No students yet — add one using the form.
                    </td>
                  </tr>
                ) : students.map((s) => (
                  <tr key={s.student_id} className="data-table__row">
                    <td>
                      <div className="name-cell">
                        <div className="avatar">{s.fname?.[0]}{s.lname?.[0]}</div>
                        <div>
                          <div className="name-primary">{s.fname} {s.lname}</div>
                          <div className="name-id">{s.student_id}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="level-tag">{s.level}</span></td>
                    <td>{s.email}</td>
                    <td>{s.age}</td>
                    <td><span className="score-badge score-badge--gpa">GPA {s.gpa}</span></td>
                    <td><span className="score-badge score-badge--cgpa">CGPA {s.cgpa}</span></td>
                    <td>
                      <div className="action-btns">
                        <button className="btn btn--edit" onClick={() => handleEdit(s)}>Edit</button>
                        <button className="btn btn--delete" onClick={() => handleDelete(s.student_id)}>Delete</button>
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

export default StudentsView;
