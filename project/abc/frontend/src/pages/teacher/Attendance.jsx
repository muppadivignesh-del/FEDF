import React, { useState, useEffect } from 'react';
import Layout from '../../components/shared/Layout';
import { teacherAPI } from '../../services/api';
import toast from 'react-hot-toast';

const SUBJECTS = ['Mathematics','Physics','Chemistry','English','Computer Science','Data Structures'];

export default function TeacherAttendance() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    teacherAPI.getStudents().then(r => {
      const list = r.data.data || [];
      setStudents(list);
      const init = {};
      list.forEach(s => { init[s.id] = 'present'; });
      setAttendance(init);
    }).catch(()=>toast.error('Failed to load students')).finally(()=>setLoading(false));
    teacherAPI.getAttendance().then(r => setHistory(r.data.data||[])).catch(()=>{});
  }, []);

  const toggle = (id, status) => setAttendance(p=>({...p,[id]:status}));

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const records = students.map(s=>({ student_id:s.id, status:attendance[s.id]||'present', date, subject }));
      await teacherAPI.markAttendance({ date, subject, records });
      toast.success(`Attendance saved for ${subject} on ${date}!`);
      setHistory(p=>[{ date, subject, present:Object.values(attendance).filter(v=>v==='present').length, absent:Object.values(attendance).filter(v=>v==='absent').length, total:students.length }, ...p.slice(0,4)]);
    } catch { toast.error('Failed to save attendance'); }
    finally { setSaving(false); }
  };

  const statusColor = { present:'var(--success)', absent:'var(--danger)', late:'var(--warning)', excused:'var(--info)' };

  return (
    <Layout title="Attendance" subtitle="Mark and view class attendance">
      <div className="dashboard-grid">
        <div className="col-8">
          <div className="card">
            <div className="card-header">
              <div className="card-title">✅ Mark Attendance</div>
            </div>
            <div className="form-row" style={{marginBottom:20}}>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input type="date" className="form-control" value={date} onChange={e=>setDate(e.target.value)}/>
              </div>
              <div className="form-group">
                <label className="form-label">Subject</label>
                <select className="form-control form-select" value={subject} onChange={e=>setSubject(e.target.value)}>
                  {SUBJECTS.map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {loading ? <div className="loading-spinner"><div className="spinner"/></div> : (
              <>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                  <span style={{fontSize:13,color:'var(--text-muted)'}}>
                    Present: <strong style={{color:'var(--success)'}}>{Object.values(attendance).filter(v=>v==='present').length}</strong> |
                    Absent: <strong style={{color:'var(--danger)'}}>{Object.values(attendance).filter(v=>v==='absent').length}</strong> of {students.length}
                  </span>
                  <div style={{display:'flex',gap:8}}>
                    <button className="btn btn-ghost btn-sm" onClick={()=>{ const a={}; students.forEach(s=>a[s.id]='present'); setAttendance(a); }}>✅ All Present</button>
                    <button className="btn btn-ghost btn-sm" onClick={()=>{ const a={}; students.forEach(s=>a[s.id]='absent'); setAttendance(a); }}>❌ All Absent</button>
                  </div>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:8,maxHeight:400,overflowY:'auto'}}>
                  {students.map(s=>(
                    <div key={s.id} style={{display:'flex',alignItems:'center',gap:16,padding:'10px 14px',background:'var(--bg-secondary)',borderRadius:'var(--radius-sm)',border:`2px solid ${statusColor[attendance[s.id]]||'var(--border)'}`}}>
                      <div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#6366f1,#0ea5e9)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:13,flexShrink:0}}>
                        {s.name?.charAt(0)}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:600,fontSize:13}}>{s.name}</div>
                        <div style={{fontSize:11,color:'var(--text-muted)'}}>{s.roll_number} — {s.class} {s.section}</div>
                      </div>
                      <div style={{display:'flex',gap:6}}>
                        {['present','absent','late','excused'].map(st=>(
                          <button key={st} onClick={()=>toggle(s.id,st)}
                            style={{padding:'4px 10px',borderRadius:20,fontSize:11,fontWeight:600,border:`2px solid ${attendance[s.id]===st?statusColor[st]:'var(--border)'}`,background:attendance[s.id]===st?statusColor[st]:'transparent',color:attendance[s.id]===st?'#fff':'var(--text-muted)',cursor:'pointer',textTransform:'capitalize',transition:'all .15s'}}>
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <button className="btn btn-primary" style={{width:'100%',justifyContent:'center',marginTop:16}} onClick={handleSubmit} disabled={saving}>
                  {saving?'Saving...':'💾 Save Attendance'}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="col-4">
          <div className="card">
            <div className="card-title mb-3">📅 Recent Attendance</div>
            {history.length===0 ? <p style={{color:'var(--text-muted)',fontSize:13}}>No records yet</p> :
              history.map((h,i)=>(
                <div key={i} style={{padding:'10px 0',borderBottom:i<history.length-1?'1px solid var(--border)':'none'}}>
                  <div style={{fontSize:13,fontWeight:600}}>{h.subject}</div>
                  <div style={{fontSize:11,color:'var(--text-muted)'}}>{h.date}</div>
                  <div style={{display:'flex',gap:12,marginTop:6,fontSize:12}}>
                    <span style={{color:'var(--success)'}}>✅ {h.present} present</span>
                    <span style={{color:'var(--danger)'}}>❌ {h.absent} absent</span>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </Layout>
  );
}
