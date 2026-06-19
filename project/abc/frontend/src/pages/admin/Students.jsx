import React, { useState, useEffect } from 'react';
import Layout from '../../components/shared/Layout';
import Modal from '../../components/shared/Modal';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const RISK_BADGE = { low: 'badge-success', medium: 'badge-warning', high: 'badge-danger' };

const defaultForm = { name:'',email:'',password:'',class:'',section:'',semester:1,roll_number:'',parent_name:'',parent_phone:'',date_of_birth:'' };

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => { loadStudents(); }, [search, riskFilter]);

  const loadStudents = async () => {
    try {
      const res = await adminAPI.getStudents({ search, risk: riskFilter });
      setStudents(res.data.data);
    } catch { toast.error('Failed to load students'); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setEditStudent(null); setForm(defaultForm); setShowModal(true); };
  const openEdit = (s) => {
    setEditStudent(s);
    setForm({ name:s.name, email:s.email, password:'', class:s.class, section:s.section, semester:s.semester, roll_number:s.roll_number, parent_name:'', parent_phone:'', date_of_birth:'' });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editStudent) {
        await adminAPI.updateStudent(editStudent.student_id, form);
        toast.success('Student updated');
      } else {
        await adminAPI.createStudent(form);
        toast.success('Student created');
      }
      setShowModal(false);
      loadStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving student');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await adminAPI.deleteStudent(id);
      toast.success('Student deleted');
      loadStudents();
    } catch { toast.error('Delete failed'); }
    finally { setDeleting(null); }
  };

  return (
    <Layout title="Students" subtitle="Manage all students">
      <div className="page-header">
        <div>
          <h2>Student Management</h2>
          <p>{students.length} students registered</p>
        </div>
        <div className="page-actions">
          <div className="search-bar">
            <span>🔍</span>
            <input placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-control form-select" style={{width:160}} value={riskFilter} onChange={e => setRiskFilter(e.target.value)}>
            <option value="">All Risk Levels</option>
            <option value="low">Low Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="high">High Risk</option>
          </select>
          <button className="btn btn-primary" onClick={openAdd}>➕ Add Student</button>
        </div>
      </div>

      <div className="table-container">
        <div className="table-wrapper">
          {loading ? (
            <div className="loading-spinner"><div className="spinner" /></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>ID</th>
                  <th>Class</th>
                  <th>Roll No.</th>
                  <th>AI Risk</th>
                  <th>Risk Score</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.length > 0 ? students.map((s, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#6366f1,#0ea5e9)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:13 }}>
                          {s.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{s.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span style={{ fontFamily:'monospace',fontSize:12 }}>{s.sid}</span></td>
                    <td><span className="badge badge-primary">{s.class || '—'} {s.section}</span></td>
                    <td>{s.roll_number || '—'}</td>
                    <td>
                      {s.risk_level ? (
                        <span className={`badge ${RISK_BADGE[s.risk_level]}`}>
                          {s.risk_level === 'high' ? '🔴' : s.risk_level === 'medium' ? '🟡' : '🟢'} {s.risk_level?.charAt(0).toUpperCase() + s.risk_level?.slice(1)}
                        </span>
                      ) : <span className="badge badge-muted">Not analyzed</span>}
                    </td>
                    <td>
                      {s.risk_score != null ? (
                        <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                          <div className="progress-bar" style={{ width: 60 }}>
                            <div className="progress-fill" style={{ width:`${s.risk_score}%`, background: s.risk_score >= 75 ? 'var(--success)' : s.risk_score >= 55 ? 'var(--warning)' : 'var(--danger)' }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700 }}>{s.risk_score}%</span>
                        </div>
                      ) : '—'}
                    </td>
                    <td>
                      <span className={`badge ${s.is_active ? 'badge-success' : 'badge-danger'}`}>
                        {s.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display:'flex',gap:6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(s)}>✏️</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(s.student_id)} disabled={deleting === s.student_id}>
                          {deleting === s.student_id ? '...' : '🗑️'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={8}>
                    <div className="empty-state">
                      <div className="empty-state-icon">🎓</div>
                      <h3>No students found</h3>
                      <p>Add students or adjust your search filters</p>
                    </div>
                  </td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editStudent ? 'Edit Student' : 'Add New Student'}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editStudent ? 'Save Changes' : 'Create Student'}
            </button>
          </>
        }
      >
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input className="form-control" value={form.name} onChange={e => setForm({...form,name:e.target.value})} placeholder="John Doe" />
          </div>
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input className="form-control" type="email" value={form.email} onChange={e => setForm({...form,email:e.target.value})} placeholder="student@school.com" />
          </div>
        </div>
        {!editStudent && (
          <div className="form-group">
            <label className="form-label">Password (default: Student@123)</label>
            <input className="form-control" type="password" value={form.password} onChange={e => setForm({...form,password:e.target.value})} placeholder="Leave blank for default" />
          </div>
        )}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Class</label>
            <input className="form-control" value={form.class} onChange={e => setForm({...form,class:e.target.value})} placeholder="B.Tech CSE" />
          </div>
          <div className="form-group">
            <label className="form-label">Section</label>
            <input className="form-control" value={form.section} onChange={e => setForm({...form,section:e.target.value})} placeholder="A" />
          </div>
          <div className="form-group">
            <label className="form-label">Semester</label>
            <select className="form-control form-select" value={form.semester} onChange={e => setForm({...form,semester:e.target.value})}>
              {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Roll Number</label>
            <input className="form-control" value={form.roll_number} onChange={e => setForm({...form,roll_number:e.target.value})} placeholder="R001" />
          </div>
          <div className="form-group">
            <label className="form-label">Date of Birth</label>
            <input className="form-control" type="date" value={form.date_of_birth} onChange={e => setForm({...form,date_of_birth:e.target.value})} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Parent Name</label>
            <input className="form-control" value={form.parent_name} onChange={e => setForm({...form,parent_name:e.target.value})} placeholder="Parent/Guardian name" />
          </div>
          <div className="form-group">
            <label className="form-label">Parent Phone</label>
            <input className="form-control" value={form.parent_phone} onChange={e => setForm({...form,parent_phone:e.target.value})} placeholder="+1 234 567 8900" />
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
