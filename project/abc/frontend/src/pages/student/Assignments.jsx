import React, { useState, useEffect } from 'react';
import Layout from '../../components/shared/Layout';
import { studentAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { studentAPI.getAssignments().then(r=>setAssignments(r.data.data||[])).catch(()=>toast.error('Failed')).finally(()=>setLoading(false)); }, []);

  const handleSubmit = async (id) => {
    try {
      await studentAPI.submitAssignment({ assignment_id:id });
      setAssignments(p=>p.map(a=>a.id===id?{...a,status:'submitted'}:a));
      toast.success('Assignment submitted!');
    } catch { toast.error('Submission failed'); }
  };

  const isPast = (d) => new Date(d) < new Date();
  const statusColor = { pending:'var(--warning)', submitted:'var(--success)', graded:'var(--primary)', late:'var(--danger)', missing:'var(--danger)' };
  const statusBg    = { pending:'var(--warning-soft)', submitted:'var(--success-soft)', graded:'var(--primary-soft)', late:'var(--danger-soft)', missing:'var(--danger-soft)' };

  const pending   = assignments.filter(a=>a.status==='pending').length;
  const submitted = assignments.filter(a=>a.status==='submitted'||a.status==='graded').length;

  return (
    <Layout title="My Assignments" subtitle="Track and submit your assignments">
      <div className="stats-grid" style={{marginBottom:24}}>
        {[
          { icon:'📝', label:'Total',     value:assignments.length, color:'var(--primary)', bg:'var(--primary-soft)' },
          { icon:'⏳', label:'Pending',   value:pending,            color:'var(--warning)', bg:'var(--warning-soft)' },
          { icon:'✅', label:'Submitted', value:submitted,          color:'var(--success)', bg:'var(--success-soft)' },
          { icon:'📊', label:'Rate',      value:assignments.length>0?`${Math.round((submitted/assignments.length)*100)}%`:'0%', color:'var(--info)', bg:'var(--info-soft)' },
        ].map((s,i)=>(
          <div className="stat-card" key={i}>
            <div className="stat-icon" style={{background:s.bg}}><span style={{fontSize:22}}>{s.icon}</span></div>
            <div className="stat-info"><div className="stat-value" style={{color:s.color}}>{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      {loading ? <div className="loading-spinner"><div className="spinner"/></div> : (
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          {assignments.map((a,i)=>(
            <div key={i} className="card" style={{borderLeft:`4px solid ${statusColor[a.status]||'var(--border)'}`,background:statusBg[a.status]||'transparent'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6}}>
                    <h3 style={{margin:0,fontSize:15}}>{a.title}</h3>
                    <span className="badge" style={{background:statusColor[a.status],color:'#fff',textTransform:'capitalize'}}>{a.status}</span>
                  </div>
                  <div style={{display:'flex',gap:16,fontSize:13,color:'var(--text-muted)',flexWrap:'wrap'}}>
                    <span>📚 {a.subject}</span>
                    <span>📅 Due: {new Date(a.due_date).toLocaleDateString()}</span>
                    {isPast(a.due_date) && a.status==='pending' && <span style={{color:'var(--danger)',fontWeight:600}}>⚠️ Overdue!</span>}
                  </div>
                </div>
                {a.status==='pending' && (
                  <button className="btn btn-primary btn-sm" style={{flexShrink:0}} onClick={()=>handleSubmit(a.id)}>
                    📤 Submit
                  </button>
                )}
                {(a.status==='submitted'||a.status==='graded') && (
                  <div style={{textAlign:'right',flexShrink:0}}>
                    <span style={{color:'var(--success)',fontWeight:700,fontSize:13}}>✅ Submitted</span>
                    {a.marks_obtained && <div style={{fontSize:13,marginTop:4}}>Score: <strong>{a.marks_obtained}/{a.total_marks}</strong></div>}
                  </div>
                )}
              </div>
            </div>
          ))}
          {assignments.length===0 && (
            <div className="card text-center" style={{padding:'80px 40px'}}>
              <div style={{fontSize:64,marginBottom:16}}>📝</div>
              <h3>No assignments</h3>
              <p style={{color:'var(--text-muted)'}}>You have no assignments at the moment</p>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
