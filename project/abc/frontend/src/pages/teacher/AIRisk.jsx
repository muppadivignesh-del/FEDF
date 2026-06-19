import React, { useState, useEffect } from 'react';
import Layout from '../../components/shared/Layout';
import { teacherAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function TeacherAIRisk() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    teacherAPI.getDashboard().then(r=>setData(r.data.data)).catch(()=>toast.error('Failed to load')).finally(()=>setLoading(false));
  }, []);

  const riskColor = { high:'var(--danger)', medium:'var(--warning)', low:'var(--success)' };
  const riskBg    = { high:'var(--danger-soft)', medium:'var(--warning-soft)', low:'var(--success-soft)' };

  const atRisk = data?.atRiskStudents || [];
  const allStudents = [
    ...atRisk,
    { name:'Alex Thompson', attendance:87, avg_marks:78, risk_level:'low' },
    { name:'Priya Sharma',  attendance:92, avg_marks:85, risk_level:'low' },
  ];

  if (loading) return <Layout title="AI Risk Detection"><div className="loading-spinner"><div className="spinner"/></div></Layout>;

  return (
    <Layout title="AI Risk Detection" subtitle="Early warning system for at-risk students">
      {/* Summary */}
      <div className="stats-grid" style={{marginBottom:24}}>
        {[
          { icon:'🔴', label:'High Risk',   value:allStudents.filter(s=>s.risk_level==='high').length,   color:'var(--danger)',  bg:'var(--danger-soft)' },
          { icon:'🟡', label:'Medium Risk', value:allStudents.filter(s=>s.risk_level==='medium').length, color:'var(--warning)', bg:'var(--warning-soft)' },
          { icon:'🟢', label:'Low Risk',    value:allStudents.filter(s=>s.risk_level==='low').length,    color:'var(--success)', bg:'var(--success-soft)' },
          { icon:'👥', label:'Total Analysed', value:allStudents.length, color:'var(--primary)', bg:'var(--primary-soft)' },
        ].map((s,i)=>(
          <div className="stat-card" key={i}>
            <div className="stat-icon" style={{background:s.bg}}><span style={{fontSize:22}}>{s.icon}</span></div>
            <div className="stat-info"><div className="stat-value" style={{color:s.color}}>{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      {/* Student Cards */}
      <div style={{display:'flex',flexDirection:'column',gap:12}}>
        {['high','medium','low'].map(level=>{
          const group = allStudents.filter(s=>s.risk_level===level);
          if (group.length===0) return null;
          return (
            <div key={level}>
              <h3 style={{color:riskColor[level],marginBottom:12,display:'flex',alignItems:'center',gap:8}}>
                {level==='high'?'🔴':level==='medium'?'🟡':'🟢'} {level.charAt(0).toUpperCase()+level.slice(1)} Risk Students ({group.length})
              </h3>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:12}}>
                {group.map((s,i)=>(
                  <div key={i} className="card" style={{borderLeft:`4px solid ${riskColor[s.risk_level]}`,background:riskBg[s.risk_level]}}>
                    <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
                      <div style={{width:40,height:40,borderRadius:'50%',background:`linear-gradient(135deg,${riskColor[s.risk_level]},#6366f1)`,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700}}>
                        {s.name?.charAt(0)}
                      </div>
                      <div><div style={{fontWeight:700}}>{s.name}</div></div>
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                      <div style={{background:'rgba(255,255,255,.5)',borderRadius:8,padding:'8px 12px'}}>
                        <div style={{fontSize:11,color:'var(--text-muted)'}}>ATTENDANCE</div>
                        <div style={{fontSize:18,fontWeight:800,color:s.attendance<75?'var(--danger)':'var(--success)'}}>{s.attendance}%</div>
                      </div>
                      <div style={{background:'rgba(255,255,255,.5)',borderRadius:8,padding:'8px 12px'}}>
                        <div style={{fontSize:11,color:'var(--text-muted)'}}>AVG MARKS</div>
                        <div style={{fontSize:18,fontWeight:800,color:s.avg_marks<50?'var(--danger)':s.avg_marks<70?'var(--warning)':'var(--success)'}}>{s.avg_marks}%</div>
                      </div>
                    </div>
                    {level==='high' && (
                      <div style={{marginTop:12,padding:'8px 12px',background:'rgba(239,68,68,.1)',borderRadius:8,fontSize:12,color:'var(--danger)'}}>
                        ⚠️ Immediate intervention recommended
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
