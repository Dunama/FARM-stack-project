import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

const API_ENDPOINTS = [
  {
    method: 'GET',
    path: '/students/get',
    description: 'Retrieve all student records from the database.',
    action: 'view-all',
  },
  {
    method: 'POST',
    path: '/students/create',
    description: 'Create and save a new student record.',
    action: 'create',
  },
  {
    method: 'GET',
    path: '/students/get/{id}',
    description: 'Retrieve a single student record by their MongoDB ObjectId.',
    action: 'view-one',
  },
  {
    method: 'PUT',
    path: '/students/update/{id}',
    description: 'Update all fields on an existing student record by ID.',
    action: 'update',
  },
  {
    method: 'DELETE',
    path: '/students/delete/{id}',
    description: 'Permanently delete a student record by ID.',
    action: 'delete',
  },
];

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
  { id: 'students',  label: 'Students',  icon: '⊙' },
  { id: 'endpoints', label: 'API Endpoints', icon: '⬡' },
];

const EMPTY_STUDENT = {
  fname: '', lname: '', age: '', level: '', email: '', gpa: '', cgpa: '',
};

function App() {
  const [students, setStudents]     = useState([]);
  const [formData, setFormData]     = useState(EMPTY_STUDENT);
  const [editingId, setEditingId]   = useState(null);
  const [loading, setLoading]       = useState(false);
  const [feedback, setFeedback]     = useState({ type: '', message: '' });
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/students/get');
      setStudents(res.data.students || []);
    } catch (err) {
      setFeedback({
        type: 'danger',
        message: err?.response?.data?.error || 'Failed to load students.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStudents(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((cur) => ({ ...cur, [name]: value }));
  };

  const resetForm = () => {
    setFormData(EMPTY_STUDENT);
    setEditingId(null);
    setFeedback({ type: '', message: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        ...formData,
        age:  Number(formData.age),
        gpa:  Number(formData.gpa),
        cgpa: Number(formData.cgpa),
      };
      if (editingId) {
        await api.put(`/students/update/${editingId}`, payload);
        setFeedback({ type: 'success', message: 'Student updated successfully.' });
      } else {
        await api.post('/students/create', payload);
        setFeedback({ type: 'success', message: 'Student added successfully.' });
      }
      resetForm();
      await loadStudents();
    } catch (err) {
      setFeedback({
        type: 'danger',
        message: err?.response?.data?.error || 'Unable to save student.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (student) => {
    setEditingId(student.student_id);
    setFormData({
      fname: student.fname  || '',
      lname: student.lname  || '',
      age:   student.age    ?? '',
      level: student.level  || '',
      email: student.email  || '',
      gpa:   student.gpa    ?? '',
      cgpa:  student.cgpa   ?? '',
    });
    setFeedback({ type: 'info', message: 'Editing student — update the form and save.' });
    setActiveView('students');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (studentId) => {
    if (!window.confirm('Delete this student record permanently?')) return;
    try {
      setLoading(true);
      await api.delete(`/students/delete/${studentId}`);
      setFeedback({ type: 'success', message: 'Student deleted successfully.' });
      await loadStudents();
    } catch (err) {
      setFeedback({
        type: 'danger',
        message: err?.response?.data?.error || 'Unable to delete student.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEndpointAction = (action) => {
    if (action === 'create') {
      resetForm();
      setActiveView('students');
    } else {
      setActiveView('students');
    }
    setSidebarOpen(false);
  };

  const navigateTo = (view) => {
    setActiveView(view);
    setSidebarOpen(false);
  };

  // Computed stats
  const totalStudents = students.length;
  const avgGpa  = totalStudents
    ? (students.reduce((s, x) => s + (x.gpa  || 0), 0) / totalStudents).toFixed(2)
    : '—';
  const avgCgpa = totalStudents
    ? (students.reduce((s, x) => s + (x.cgpa || 0), 0) / totalStudents).toFixed(2)
    : '—';
  const uniqueLevels = [...new Set(students.map((s) => s.level).filter(Boolean))];

  const currentPageLabel = NAV_ITEMS.find((n) => n.id === activeView)?.label ?? '';

  return (
    <div className="app-layout">

      {/* ── Sidebar ── */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__brand">
          <div className="sidebar__logo">S</div>
          <span className="sidebar__title">StudentDB</span>
        </div>

        <nav className="sidebar__nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`sidebar__nav-item ${activeView === item.id ? 'sidebar__nav-item--active' : ''}`}
              onClick={() => navigateTo(item.id)}
            >
              <span className="sidebar__nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar__footer">
          <span className="api-status-dot" />
          <span>API Connected</span>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="main-area">

        {/* Top bar */}
        <header className="topbar">
          <button className="topbar__menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
          <div className="topbar__breadcrumb">
            <span className="topbar__app-name">FARM Stack</span>
            <span className="topbar__sep">/</span>
            <span className="topbar__page">{currentPageLabel}</span>
          </div>
          <span className="topbar__badge">{totalStudents} student{totalStudents !== 1 ? 's' : ''}</span>
        </header>

        {/* Page content */}
        <div className="content-wrapper">

          {/* ── DASHBOARD VIEW ── */}
          {activeView === 'dashboard' && (
            <div>
              <div className="view-header">
                <h1 className="view-title">Dashboard</h1>
                <p className="view-subtitle">Overview of your student management system</p>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-card__icon stat-card__icon--primary">⊞</div>
                  <div className="stat-card__value">{totalStudents}</div>
                  <div className="stat-card__label">Total Students</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card__icon stat-card__icon--success">★</div>
                  <div className="stat-card__value">{avgGpa}</div>
                  <div className="stat-card__label">Average GPA</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card__icon stat-card__icon--info">◈</div>
                  <div className="stat-card__value">{avgCgpa}</div>
                  <div className="stat-card__label">Average CGPA</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card__icon stat-card__icon--warning">◉</div>
                  <div className="stat-card__value">{uniqueLevels.length || '—'}</div>
                  <div className="stat-card__label">Active Levels</div>
                </div>
              </div>

              <div className="section-header">
                <h2 className="section-title">Quick Actions</h2>
              </div>
              <div className="quick-actions">
                <button className="quick-action-btn" onClick={() => { resetForm(); navigateTo('students'); }}>
                  <span className="quick-action-btn__icon">+</span> Add Student
                </button>
                <button className="quick-action-btn" onClick={() => navigateTo('students')}>
                  <span className="quick-action-btn__icon">⊞</span> View All Students
                </button>
                <button className="quick-action-btn" onClick={() => navigateTo('endpoints')}>
                  <span className="quick-action-btn__icon">⬡</span> API Endpoints
                </button>
              </div>

              {students.length > 0 && (
                <>
                  <div className="section-header">
                    <h2 className="section-title">Recent Records</h2>
                    <button className="link-btn" onClick={() => navigateTo('students')}>
                      View all →
                    </button>
                  </div>
                  <div className="recent-list">
                    {students.slice(0, 5).map((student) => (
                      <div key={student.student_id} className="recent-item">
                        <div className="recent-item__avatar">
                          {student.fname?.[0]}{student.lname?.[0]}
                        </div>
                        <div className="recent-item__info">
                          <div className="recent-item__name">
                            {student.fname} {student.lname}
                          </div>
                          <div className="recent-item__meta">
                            {student.level} · {student.email}
                          </div>
                        </div>
                        <div className="recent-item__scores">
                          <span className="score-badge score-badge--gpa">GPA {student.gpa}</span>
                          <span className="score-badge score-badge--cgpa">CGPA {student.cgpa}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── STUDENTS VIEW ── */}
          {activeView === 'students' && (
            <div>
              <div className="view-header">
                <h1 className="view-title">
                  {editingId ? 'Edit Student' : 'Students'}
                </h1>
                <p className="view-subtitle">
                  {editingId
                    ? 'Update the form fields and click Save to apply changes.'
                    : 'Add new students and manage existing records.'}
                </p>
              </div>

              {feedback.message && (
                <div className={`feedback-alert feedback-alert--${feedback.type}`} role="alert">
                  <span>{feedback.message}</span>
                  <button
                    className="feedback-alert__close"
                    onClick={() => setFeedback({ type: '', message: '' })}
                  >
                    ×
                  </button>
                </div>
              )}

              <div className="students-layout">
                {/* Form */}
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

                  <form onSubmit={handleSubmit} className="student-form">
                    <div className="form-row">
                      <div className="form-field">
                        <label className="form-label">First Name</label>
                        <input
                          className="form-input"
                          name="fname"
                          placeholder="John"
                          value={formData.fname}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="form-field">
                        <label className="form-label">Last Name</label>
                        <input
                          className="form-input"
                          name="lname"
                          placeholder="Doe"
                          value={formData.lname}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row form-row--age-level">
                      <div className="form-field">
                        <label className="form-label">Age</label>
                        <input
                          type="number"
                          className="form-input"
                          name="age"
                          min="1"
                          placeholder="20"
                          value={formData.age}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="form-field">
                        <label className="form-label">Level</label>
                        <input
                          className="form-input"
                          name="level"
                          placeholder="e.g. 300L"
                          value={formData.level}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-field">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-input"
                        name="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-field">
                        <label className="form-label">GPA</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="5"
                          className="form-input"
                          name="gpa"
                          placeholder="3.50"
                          value={formData.gpa}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="form-field">
                        <label className="form-label">CGPA</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="5"
                          className="form-input"
                          name="cgpa"
                          placeholder="3.40"
                          value={formData.cgpa}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="btn btn--primary" disabled={loading}>
                        {loading ? 'Saving…' : editingId ? 'Save Changes' : 'Add Student'}
                      </button>
                      <button type="button" className="btn btn--secondary" onClick={resetForm}>
                        Clear
                      </button>
                    </div>
                  </form>
                </div>

                {/* Table */}
                <div className="table-card">
                  <div className="table-card__header">
                    <div>
                      <div className="eyebrow">Records</div>
                      <h2 className="table-card__title">
                        All Students ({totalStudents})
                      </h2>
                    </div>
                    <button className="btn btn--ghost" onClick={loadStudents} disabled={loading}>
                      ↻ Refresh
                    </button>
                  </div>

                  <div className="table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Level</th>
                          <th>Contact</th>
                          <th>Scores</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.length === 0 && !loading ? (
                          <tr>
                            <td colSpan="5" className="table-empty">
                              No students yet — add one using the form.
                            </td>
                          </tr>
                        ) : (
                          students.map((student) => (
                            <tr key={student.student_id} className="data-table__row">
                              <td>
                                <div className="student-name-cell">
                                  <div className="student-avatar">
                                    {student.fname?.[0]}{student.lname?.[0]}
                                  </div>
                                  <div>
                                    <div className="student-fullname">
                                      {student.fname} {student.lname}
                                    </div>
                                    <div className="student-id">{student.student_id}</div>
                                  </div>
                                </div>
                              </td>
                              <td><span className="level-tag">{student.level}</span></td>
                              <td>
                                <div className="contact-cell">
                                  <div>{student.email}</div>
                                  <div className="contact-age">Age {student.age}</div>
                                </div>
                              </td>
                              <td>
                                <span className="score-badge score-badge--gpa">GPA {student.gpa}</span>{' '}
                                <span className="score-badge score-badge--cgpa">CGPA {student.cgpa}</span>
                              </td>
                              <td>
                                <div className="action-btns">
                                  <button
                                    className="btn btn--edit"
                                    onClick={() => handleEdit(student)}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    className="btn btn--delete"
                                    onClick={() => handleDelete(student.student_id)}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── API ENDPOINTS VIEW ── */}
          {activeView === 'endpoints' && (
            <div>
              <div className="view-header">
                <h1 className="view-title">API Endpoints</h1>
                <p className="view-subtitle">
                  All available REST API routes — click "Try it" to jump to the relevant UI.
                </p>
              </div>

              <div className="endpoints-grid">
                {API_ENDPOINTS.map((ep, idx) => (
                  <div key={idx} className="endpoint-card">
                    <div className="endpoint-card__top">
                      <span className={`method-badge method-badge--${ep.method.toLowerCase()}`}>
                        {ep.method}
                      </span>
                      <code className="endpoint-path">{ep.path}</code>
                    </div>
                    <p className="endpoint-description">{ep.description}</p>
                    <button
                      className="btn btn--ghost endpoint-card__action"
                      onClick={() => handleEndpointAction(ep.action)}
                    >
                      Try it →
                    </button>
                  </div>
                ))}
              </div>

              <div className="base-url-card">
                <div className="base-url-label">Base URL</div>
                <code className="base-url-text">
                  {process.env.REACT_APP_API_URL || 'http://localhost:8000'}
                </code>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}

export default App;
