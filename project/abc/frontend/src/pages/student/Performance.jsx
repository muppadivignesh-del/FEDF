import React, { useState, useEffect } from 'react';
import Layout from '../../components/shared/Layout';
import { studentAPI } from '../../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import toast from 'react-hot-toast';

export default function StudentPerformance() {
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { studentAPI.getPerformanceTrend().then(r=>setTrend(r.data.data||[])).catch(()=>toast.error('Failed')).finally(()=>setLoading(false)); }, []);

  const subjectData = [
    { subject:'Mathematics',     marks:74, attendance:85, grade:'B' },
    { subject:'Physics',         marks:82, attendance:92, grade:'A' },
    { subject:'Chemistry',       marks:65, attendance:69, grade:'C' },
    { subject:'English',         marks:88, attendance:96, grade:'A' },
    { subject:'CS101',           marks:70, attendance:77, grade:'B' },
    { subject:'Data Structures', marks:79, attendance:88, grade:'B' },
  ];

  const avg = Math.round(subjectData.reduce((a,s)=>a+s.marks,0)/subjectData.length);

  return (
    <Layout title="Performance Trend" subtitle="Academic progress over time">
      <div className="stats-grid" style={{marginBottom:24}}>
        {[
          { icon:'📈', label:'Current Average', value:`${avg}%`,   color:'var(--primary)', bg:'var(--primary-soft)' },
          { icon:'🏆', label:'Best Subject',     value:'English',   color:'var(--success)', bg:'var(--success-soft)' },
          { icon:'⚠️', label:'Needs Attention',  value:'Chemistry', color:'var(--warning)', bg:'var(--warning-soft)' },
          { icon:'📊', label:'Trend',            value:'↑ +4%',     color:'var(--info)',    bg:'var(--info-soft)' },
        ].map((s,i)=>(
          <div className="stat-card" key={i}>
            <div className="stat-icon" style={{background:s.bg}}><span style={{fontSize:22}}>{s.icon}</span></div>
            <div className="stat-info"><div className="stat-value" style={{color:s.color}}>{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      <div className="card mb-4">
        <div className="card-title mb-3">📈 Monthly Performance Trend</div>
        {loading ? <div className="loading-spinner"><div className="spinner"/></div> : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
              <XAxis dataKey="month" fontSize={12}/>
              <YAxis domain={[60,100]} fontSize={12}/>
              <Tooltip/>
              <Area type="monotone" dataKey="avg" name="Average %" stroke="#6366f1" fill="url(#perfGrad)" strokeWidth={3}/>
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="card">
        <div className="card-title mb-3">📚 Subject Performance Breakdown</div>
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          {subjectData.map((s,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:16}}>
              <div style={{width:140,fontSize:13,fontWeight:600,flexShrink:0}}>{s.subject}</div>
              <div style={{flex:1}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                  <span style={{fontSize:12,color:'var(--text-muted)'}}>Marks: {s.marks}%</span>
                  <span style={{fontSize:12,color:'var(--text-muted)'}}>Attendance: {s.attendance}%</span>
                </div>
                <div className="progress-bar" style={{width:'100%',height:8}}>
                  <div className="progress-fill" style={{width:`${s.marks}%`,background:s.marks>=70?'var(--success)':s.marks>=50?'var(--warning)':'var(--danger)'}}/>
                </div>
              </div>
              <div style={{width:36,height:36,borderRadius:'50%',background:s.marks>=70?'var(--success-soft)':s.marks>=50?'var(--warning-soft)':'var(--danger-soft)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:14,color:s.marks>=70?'var(--success)':s.marks>=50?'var(--warning)':'var(--danger)',flexShrink:0}}>
                {s.grade}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
