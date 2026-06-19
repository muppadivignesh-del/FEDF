import React, { useState, useEffect } from 'react';
import Layout from '../../components/shared/Layout';
import { studentAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function StudentMarks() {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => { studentAPI.getMarks().then(r=>setMarks(r.data.data||[])).catch(()=>toast.error('Failed')).finally(()=>setLoading(false)); }, []);

  const pct=(m,t)=>Math.round((m/t)*100);
  const grade=(p)=>p>=90?'A+':p>=80?'A':p>=70?'B':p>=60?'C':p>=50?'D':'F';
  const gradeColor=(p)=>p>=70?'var(--success)':p>=50?'var(--warning)':'var(--danger)';
  const avg = marks.length>0?Math.round(marks.reduce((a,m)=>a+pct(m.marks_obtained,m.total_marks),0)/marks.length):0;

  const filtered = filter ? marks.filter(m=>m.subject===filter) : marks;
  const subjects = [...new Set(marks.map(m=>m.subject))];

  return (
    <Layout title="My Marks" subtitle="Academic performance records">
      <div className="stats-grid" style={{marginBottom:24}}>
        {[
          { icon:'🏆', label:'Overall Average', value:`${avg}%`, color:'var(--primary)', bg:'var(--primary-soft)' },
          { icon:'📊', label:'Total Exams',     value:marks.length, color:'var(--info)', bg:'var(--info-soft)' },
          { icon:'✅', label:'Passed',           value:marks.filter(m=>pct(m.marks_obtained,m.total_marks)>=50).length, color:'var(--success)', bg:'var(--success-soft)' },
          { icon:'🎓', label:'Current Grade',   value:grade(avg), color:'var(--warning)', bg:'var(--warning-soft)' },
        ].map((s,i)=>(
          <div className="stat-card" key={i}>
            <div className="stat-icon" style={{background:s.bg}}><span style={{fontSize:22}}>{s.icon}</span></div>
            <div className="stat-info"><div className="stat-value" style={{color:s.color}}>{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      <div className="table-container">
        <div className="table-header">
          <div style={{fontWeight:700,fontSize:15}}>📋 Exam Results</div>
          <select className="form-control form-select" style={{width:180}} value={filter} onChange={e=>setFilter(e.target.value)}>
            <option value="">All Subjects</option>
            {subjects.map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="table-wrapper">
          {loading ? <div className="loading-spinner"><div className="spinner"/></div> : (
            <table>
              <thead><tr><th>Subject</th><th>Exam Type</th><th>Marks</th><th>Percentage</th><th>Grade</th><th>Date</th></tr></thead>
              <tbody>
                {filtered.map((m,i)=>{const p=pct(m.marks_obtained,m.total_marks);return(
                  <tr key={i}>
                    <td><strong>{m.subject}</strong></td>
                    <td><span className="badge badge-primary" style={{textTransform:'capitalize'}}>{m.exam_type}</span></td>
                    <td><strong>{m.marks_obtained}</strong><span style={{color:'var(--text-muted)',fontSize:12}}>/{m.total_marks}</span></td>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <div className="progress-bar" style={{width:60}}><div className="progress-fill" style={{width:`${p}%`,background:gradeColor(p)}}/></div>
                        <span style={{fontWeight:700,fontSize:13}}>{p}%</span>
                      </div>
                    </td>
                    <td><span style={{fontWeight:800,color:gradeColor(p),fontSize:18}}>{grade(p)}</span></td>
                    <td style={{color:'var(--text-muted)',fontSize:12}}>{new Date(m.exam_date).toLocaleDateString()}</td>
                  </tr>
                );})}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
}
