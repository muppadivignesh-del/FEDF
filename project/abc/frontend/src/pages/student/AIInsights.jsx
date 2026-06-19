import React, { useState, useEffect } from 'react';
import Layout from '../../components/shared/Layout';
import { studentAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function StudentAIInsights() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { studentAPI.getAIAnalysis().then(r=>setData(r.data.data)).catch(()=>toast.error('Failed')).finally(()=>setLoading(false)); }, []);

  const riskColor = { low:'var(--success)', medium:'var(--warning)', high:'var(--danger)' };
  const riskBg    = { low:'var(--success-soft)', medium:'var(--warning-soft)', high:'var(--danger-soft)' };

  if (loading) return <Layout title="AI Insights"><div className="loading-spinner"><div className="spinner"/></div></Layout>;

  const risk = data?.risk_level || 'low';
  const suggestions = data?.suggestions || ['Keep up the great work!','Maintain consistent attendance','Review notes regularly'];

  const scores = [
    { label:'Attendance Score',   value:87, color:'#10b981' },
    { label:'Performance Score',  value:79, color:'#6366f1' },
    { label:'Submission Rate',    value:85, color:'#0ea5e9' },
    { label:'Overall Risk Score', value:100-(data?.risk_score||22), color:'#f59e0b' },
  ];

  return (
    <Layout title="AI Academic Insights" subtitle="Personalized AI-driven academic analysis">
      {/* Risk Banner */}
      <div style={{padding:'20px 24px',borderRadius:'var(--radius)',background:riskBg[risk],border:`2px solid ${riskColor[risk]}`,marginBottom:24,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <div style={{fontSize:13,color:riskColor[risk],fontWeight:700,textTransform:'uppercase',letterSpacing:1}}>🤖 AI Risk Assessment</div>
          <div style={{fontSize:28,fontWeight:800,color:riskColor[risk],marginTop:4}}>{risk.toUpperCase()} RISK</div>
          <div style={{fontSize:13,color:'var(--text-secondary)',marginTop:4}}>Risk Score: {data?.risk_score||22}/100 • Last analysed: Today</div>
        </div>
        <div style={{fontSize:64}}>{risk==='high'?'🔴':risk==='medium'?'🟡':'🟢'}</div>
      </div>

      {/* Score Cards */}
      <div className="stats-grid" style={{marginBottom:24}}>
        {scores.map((s,i)=>(
          <div className="card" key={i} style={{textAlign:'center'}}>
            <div style={{fontSize:36,fontWeight:800,color:s.color}}>{s.value}%</div>
            <div style={{height:6,background:'var(--border)',borderRadius:3,margin:'12px 0'}}>
              <div style={{width:`${s.value}%`,height:'100%',background:s.color,borderRadius:3,transition:'width 1s'}}/>
            </div>
            <div style={{fontSize:12,color:'var(--text-muted)',fontWeight:600}}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* Suggestions */}
        <div className="col-6">
          <div className="ai-card">
            <div className="ai-card-title">💡 AI Recommendations</div>
            <div style={{display:'flex',flexDirection:'column',gap:12,marginTop:16}}>
              {suggestions.map((s,i)=>(
                <div key={i} style={{display:'flex',gap:12,padding:'12px',background:'rgba(255,255,255,.1)',borderRadius:8}}>
                  <span style={{fontSize:20,flexShrink:0}}>{'⭐📚🎯✅💪'.charAt(i*2)}</span>
                  <p style={{margin:0,fontSize:13,lineHeight:1.6,color:'rgba(255,255,255,.9)'}}>{s}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Key Factors */}
        <div className="col-6">
          <div className="card">
            <div className="card-title mb-3">📊 Key Performance Factors</div>
            {[
              { label:'Consistent Attendance', status:'good', note:'87% average — Keep it up!' },
              { label:'Chemistry Attendance',  status:'warn', note:'69% — Below 75% threshold' },
              { label:'CS101 Midterm Score',   status:'warn', note:'65% — Consider extra study' },
              { label:'Physics Performance',   status:'good', note:'82% — Excellent performance' },
              { label:'Assignment Submission',  status:'good', note:'5/6 submitted on time' },
            ].map((f,i)=>(
              <div key={i} style={{display:'flex',alignItems:'flex-start',gap:12,padding:'10px 0',borderBottom:i<4?'1px solid var(--border)':'none'}}>
                <span style={{fontSize:18,flexShrink:0}}>{f.status==='good'?'✅':'⚠️'}</span>
                <div>
                  <div style={{fontWeight:600,fontSize:13}}>{f.label}</div>
                  <div style={{fontSize:12,color:'var(--text-muted)',marginTop:2}}>{f.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
