import React, { useState, useEffect } from 'react';
import Layout from '../../components/shared/Layout';
import Modal from '../../components/shared/Modal';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const defaultForm = { name:'',email:'',password:'',qualification:'',department:'',joining_date:'' };

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTeacher, setEditTeacher] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadTeachers(); }, []);

  const loadTeachers = async () => {
    try {
      const res = await adminAPI.getTeachers();
      setTeachers(res.data.data);
    } catch { toast.error('Failed to load teachers'); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setEditTeacher(null); setForm(defaultForm); setShowModal(true); };
  const openEdit = (t) => {
    setEditTeacher(t);
    setForm({ name:t.name, email:t.email, password:'', qualification:t.qualification||'', department:t.department||'', joining_date:t.joining_date?.split('T')[0]||'' });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editTeacher) {
        await adminAPI.updateTeacher(editTeacher.teacher_id, form);
        toast.success('Teacher updated');
      } else {
        await adminAPI.createTeacher(form);
        toast.success('Teacher created');
      }
      setShowModal(false);
      loadTeachers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving teacher');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this teacher?')) return;
    try {
      await adminAPI.deleteTeacher(id);
      toast.success('Teacher deleted');
      loadTeachers();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <Layout title="Teachers" subtitle="Manage faculty members">
      <div className="page-header">
        <div>
          <h2>Teacher Management</h2>
          <p>{teachers.length} teachers registered</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>➕ Add Teacher</button>
      </div>

      <div className="table-container">
        <div className="table-wrapper">
          {loading ? <div className="loading-spinner"><div className="spinner" /></div> : (
            <table>
              <thead>
                <tr><th>Teacher</th><th>Employee ID</th><th>Department</th><th>Qualification</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {teachers.length > 0 ? teachers.map((t, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                        <div style={{ width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#10b981,#0ea5e9)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:14 }}>
                          {t.name?.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight:700,fontSize:13 }}>{t.name}</div>
                          <div style={{ fontSize:11,color:'var(--text-muted)' }}>{t.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span style={{ fontFamily:'monospace',fontSize:12 }}>{t.employee_id}</span></td>
                    <td>{t.department || '—'}</td>
                    <td>{t.qualification || '—'}</td>
                    <td><span className={`badge ${t.is_active ? 'badge-success':'badge-danger'}`}>{t.is_active ? 'Active':'Inactive'}</span></td>
                    <td>
                      <div style={{ display:'flex',gap:6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(t)}>✏️</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(t.teacher_id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                )) : <tr><td colSpan={6}><div className="empty-state"><div className="empty-state-icon">👨‍🏫</div><h3>No teachers yet</h3></div></td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editTeacher ? 'Edit Teacher' : 'Add Teacher'}
        footer={<><button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editTeacher ? 'Update' : 'Create'}</button></>}
      >
        <div className="form-row">
          <div className="form-group"><label className="form-label">Full Name *</label><input className="form-control" value={form.name} onChange={e => setForm({...form,name:e.target.value})} placeholder="Dr. Jane Smith" /></div>
          <div className="form-group"><label className="form-label">Email *</label><input className="form-control" type="email" value={form.email} onChange={e => setForm({...form,email:e.target.value})} /></div>
        </div>
        {!editTeacher && <div className="form-group"><label className="form-label">Password (default: Teacher@123)</label><input className="form-control" type="password" value={form.password} onChange={e => setForm({...form,password:e.target.value})} placeholder="Leave blank for default" /></div>}
        <div className="form-row">
          <div className="form-group"><label className="form-label">Department</label><input className="form-control" value={form.department} onChange={e => setForm({...form,department:e.target.value})} placeholder="Computer Science" /></div>
          <div className="form-group"><label className="form-label">Qualification</label><input className="form-control" value={form.qualification} onChange={e => setForm({...form,qualification:e.target.value})} placeholder="Ph.D, M.Tech..." /></div>
        </div>
        <div className="form-group"><label className="form-label">Joining Date</label><input className="form-control" type="date" value={form.joining_date} onChange={e => setForm({...form,joining_date:e.target.value})} /></div>
      </Modal>
    </Layout>
  );
}
