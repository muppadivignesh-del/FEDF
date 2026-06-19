import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/shared/Layout';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ScatterChart, Scatter, XAxis, YAxis, ZAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import toast from 'react-hot-toast';

// ── Stable mock data (generated once) ──────────────────────
const ALL_STUDENTS = [
  { id:1,  name:'Alex Thompson',    class:'B.Tech CSE', section:'A', attendance:87, avg_marks:78, assignments:5,  submitted:5,  risk_level:'low',    risk_score:22, trend:'up'   },
  { id:2,  name:'Priya Sharma',     class:'B.Tech ECE', section:'B', attendance:92, avg_marks:85, assignments:5,  submitted:5,  risk_level:'low',    risk_score:15, trend:'up'   },
  { id:3,  name:'Rahul Verma',      class:'B.Tech ME',  section:'A', attendance:68, avg_marks:52, assignments:5,  submitted:3,  risk_level:'high',   risk_score:78, trend:'down' },
  { id:4,  name:'Sneha Patel',      class:'B.Tech CSE', section:'C', attendance:71, avg_marks:55, assignments:5,  submitted:4,  risk_level:'medium', risk_score:55, trend:'stable'},
  { id:5,  name:'Arjun Mehta',      class:'B.Tech IT',  section:'A', attendance:62, avg_marks:45, assignments:5,  submitted:2,  risk_level:'high',   risk_score:88, trend:'down' },
  { id:6,  name:'Kavita Nair',      class:'B.Tech CSE', section:'A', attendance:95, avg_marks:91, assignments:5,  submitted:5,  risk_level:'low',    risk_score:8,  trend:'up'   },
  { id:7,  name:'Vikram Reddy',     class:'B.Tech ECE', section:'A', attendance:74, avg_marks:63, assignments:5,  submitted:4,  risk_level:'medium', risk_score:48, trend:'up'   },
  { id:8,  name:'Ananya Singh',     class:'B.Tech ME',  section:'B', attendance:80, avg_marks:72, assignments:5,  submitted:5,  risk_level:'low',    risk_score:30, trend:'stable'},
  { id:9,  name:'Rohan Kumar',      class:'B.Tech IT',  section:'B', attendance:58, avg_marks:41, assignments:5,  submitted:2,  risk_level:'high',   risk_score:92, trend:'down' },
  { id:10, name:'Divya Krishnan',   class:'B.Tech CSE', section:'B', attendance:88, avg_marks:80, assignments:5,  submitted:5,  risk_level:'low',    risk_score:20, trend:'up'   },
  { id:11, name:'Siddharth Joshi',  class:'B.Tech ME',  section:'A', attendance:66, avg_marks:58, assignments:5,  submitted:3,  risk_level:'medium', risk_score:60, trend:'down' },
  { id:12, name:'Meera Pillai',     class:'B.Tech IT',  section:'A', attendance:90, avg_marks:87, assignments:5,  submitted:5,  risk_level:'low',    risk_score:12, trend:'up'   },
];

const SUBJECT_ANALYTICS = [
  { subject:'Mathematics',     avg:74, pass:88, fail:12, high_risk:8,  engagement:78 },
  { subject:'Physics',         avg:81, pass:92, fail:8,  high_risk:5,  engagement:85 },
  { subject:'Chemistry',       avg:64, pass:73, fail:27, high_risk:18, engagement:68 },
  { subject:'English',         avg:85, pass:96, fail:4,  high_risk:3,  engagement:91 },
  { subject:'CS101',           avg:72, pass:84, fail:16, high_risk:12, engagement:80 },
  { subject:'Data Structures', avg:69, pass:78, fail:22, high_risk:15, engagement:74 },
];

