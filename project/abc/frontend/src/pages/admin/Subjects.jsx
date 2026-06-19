import React, { useState, useEffect } from 'react';
import Layout from '../../components/shared/Layout';
import Modal from '../../components/shared/Modal';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const defaultForm = { name:'', code:'', description:'', credits:3 };

export default function AdminSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { const r = await adminAPI.getSubjects(); setSubjects(r.data.data); }
    catch { toast.error('Failed to load subjects'); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setEditId(null); setForm(defaultForm); setShowModal(true); };
  const openEdit = (s) => { setEditId(s.id); setForm({ name:s.name, code:s.code, description:s.description||'', credits:s.credits }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name || !form.code) return toast.error('Name and Code are required');
    setSaving(true);
    try {
      if (editId) { await adminAPI.updateSubject(editId, form); toast.success('Subject updated'); }
      else { await adminAPI.createSubject(form); toast.success('Subject created'); }
      setShowModal(false); load();
    } catch (e) { toast.error(e.response?.data?.message || 'Error saving'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this subject?')) return;
    try { await adminAPI.deleteSubject(id); toast.success('Subject deleted'); load(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <Layout title="Subjects" subtitle="Manage academic subjects">
      <div className="page-header">
        <div><h2>Subject Management</h2><p>{subjects.length} subjects active</p></div>
        <button className="btn btn-primary" onClick={openAdd}>➕ Add Subject</button>
      </div>

      <div className="table-container">
        <div className="table-wrapper">
          {loading ? <div className="loading-spinner"><div className="spinner"/></div> : (
            <table>
              <thead><tr><th>Subject Name</th><th>Code</th><th>Description</th><th>Credits</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {subjects.length > 0 ? subjects.map((s,i) => (
                  <tr key={i}>
                    <td><strong>{s.name}</strong></td>
                    <td><span style={{fontFamily:'monospace',background:'var(--bg-secondary)',padding:'2px 8px',borderRadius:4,fontSize:12}}>{s.code}</span></td>
                    <td style={{color:'var(--text-muted)',fontSize:13}}>{s.description || '—'}</td>
                    <td><span className="badge badge-primary">{s.credits} Credits</span></td>
                    <td><span className={`badge ${s.is_active ? 'badge-success' : 'badge-danger'}`}>{s.is_active ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <div style={{display:'flex',gap:6}}>
                        <button className="btn btn-ghost btn-sm" onClick={()=>openEdit(s)}>✏️</button>
                        <button className="btn btn-ghost btn-sm" onClick={()=>handleDelete(s.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                )) : <tr><td colSpan={6}><div className="empty-state"><div className="empty-state-icon">📚</div><h3>No subjects yet</h3><p>Add your first subject</p></div></td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={()=>setShowModal(false)} title={editId ? 'Edit Subject' : 'Add Subject'}
        footer={<><button className="btn btn-ghost" onClick={()=>setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving?'Saving...':editId?'Save':'Create'}</button></>}>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Subject Name *</label><input className="form-control" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Mathematics"/></div>
          <div className="form-group"><label className="form-label">Subject Code *</label><input className="form-control" value={form.code} onChange={e=>setForm({...form,code:e.target.value})} placeholder="MATH101"/></div>
        </div>
        <div className="form-group"><label className="form-label">Description</label><textarea className="form-control" rows={3} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Brief description..."/></div>
        <div className="form-group"><label className="form-label">Credits</label>
          <select className="form-control form-select" value={form.credits} onChange={e=>setForm({...form,credits:Number(e.target.value)})}>
            {[1,2,3,4,5].map(c=><option key={c} value={c}>{c} Credits</option>)}
          </select>
        </div>
      </Modal>
    </Layout>
  );
}
