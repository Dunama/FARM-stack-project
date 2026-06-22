import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL 
});

function App() {
  const emptyStudent = {
    fname: '',
    lname: '',
    age: '',
    level: '',
    email: '',
    gpa: '',
    cgpa: '',
  };

  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState(emptyStudent);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/students/get');
      setStudents(response.data.students || []);
    } catch (error) {
      setFeedback({
        type: 'danger',
        message: error?.response?.data?.error || 'Failed to load students.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData(emptyStudent);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      const payload = {
        ...formData,
        age: Number(formData.age),
        gpa: Number(formData.gpa),
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
    } catch (error) {
      setFeedback({
        type: 'danger',
        message: error?.response?.data?.error || 'Unable to save student.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (student) => {
    setEditingId(student.student_id);
    setFormData({
      fname: student.fname || '',
      lname: student.lname || '',
      age: student.age ?? '',
      level: student.level || '',
      email: student.email || '',
      gpa: student.gpa ?? '',
      cgpa: student.cgpa ?? '',
    });
    setFeedback({ type: 'info', message: 'Editing student. Update the form and save.' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (studentId) => {
    const confirmDelete = window.confirm('Delete this student record?');
    if (!confirmDelete) {
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/students/delete/${studentId}`);
      setFeedback({ type: 'success', message: 'Student deleted successfully.' });
      await loadStudents();
    } catch (error) {
      setFeedback({
        type: 'danger',
        message: error?.response?.data?.error || 'Unable to delete student.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <div className="hero-band" />
      <main className="container py-5">
        <div className="row align-items-start g-4">
          <div className="col-12 col-lg-5">
            <div className="card glass-card shadow-lg border-0">
              <div className="card-body p-4 p-md-5">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div>
                    <p className="eyebrow mb-1">FARM Stack Project</p>
                    <h1 className="display-6 mb-0">{editingId ? 'Update Student' : 'Add Student'}</h1>
                  </div>
                  <span className={`status-pill ${editingId ? 'status-edit' : 'status-new'}`}>
                    {editingId ? 'Editing' : 'New'}
                  </span>
                </div>

                {feedback.message && (
                  <div className={`alert alert-${feedback.type} rounded-4`} role="alert">
                    {feedback.message}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="student-form">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">First name</label>
                      <input
                        className="form-control"
                        name="fname"
                        placeholder='John'
                        value={formData.fname}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Last name</label>
                      <input
                        className="form-control"
                        name="lname"
                        placeholder='Doe'
                        value={formData.lname}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Age</label>
                      <input
                        type="number"
                        className="form-control"
                        name="age"
                        min="1"
                        value={formData.age}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-8">
                      <label className="form-label">Level</label>
                      <input
                        className="form-control"
                        name="level"
                        value={formData.level}
                        onChange={handleChange}
                        placeholder="e.g. 100L"
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        placeholder='johndoe@gmail.com'
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">GPA</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        name="gpa"
                        value={formData.gpa}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">CGPA</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        name="cgpa"
                        value={formData.cgpa}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="d-flex gap-2 mt-4">
                    <button type="submit" className="btn btn-primary px-4" disabled={loading}>
                      {loading ? 'Saving...' : editingId ? 'Update Student' : 'Add Student'}
                    </button>
                    <button type="button" className="btn btn-outline-secondary px-4" onClick={resetForm}>
                      Clear
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-7">
            <div className="d-flex align-items-end justify-content-between mb-3">
              <div>
                <p className="eyebrow mb-1">Student Records</p>
                <h2 className="h3 mb-0">Manage your class list</h2>
              </div>
              <button className="btn btn-light" onClick={loadStudents} disabled={loading}>
                Refresh
              </button>
            </div>

            <div className="table-responsive card border-0 shadow-lg">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-dark">
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
                      <td colSpan="5" className="text-center py-5 text-muted">
                        No students found yet. Add the first record on the left.
                      </td>
                    </tr>
                  ) : (
                    students.map((student) => (
                      <tr key={student.student_id}>
                        <td>
                          <div className="fw-semibold">
                            {student.fname} {student.lname}
                          </div>
                          <small className="text-muted">{student.student_id}</small>
                        </td>
                        <td>{student.level}</td>
                        <td>
                          <div>{student.email}</div>
                          <small className="text-muted">Age: {student.age}</small>
                        </td>
                        <td>
                          <span className="badge text-bg-success me-2">GPA {student.gpa}</span>
                          <span className="badge text-bg-info">CGPA {student.cgpa}</span>
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button
                              type="button"
                              className="btn btn-outline-primary"
                              onClick={() => handleEdit(student)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-danger"
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
      </main>
    </div>
  );
}

export default App;
