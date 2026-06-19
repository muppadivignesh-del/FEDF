import React, { useState, useEffect } from 'react';
import Layout from '../../components/shared/Layout';
import Modal from '../../components/shared/Modal';
import { teacherAPI } from '../../services/api';
import toast from 'react-hot-toast';

const SUBJECTS = ['Mathematics','Physics','Chemistry','English','Computer Science','Data Structures'];

export default function TeacherAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title:'', description:'', subject:'Mathematics', due_date:'', total_marks:100 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    teacherAPI.getAssignments().then(r=>{
      const data = r.data.data||[];
      setAssignments(data.length>0?data:[
        { id:1, title:'Binary Trees Assignment', subject:'Data Structures', due_date:'2024-01-25', total_marks:50, submitted:35, total:42, description:'Implement binary search tree operations' },
        { id:2, title:'Sorting Algorithms Lab',  subject:'Computer Science', due_date:'2024-01-20', total_marks:30, submitted:28, total:42, description:'Implement and compare 5 sorting algorithms' },
      ]);
    }).catch(()=>{});
  }, []);

  const handleCreate = async () => {
    if (!form.title || !form.due_date) return toast.error('Title and due date required');
    setSaving(true);
    try {
      await teacherAPI.createAssignment(form);
      setAssignments(p=>[{ ...form, id:Date.now(), submitted:0, total:42 }, ...p]);
      toast.success('Assignment published!'); setShowModal(false);
      setForm({ title:'', description:'', subject:'Mathematics', due_date:'', total_marks:100 });
    } catch { toast.error('Failed to publish'); }
    finally { setSaving(false); }
  };

  const isPast = (d) => new Date(d) < new Date();

  return (
    <Layout title="Assignments" subtitle="Manage and publish class assignments">
      <div className="page-header">
        <div><h2>Assignments</h2><p>{assignments.length} total</p></div>
        <button className="btn btn-primary" onClick={()=>setShowModal(true)}>📝 New Assignment</button>
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:16}}>
        {assignments.map((a,i)=>{
          const subPct = a.total>0?Math.round((a.submitted/a.total)*100):0;
          const past = isPast(a.due_date);
          return (
            <div key={i} className="card">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                <div>
                  <h3 style={{margin:0,marginBottom:4}}>{a.title}</h3>
                  <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                    <span className="badge badge-primary">{a.subject}</span>
                    <span className={`badge ${past?'badge-danger':'badge-success'}`}>{past?'⚠️ Overdue':'🟢 Active'}</span>
                    <span className="badge badge-muted">{a.total_marks} Marks</span>
                  </div>
                </div>
                <div style={{textAlign:'right',flexShrink:0}}>
                  <div style={{fontSize:12,color:'var(--text-muted)'}}>Due: {new Date(a.due_date).toLocaleDateString()}</div>
                </div>
              </div>
              {a.description && <p style={{fontSize:13,color:'var(--text-secondary)',marginBottom:12}}>{a.description}</p>}
              <div>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                  <span style={{fontSize:13,color:'var(--text-muted)'}}>Submissions: <strong>{a.submitted||0}/{a.total||0}</strong></span>
                  <span style={{fontSize:13,fontWeight:700,color:subPct>=80?'var(--success)':subPct>=50?'var(--warning)':'var(--danger)'}}>{subPct}%</span>
                </div>
                <div className="progress-bar" style={{width:'100%',height:8}}>
                  <div className="progress-fill" style={{width:`${subPct}%`,background:subPct>=80?'var(--success)':subPct>=50?'var(--warning)':'var(--danger)'}}/>
                </div>
              </div>
            </div>
          );
        })}
        {assignments.length===0 && (
          <div className="card text-center" style={{padding:'80px 40px'}}>
            <div style={{fontSize:64,marginBottom:16}}>📝</div>
            <h3>No assignments yet</h3>
            <p style={{color:'var(--text-muted)'}}>Create your first assignment</p>
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={()=>setShowModal(false)} title="New Assignment"
        footer={<><button className="btn btn-ghost" onClick={()=>setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleCreate} disabled={saving}>{saving?'Publishing...':'📤 Publish'}</button></>}>
        <div className="form-group"><label className="form-label">Title *</label><input className="form-control" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Assignment title..."/></div>
        <div className="form-group"><label className="form-label">Description</label><textarea className="form-control" rows={3} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Assignment details..."/></div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Subject</label>
            <select className="form-control form-select" value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})}>
              {SUBJECTS.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Total Marks</label><input className="form-control" type="number" value={form.total_marks} onChange={e=>setForm({...form,total_marks:Number(e.target.value)})}/></div>
        </div>
        <div className="form-group"><label className="form-label">Due Date *</label><input className="form-control" type="datetime-local" value={form.due_date} onChange={e=>setForm({...form,due_date:e.target.value})}/></div>
      </Modal>
    </Layout>
  );
}