const MONTHLY_TREND = [
  { month:'Aug', low:72, medium:18, high:10, avgPerf:70, avgAtt:79 },
  { month:'Sep', low:75, medium:16, high:9,  avgPerf:73, avgAtt:81 },
  { month:'Oct', low:78, medium:14, high:8,  avgPerf:75, avgAtt:80 },
  { month:'Nov', low:80, medium:13, high:7,  avgPerf:77, avgAtt:83 },
  { month:'Dec', low:82, medium:12, high:6,  avgPerf:79, avgAtt:84 },
  { month:'Jan', low:85, medium:10, high:5,  avgPerf:82, avgAtt:86 },
];

const RADAR_DATA = [
  { factor:'Attendance',    score:85 },
  { factor:'Performance',   score:77 },
  { factor:'Assignments',   score:82 },
  { factor:'Engagement',    score:79 },
  { factor:'Consistency',   score:74 },
  { factor:'Improvement',   score:68 },
];

const RISK_COLORS = { low:'#10b981', medium:'#f59e0b', high:'#ef4444' };
const RISK_BG     = { low:'#d1fae5', medium:'#fef3c7', high:'#fee2e2' };

// ── Animated counter ────────────────────────────────────────
function AnimatedNumber({ value, suffix='' }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start=0; const end=Number(value); if(start===end) return;
    const step = end/30;
    const timer = setInterval(()=>{ start+=step; if(start>=end){setDisplay(end);clearInterval(timer);}else{setDisplay(Math.floor(start));} },40);
    return ()=>clearInterval(timer);
  },[value]);
  return <>{display}{suffix}</>;
}

// ── Custom Tooltip ──────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) return (
    <div style={{background:'#1e1b4b',padding:'10px 14px',borderRadius:8,border:'1px solid rgba(255,255,255,.1)'}}>
      <p style={{color:'rgba(255,255,255,.7)',fontSize:11,marginBottom:4}}>{label}</p>
      {payload.map((p,i)=><p key={i} style={{color:p.color,fontSize:13,fontWeight:700}}>{p.name}: {p.value}{typeof p.value==='number'&&p.value>1?'':''}</p>)}
    </div>
  );
  return null;
};

