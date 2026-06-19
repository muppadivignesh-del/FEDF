import React, { useState, useEffect } from 'react';
import Layout from '../../components/shared/Layout';
import Modal from '../../components/shared/Modal';
import { teacherAPI } from '../../services/api';
import toast from 'react-hot-toast';

const SUBJECTS = ['Mathematics','Physics','Chemistry','English','Computer Science','Data Structures'];
const EXAM_TYPES = ['quiz','midterm','final','assignment','project'];

export default function TeacherMarks() {
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ student_id:'', subject:'Mathematics', exam_type:'quiz', marks_obtained:'', total_marks:100, exam_date:new Date().toISOString().split('T')[0], remarks:'' });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    teacherAPI.getStudents().then(r=>{
      setStudents(r.data.data||[]);
      // generate sample marks
      const sample = [];
      (r.data.data||[]).slice(0,3).forEach(s=>{
        SUBJECTS.slice(0,3).forEach((sub,i)=>{
          sample.push({ id:Date.now()+i, student_name:s.name, student_id:s.id, subject:sub, exam_type:EXAM_TYPES[i%EXAM_TYPES.length], marks_obtained:Math.floor(Math.random()*40)+55, total_marks:100, exam_date:'2024-01-10' });
        });
      });
      setMarks(sample);
    }).catch(()=>toast.error('Failed to load students')).finally(()=>setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!form.student_id || !form.marks_obtained) return toast.error('Student and marks required');
    if (Number(form.marks_obtained) > Number(form.total_marks)) return toast.error('Marks cannot exceed total');
    setSaving(true);
    try {
      await teacherAPI.addMarks(form);
      const student = students.find(s=>s.id===Number(form.student_id));
      setMarks(p=>[{ ...form, id:Date.now(), student_name:student?.name||'Unknown', marks_obtained:Number(form.marks_obtained), total_marks:Number(form.total_marks) }, ...p]);
      toast.success('Marks recorded!');
      setShowModal(false);
      setForm({ student_id:'', subject:'Mathematics', exam_type:'quiz', marks_obtained:'', total_marks:100, exam_date:new Date().toISOString().split('T')[0], remarks:'' });
    } catch { toast.error('Failed to save marks'); }
    finally { setSaving(false); }
  };

  const pct = (m,t) => Math.round((m/t)*100);
  const grade = (p) => p>=90?'A+':p>=80?'A':p>=70?'B':p>=60?'C':p>=50?'D':'F';
  const gradeColor = (p) => p>=70?'var(--success)':p>=50?'var(--warning)':'var(--danger)';

  return (
    <Layout title="Marks & Grades" subtitle="Record and view student marks">
      <div className="page-header">
        <div><h2>Marks Entry</h2><p>{marks.length} records</p></div>
        <button className="btn btn-primary" onClick={()=>setShowModal(true)}>➕ Add Marks</button>
      </div>

      <div className="table-container">
        <div className="table-wrapper">
          {loading ? <div className="loading-spinner"><div className="spinner"/></div> : (
            <table>
              <thead><tr><th>Student</th><th>Subject</th><th>Exam Type</th><th>Marks</th><th>Percentage</th><th>Grade</th><th>Date</th></tr></thead>
              <tbody>
                {marks.length>0 ? marks.map((m,i)=>{
                  const p = pct(m.marks_obtained,m.total_marks);
                  return (
                    <tr key={i}>
                      <td><strong>{m.student_name}</strong></td>
                      <td>{m.subject}</td>
                      <td><span className="badge badge-primary" style={{textTransform:'capitalize'}}>{m.exam_type}</span></td>
                      <td><strong>{m.marks_obtained}</strong><span style={{color:'var(--text-muted)',fontSize:12}}>/{m.total_marks}</span></td>
                      <td>
                        <div style={{display:'flex',alignItems:'center',gap:8}}>
                          <div className="progress-bar" style={{width:60}}><div className="progress-fill" style={{width:`${p}%`,background:gradeColor(p)}}/></div>
                          <span style={{fontWeight:700,fontSize:13}}>{p}%</span>
                        </div>
                      </td>
                      <td><span style={{fontWeight:800,color:gradeColor(p),fontSize:16}}>{grade(p)}</span></td>
                      <td style={{color:'var(--text-muted)',fontSize:12}}>{m.exam_date}</td>
                    </tr>
                  );
                }) : <tr><td colSpan={7}><div className="empty-state"><div className="empty-state-icon">🏆</div><h3>No marks recorded</h3><p>Add marks for students</p></div></td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={()=>setShowModal(false)} title="Record Marks"
        footer={<><button className="btn btn-ghost" onClick={()=>setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving?'Saving...':'💾 Save'}</button></>}>
        <div className="form-group"><label className="form-label">Student *</label>
          <select className="form-control form-select" value={form.student_id} onChange={e=>setForm({...form,student_id:e.target.value})}>
            <option value="">Select student...</option>
            {students.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Subject</label>
            <select className="form-control form-select" value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})}>
              {SUBJECTS.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Exam Type</label>
            <select className="form-control form-select" value={form.exam_type} onChange={e=>setForm({...form,exam_type:e.target.value})}>
              {EXAM_TYPES.map(t=><option key={t} value={t} style={{textTransform:'capitalize'}}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Marks Obtained *</label><input className="form-control" type="number" value={form.marks_obtained} onChange={e=>setForm({...form,marks_obtained:e.target.value})} placeholder="e.g. 78"/></div>
          <div className="form-group"><label className="form-label">Total Marks</label><input className="form-control" type="number" value={form.total_marks} onChange={e=>setForm({...form,total_marks:e.target.value})}/></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Exam Date</label><input className="form-control" type="date" value={form.exam_date} onChange={e=>setForm({...form,exam_date:e.target.value})}/></div>
          <div className="form-group"><label className="form-label">Remarks</label><input className="form-control" value={form.remarks} onChange={e=>setForm({...form,remarks:e.target.value})} placeholder="Optional..."/></div>
        </div>
      </Modal>
    </Layout>
  );
}