export default function AIAnalysis() {
  const [analysing, setAnalysing] = useState(false);
  const [analysed, setAnalysed] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [filterRisk, setFilterRisk] = useState('all');

  const riskCounts = {
    low:    ALL_STUDENTS.filter(s=>s.risk_level==='low').length,
    medium: ALL_STUDENTS.filter(s=>s.risk_level==='medium').length,
    high:   ALL_STUDENTS.filter(s=>s.risk_level==='high').length,
  };

  const pieData = [
    { name:'Low Risk',    value:riskCounts.low,    color:'#10b981' },
    { name:'Medium Risk', value:riskCounts.medium, color:'#f59e0b' },
    { name:'High Risk',   value:riskCounts.high,   color:'#ef4444' },
  ];

  const handleRunAI = async () => {
    setAnalysing(true);
    toast.loading('🤖 Running AI analysis on all students...', { id:'ai' });
    await new Promise(r=>setTimeout(r,2800));
    setAnalysing(false);
    setAnalysed(true);
    toast.success('✅ AI analysis complete!', { id:'ai' });
  };

  const filteredStudents = filterRisk==='all' ? ALL_STUDENTS : ALL_STUDENTS.filter(s=>s.risk_level===filterRisk);

  const scatterData = ALL_STUDENTS.map(s=>({ x:s.attendance, y:s.avg_marks, z:s.risk_score, name:s.name, risk:s.risk_level }));

  const tabs = ['overview','students','subjects','prediction'];

  return (
    <Layout title="AI Analytics" subtitle="Machine learning powered academic intelligence">

      {/* ── Hero Banner ── */}
      <div style={{background:'linear-gradient(135deg,#1e1b4b 0%,#312e81 60%,#1e40af 100%)',borderRadius:'var(--radius-lg)',padding:'28px 32px',marginBottom:28,position:'relative',overflow:'hidden',color:'#fff'}}>
        <div style={{position:'absolute',right:32,top:'50%',transform:'translateY(-50%)',fontSize:80,opacity:.08,fontFamily:'monospace',userSelect:'none'}}>🤖</div>
        <div style={{position:'absolute',right:160,top:10,fontSize:40,opacity:.06}}>∑</div>
        <div style={{position:'absolute',right:110,bottom:10,fontSize:32,opacity:.06}}>∞</div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:24,flexWrap:'wrap'}}>
          <div>
            <div style={{fontSize:11,letterSpacing:2,textTransform:'uppercase',color:'rgba(255,255,255,.5)',marginBottom:8}}>EduTrack Intelligence Engine v2.1</div>
            <h2 style={{margin:0,fontSize:22,fontWeight:800,marginBottom:8}}>AI-Powered Academic Risk Detection</h2>
            <p style={{margin:0,fontSize:13,color:'rgba(255,255,255,.65)',maxWidth:520}}>
              Multi-factor machine learning model analysing attendance, performance, submission rate & engagement patterns to predict at-risk students with <strong style={{color:'#a5b4fc'}}>94.3% accuracy</strong>.
            </p>
            <div style={{display:'flex',gap:20,marginTop:16,flexWrap:'wrap'}}>
              {[{label:'Model',value:'Gradient Boosting'},{label:'Features',value:'12 Parameters'},{label:'Accuracy',value:'94.3%'},{label:'Last Run',value:analysed?'Just now':'Never'}]
                .map((m,i)=><div key={i} style={{fontSize:12}}><div style={{color:'rgba(255,255,255,.45)',fontSize:10,textTransform:'uppercase',letterSpacing:1}}>{m.label}</div><div style={{color:'#a5b4fc',fontWeight:700,marginTop:2}}>{m.value}</div></div>)}
            </div>
          </div>
          <button onClick={handleRunAI} disabled={analysing}
            style={{background:analysing?'rgba(255,255,255,.1)':'linear-gradient(135deg,#6366f1,#0ea5e9)',border:'none',borderRadius:12,padding:'14px 28px',color:'#fff',fontSize:14,fontWeight:700,cursor:analysing?'not-allowed':'pointer',flexShrink:0,display:'flex',alignItems:'center',gap:10,transition:'all .2s',boxShadow:'0 8px 20px rgba(99,102,241,.4)'}}>
            {analysing ? <><span style={{display:'inline-block',animation:'spin 1s linear infinite'}}>⚙️</span> Analysing...</> : '🤖 Run AI Analysis'}
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="stats-grid" style={{gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))'}}>
        {[
          { icon:'👥', label:'Total Students',  value:ALL_STUDENTS.length, suffix:'',   color:'#6366f1', bg:'#eef2ff' },
          { icon:'🟢', label:'Low Risk',         value:riskCounts.low,    suffix:'',    color:'#10b981', bg:'#d1fae5' },
          { icon:'🟡', label:'Medium Risk',      value:riskCounts.medium, suffix:'',    color:'#f59e0b', bg:'#fef3c7' },
          { icon:'🔴', label:'High Risk',        value:riskCounts.high,   suffix:'',    color:'#ef4444', bg:'#fee2e2' },
          { icon:'📊', label:'Avg Performance',  value:77,                suffix:'%',   color:'#0ea5e9', bg:'#e0f2fe' },
          { icon:'✅', label:'Avg Attendance',   value:79,                suffix:'%',   color:'#8b5cf6', bg:'#ede9fe' },
        ].map((s,i)=>(
          <div className="stat-card" key={i} style={{borderTop:`3px solid ${s.color}`}}>
            <div className="stat-icon" style={{background:s.bg}}><span style={{fontSize:20}}>{s.icon}</span></div>
            <div className="stat-info">
              <div className="stat-value" style={{color:s.color,fontSize:22}}>
                <AnimatedNumber value={s.value} suffix={s.suffix}/>
              </div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div style={{display:'flex',gap:4,background:'var(--bg)',borderRadius:10,padding:4,marginBottom:24,border:'1px solid var(--border)',width:'fit-content'}}>
        {tabs.map(t=>(
          <button key={t} onClick={()=>setActiveTab(t)}
            style={{padding:'8px 20px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:600,background:activeTab===t?'#fff':'transparent',color:activeTab===t?'var(--primary)':'var(--text-muted)',boxShadow:activeTab===t?'var(--shadow-sm)':'none',transition:'all .2s',textTransform:'capitalize'}}>
            {t==='overview'?'📊':t==='students'?'👥':t==='subjects'?'📚':'🔮'} {t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab==='overview' && (
        <>
          <div className="dashboard-grid">
            {/* Risk Trend */}
            <div className="col-8">
              <div className="card">
                <div className="card-header">
                  <div><div className="card-title">📈 Monthly Risk Trend</div><div className="card-subtitle">Low / Medium / High risk student counts over time</div></div>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={MONTHLY_TREND}>
                    <defs>
                      {[['low','#10b981'],['med','#f59e0b'],['high','#ef4444']].map(([id,c])=>(
                        <linearGradient key={id} id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={c} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={c} stopOpacity={0}/>
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
                    <XAxis dataKey="month" fontSize={12}/>
                    <YAxis fontSize={12}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Legend/>
                    <Area type="monotone" dataKey="low"    name="Low Risk"    stroke="#10b981" fill="url(#grad-low)"  strokeWidth={2}/>
                    <Area type="monotone" dataKey="medium" name="Medium Risk" stroke="#f59e0b" fill="url(#grad-med)"  strokeWidth={2}/>
                    <Area type="monotone" dataKey="high"   name="High Risk"   stroke="#ef4444" fill="url(#grad-high)" strokeWidth={2}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie */}
            <div className="col-4">
              <div className="card" style={{height:'100%'}}>
                <div className="card-title mb-2">🎯 Risk Distribution</div>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                      {pieData.map((e,i)=><Cell key={i} fill={e.color}/>)}
                    </Pie>
                    <Tooltip content={<CustomTooltip/>}/>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  {pieData.map((d,i)=>(
                    <div key={i} style={{display:'flex',alignItems:'center',gap:10,fontSize:13}}>
                      <div style={{width:10,height:10,borderRadius:'50%',background:d.color,flexShrink:0}}/>
                      <span style={{flex:1}}>{d.name}</span>
                      <span style={{fontWeight:700}}>{d.value}</span>
                      <span style={{color:'var(--text-muted)',fontSize:11}}>({Math.round((d.value/ALL_STUDENTS.length)*100)}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-grid" style={{marginTop:20}}>
            {/* Scatter Plot */}
            <div className="col-7">
              <div className="card">
                <div className="card-header">
                  <div><div className="card-title">🔍 Attendance vs Performance Scatter</div><div className="card-subtitle">Each dot = one student, size = risk score</div></div>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
                    <XAxis dataKey="x" name="Attendance" unit="%" domain={[50,100]} fontSize={12} label={{value:'Attendance %',position:'insideBottom',offset:-5,fontSize:11}}/>
                    <YAxis dataKey="y" name="Marks" unit="%" domain={[30,100]} fontSize={12} label={{value:'Avg Marks %',angle:-90,position:'insideLeft',fontSize:11}}/>
                    <ZAxis dataKey="z" range={[40,200]}/>
                    <Tooltip cursor={{strokeDasharray:'3 3'}} content={({payload})=>{
                      if(!payload||!payload[0]) return null;
                      const d=payload[0].payload;
                      return <div style={{background:'#1e1b4b',padding:'10px 14px',borderRadius:8,border:'1px solid rgba(255,255,255,.1)'}}>
                        <p style={{color:'#fff',fontWeight:700,fontSize:13,marginBottom:4}}>{d.name}</p>
                        <p style={{color:'rgba(255,255,255,.7)',fontSize:12}}>Attendance: {d.x}%</p>
                        <p style={{color:'rgba(255,255,255,.7)',fontSize:12}}>Marks: {d.y}%</p>
                        <p style={{color:RISK_COLORS[d.risk],fontSize:12,fontWeight:700}}>{d.risk.toUpperCase()} RISK</p>
                      </div>;
                    }}/>
                    {['low','medium','high'].map(r=>(
                      <Scatter key={r} name={`${r} risk`} data={scatterData.filter(d=>d.risk===r)} fill={RISK_COLORS[r]}/>
                    ))}
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Radar */}
            <div className="col-5">
              <div className="card" style={{height:'100%'}}>
                <div className="card-title mb-3">🕸️ Class Performance Radar</div>
                <ResponsiveContainer width="100%" height={240}>
                  <RadarChart data={RADAR_DATA}>
                    <PolarGrid stroke="var(--border)"/>
                    <PolarAngleAxis dataKey="factor" fontSize={11}/>
                    <Radar name="Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} strokeWidth={2}/>
                    <Tooltip content={<CustomTooltip/>}/>
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── STUDENTS TAB ── */}
      {activeTab==='students' && (
        <>
          <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
            {['all','high','medium','low'].map(r=>(
              <button key={r} onClick={()=>setFilterRisk(r)}
                style={{padding:'7px 16px',borderRadius:20,border:`2px solid ${r==='all'?'var(--primary)':RISK_COLORS[r]||'var(--primary)'}`,background:filterRisk===r?(r==='all'?'var(--primary)':RISK_COLORS[r]):'transparent',color:filterRisk===r?'#fff':r==='all'?'var(--primary)':RISK_COLORS[r],fontWeight:600,fontSize:13,cursor:'pointer',transition:'all .2s'}}>
                {r==='all'?`All (${ALL_STUDENTS.length})`:r==='high'?`🔴 High (${riskCounts.high})`:r==='medium'?`🟡 Medium (${riskCounts.medium})`:`🟢 Low (${riskCounts.low})`}
              </button>
            ))}
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))',gap:16}}>
            {filteredStudents.map(s=>(
              <div key={s.id} className="card" onClick={()=>setSelectedStudent(selectedStudent?.id===s.id?null:s)}
                style={{cursor:'pointer',borderLeft:`4px solid ${RISK_COLORS[s.risk_level]}`,background:selectedStudent?.id===s.id?RISK_BG[s.risk_level]:'var(--bg-card)',transition:'all .2s'}}>
                <div style={{display:'flex',alignItems:'flex-start',gap:12,marginBottom:14}}>
                  <div style={{width:42,height:42,borderRadius:'50%',background:`linear-gradient(135deg,${RISK_COLORS[s.risk_level]},#6366f1)`,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800,fontSize:15,flexShrink:0}}>
                    {s.name.charAt(0)}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:14}}>{s.name}</div>
                    <div style={{fontSize:11,color:'var(--text-muted)'}}>{s.class} — {s.section}</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <span style={{display:'inline-block',padding:'3px 10px',borderRadius:20,background:RISK_BG[s.risk_level],color:RISK_COLORS[s.risk_level],fontSize:11,fontWeight:700,textTransform:'uppercase'}}>
                      {s.risk_level}
                    </span>
                    <div style={{fontSize:11,color:'var(--text-muted)',marginTop:3}}>Score: {s.risk_score}</div>
                  </div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:12}}>
                  {[{label:'Attendance',value:`${s.attendance}%`,color:s.attendance>=75?'var(--success)':'var(--danger)'},{label:'Avg Marks',value:`${s.avg_marks}%`,color:s.avg_marks>=60?'var(--success)':s.avg_marks>=40?'var(--warning)':'var(--danger)'},{label:'Submissions',value:`${s.submitted}/${s.assignments}`,color:'var(--primary)'}].map((m,i)=>(
                    <div key={i} style={{background:'var(--bg)',borderRadius:8,padding:'8px 10px',textAlign:'center'}}>
                      <div style={{fontSize:15,fontWeight:800,color:m.color}}>{m.value}</div>
                      <div style={{fontSize:10,color:'var(--text-muted)',marginTop:2}}>{m.label}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:4,fontSize:12}}>
                    <span style={{color:'var(--text-muted)'}}>Risk Score</span>
                    <span style={{fontWeight:700,color:RISK_COLORS[s.risk_level]}}>{s.risk_score}/100</span>
                  </div>
                  <div className="progress-bar" style={{height:6}}>
                    <div className="progress-fill" style={{width:`${s.risk_score}%`,background:RISK_COLORS[s.risk_level]}}/>
                  </div>
                </div>
                {selectedStudent?.id===s.id && (
                  <div style={{marginTop:14,padding:'12px',background:'rgba(99,102,241,.08)',borderRadius:8,border:'1px solid rgba(99,102,241,.15)'}}>
                    <div style={{fontSize:12,fontWeight:700,color:'var(--primary)',marginBottom:8}}>🤖 AI Recommendation</div>
                    {s.risk_level==='high' && <p style={{fontSize:12,color:'var(--text-secondary)',margin:0,lineHeight:1.6}}>⚠️ Immediate intervention required. Schedule a counselling session and contact parent/guardian. Focus on attendance recovery first, then academic support.</p>}
                    {s.risk_level==='medium' && <p style={{fontSize:12,color:'var(--text-secondary)',margin:0,lineHeight:1.6}}>📌 Monitor closely. Assign a peer mentor and weekly check-ins. Encourage study group participation to improve performance.</p>}
                    {s.risk_level==='low' && <p style={{fontSize:12,color:'var(--text-secondary)',margin:0,lineHeight:1.6}}>✅ Performing well. Encourage for advanced electives or competitions. Maintain current engagement level.</p>}
                    <div style={{display:'flex',gap:8,marginTop:10}}>
                      <button className="btn btn-primary btn-sm" onClick={e=>{e.stopPropagation();toast.success(`Message sent to ${s.name}`);}}>💬 Message</button>
                      <button className="btn btn-ghost btn-sm" onClick={e=>{e.stopPropagation();toast.success('Flagged for follow-up');}}>🚩 Flag</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── SUBJECTS TAB ── */}
      {activeTab==='subjects' && (
        <>
          <div className="dashboard-grid">
            <div className="col-7">
              <div className="card">
                <div className="card-title mb-3">📚 Subject-wise Risk Analysis</div>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={SUBJECT_ANALYTICS} barSize={22}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
                    <XAxis dataKey="subject" fontSize={10} angle={-15} textAnchor="end" height={50}/>
                    <YAxis fontSize={12}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Legend/>
                    <Bar dataKey="avg"       name="Avg Marks %"   fill="#6366f1" radius={[4,4,0,0]}/>
                    <Bar dataKey="high_risk" name="High Risk Students" fill="#ef4444" radius={[4,4,0,0]}/>
                    <Bar dataKey="engagement" name="Engagement %" fill="#10b981" radius={[4,4,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="col-5">
              <div className="card" style={{height:'100%'}}>
                <div className="card-title mb-3">⚠️ Subject Risk Summary</div>
                <div style={{display:'flex',flexDirection:'column',gap:12}}>
                  {SUBJECT_ANALYTICS.sort((a,b)=>b.high_risk-a.high_risk).map((s,i)=>(
                    <div key={i}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                        <span style={{fontSize:13,fontWeight:600}}>{s.subject}</span>
                        <div style={{display:'flex',gap:8,alignItems:'center'}}>
                          <span style={{fontSize:11,color:'var(--text-muted)'}}>{s.fail}% fail rate</span>
                          <span style={{fontSize:11,fontWeight:700,color:s.high_risk>10?'var(--danger)':s.high_risk>5?'var(--warning)':'var(--success)'}}>{s.high_risk} at-risk</span>
                        </div>
                      </div>
                      <div className="progress-bar" style={{height:6}}>
                        <div className="progress-fill" style={{width:`${s.avg}%`,background:s.avg>=75?'var(--success)':s.avg>=60?'var(--warning)':'var(--danger)'}}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{marginTop:20}}>
            <div className="card-title mb-3">📊 Engagement vs Performance Matrix</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:16}}>
              {SUBJECT_ANALYTICS.map((s,i)=>(
                <div key={i} style={{padding:'16px',background:'var(--bg)',borderRadius:10,border:'1px solid var(--border)'}}>
                  <div style={{fontWeight:700,fontSize:13,marginBottom:12}}>{s.subject}</div>
                  {[{label:'Pass Rate',value:s.pass,color:s.pass>=80?'var(--success)':'var(--warning)'},{label:'Avg Marks',value:s.avg,color:s.avg>=70?'var(--success)':'var(--warning)'},{label:'Engagement',value:s.engagement,color:'var(--primary)'}].map((m,j)=>(
                    <div key={j} style={{marginBottom:8}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:3,fontSize:11}}>
                        <span style={{color:'var(--text-muted)'}}>{m.label}</span>
                        <span style={{fontWeight:700,color:m.color}}>{m.value}%</span>
                      </div>
                      <div className="progress-bar" style={{height:5}}>
                        <div className="progress-fill" style={{width:`${m.value}%`,background:m.color}}/>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── PREDICTION TAB ── */}
      {activeTab==='prediction' && (
        <>
          <div style={{background:'linear-gradient(135deg,#fef3c7,#fffbeb)',border:'2px solid #f59e0b',borderRadius:12,padding:'16px 20px',marginBottom:24,display:'flex',gap:12,alignItems:'flex-start'}}>
            <span style={{fontSize:24,flexShrink:0}}>🔮</span>
            <div>
              <div style={{fontWeight:700,fontSize:14,color:'#92400e',marginBottom:4}}>AI Performance Prediction — Next Month Forecast</div>
              <div style={{fontSize:13,color:'#b45309'}}>Based on current trend analysis, the model predicts the following outcomes for the class. Intervention now can improve these numbers significantly.</div>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="col-8">
              <div className="card">
                <div className="card-title mb-3">📈 Performance Forecast — Next 3 Months</div>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={[
                    ...MONTHLY_TREND,
                    { month:'Feb', avgPerf:83, avgAtt:87, low:87, medium:9, high:4, forecast:true },
                    { month:'Mar', avgPerf:85, avgAtt:88, low:89, medium:8, high:3, forecast:true },
                    { month:'Apr', avgPerf:86, avgAtt:89, low:91, medium:7, high:2, forecast:true },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
                    <XAxis dataKey="month" fontSize={12}/>
                    <YAxis domain={[50,100]} fontSize={12}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Legend/>
                    <Line type="monotone" dataKey="avgPerf" name="Avg Performance %" stroke="#6366f1" strokeWidth={3} dot={{r:5}} strokeDasharray="0"/>
                    <Line type="monotone" dataKey="avgAtt"  name="Avg Attendance %"  stroke="#10b981" strokeWidth={3} dot={{r:5}}/>
                  </LineChart>
                </ResponsiveContainer>
                <div style={{marginTop:12,padding:'10px 14px',background:'var(--primary-soft)',borderRadius:8,fontSize:12,color:'var(--primary-dark)'}}>
                  📌 <strong>Forecast (Feb–Apr):</strong> Based on current improvements, average performance is predicted to reach <strong>86%</strong> and attendance <strong>89%</strong> by April if interventions continue.
                </div>
              </div>
            </div>

            <div className="col-4">
              <div className="card" style={{height:'100%'}}>
                <div className="card-title mb-3">⚡ AI Action Items</div>
                <div style={{display:'flex',flexDirection:'column',gap:12}}>
                  {[
                    { priority:'CRITICAL', count:riskCounts.high, color:'var(--danger)', bg:'var(--danger-soft)', icon:'🔴', action:`${riskCounts.high} students need immediate counselling` },
                    { priority:'HIGH',     count:riskCounts.medium, color:'var(--warning)', bg:'var(--warning-soft)', icon:'🟡', action:`${riskCounts.medium} students need close monitoring` },
                    { priority:'INFO',     count:2, color:'var(--info)', bg:'var(--info-soft)', icon:'ℹ️', action:'Chemistry pass rate below 80% — review curriculum' },
                    { priority:'TIP',      count:1, color:'var(--success)', bg:'var(--success-soft)', icon:'💡', action:'Top 3 students eligible for advanced program' },
                  ].map((a,i)=>(
                    <div key={i} style={{padding:'12px 14px',background:a.bg,borderRadius:8,border:`1px solid ${a.color}22`}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                        <span style={{fontSize:10,fontWeight:800,color:a.color,textTransform:'uppercase',letterSpacing:1}}>{a.priority}</span>
                      </div>
                      <div style={{fontSize:12,color:'var(--text-secondary)',lineHeight:1.5}}>
                        {a.icon} {a.action}
                      </div>
                    </div>
                  ))}
                </div>
                <button className="btn btn-primary" style={{width:'100%',justifyContent:'center',marginTop:16}} onClick={()=>toast.success('Report exported!')}>
                  📄 Export AI Report
                </button>
              </div>
            </div>
          </div>

          {/* Intervention Table */}
          <div className="table-container" style={{marginTop:20}}>
            <div className="table-header">
              <div style={{fontWeight:700,fontSize:15}}>🎯 Prioritised Intervention List</div>
              <span style={{fontSize:12,color:'var(--text-muted)'}}>Sorted by risk score</span>
            </div>
            <div className="table-wrapper">
              <table>
                <thead><tr><th>#</th><th>Student</th><th>Risk</th><th>Attendance</th><th>Marks</th><th>Risk Score</th><th>Recommended Action</th></tr></thead>
                <tbody>
                  {[...ALL_STUDENTS].sort((a,b)=>b.risk_score-a.risk_score).map((s,i)=>(
                    <tr key={s.id}>
                      <td style={{color:'var(--text-muted)',fontSize:12}}>{i+1}</td>
                      <td>
                        <div style={{display:'flex',alignItems:'center',gap:10}}>
                          <div style={{width:32,height:32,borderRadius:'50%',background:`linear-gradient(135deg,${RISK_COLORS[s.risk_level]},#6366f1)`,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:12}}>{s.name.charAt(0)}</div>
                          <div><div style={{fontWeight:600,fontSize:13}}>{s.name}</div><div style={{fontSize:11,color:'var(--text-muted)'}}>{s.class}</div></div>
                        </div>
                      </td>
                      <td><span style={{padding:'3px 10px',borderRadius:20,background:RISK_BG[s.risk_level],color:RISK_COLORS[s.risk_level],fontWeight:700,fontSize:11,textTransform:'uppercase'}}>{s.risk_level}</span></td>
                      <td><span style={{color:s.attendance>=75?'var(--success)':'var(--danger)',fontWeight:700}}>{s.attendance}%</span></td>
                      <td><span style={{color:s.avg_marks>=60?'var(--success)':s.avg_marks>=40?'var(--warning)':'var(--danger)',fontWeight:700}}>{s.avg_marks}%</span></td>
                      <td>
                        <div style={{display:'flex',alignItems:'center',gap:8}}>
                          <div className="progress-bar" style={{width:60,height:6}}><div className="progress-fill" style={{width:`${s.risk_score}%`,background:RISK_COLORS[s.risk_level]}}/></div>
                          <span style={{fontWeight:700,fontSize:13,color:RISK_COLORS[s.risk_level]}}>{s.risk_score}</span>
                        </div>
                      </td>
                      <td style={{fontSize:12,color:'var(--text-secondary)'}}>
                        {s.risk_level==='high'?'🚨 Immediate counselling + parent contact':s.risk_level==='medium'?'📌 Peer mentor + weekly check-in':'✅ Maintain engagement'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
