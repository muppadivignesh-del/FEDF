import React, { useState, useEffect } from 'react';
import Layout from '../../components/shared/Layout';
import { adminAPI } from '../../services/api';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#6366f1','#0ea5e9','#10b981','#f59e0b','#ef4444','#8b5cf6'];

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { adminAPI.getDashboard().then(r => { setData(r.data.data); setLoading(false); }).catch(() => setLoading(false)); }, []);

  const subjectPerf = [
    { subject: 'Mathematics', avg: 74, pass: 88 },
    { subject: 'Physics',     avg: 81, pass: 92 },
    { subject: 'Chemistry',   avg: 68, pass: 79 },
    { subject: 'English',     avg: 85, pass: 96 },
    { subject: 'CS101',       avg: 78, pass: 89 },
    { subject: 'Data Structures', avg: 72, pass: 84 },
  ];

  const trend = [
    { month: 'Aug', attendance: 82, performance: 71 },
    { month: 'Sep', attendance: 85, performance: 74 },
    { month: 'Oct', attendance: 80, performance: 76 },
    { month: 'Nov', attendance: 88, performance: 79 },
    { month: 'Dec', attendance: 84, performance: 81 },
    { month: 'Jan', attendance: 87, performance: 83 },
  ];

  const riskData = [
    { name: 'Low Risk',    value: 89, color: '#10b981' },
    { name: 'Medium Risk', value: 25, color: '#f59e0b' },
    { name: 'High Risk',   value: 10, color: '#ef4444' },
  ];

  if (loading) return <Layout title="Analytics"><div className="loading-spinner"><div className="spinner"/></div></Layout>;

  return (
    <Layout title="Analytics" subtitle="Institution-wide performance overview">
      {/* KPI Row */}
      <div className="stats-grid">
        {[
          { icon: '📊', label: 'Avg Attendance', value: '85%',  color: '#10b981', bg: '#d1fae5' },
          { icon: '🏆', label: 'Avg Performance', value: '77%', color: '#6366f1', bg: '#eef2ff' },
          { icon: '✅', label: 'Pass Rate',        value: '88%', color: '#0ea5e9', bg: '#e0f2fe' },
          { icon: '⚠️', label: 'At-Risk Students', value: '35', color: '#ef4444', bg: '#fee2e2' },
        ].map((s,i) => (
          <div className="stat-card" key={i}>
            <div className="stat-icon" style={{background:s.bg}}><span style={{fontSize:22}}>{s.icon}</span></div>
            <div className="stat-info">
              <div className="stat-value" style={{color:s.color}}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Trend Chart */}
      <div className="card mb-4">
        <div className="card-header"><div className="card-title">📈 Monthly Trend — Attendance vs Performance</div></div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
            <XAxis dataKey="month" fontSize={12}/>
            <YAxis domain={[60,100]} fontSize={12}/>
            <Tooltip/>
            <Legend/>
            <Line type="monotone" dataKey="attendance"  name="Attendance (%)"  stroke="#10b981" strokeWidth={3} dot={{r:5}}/>
            <Line type="monotone" dataKey="performance" name="Performance (%)" stroke="#6366f1" strokeWidth={3} dot={{r:5}}/>
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="dashboard-grid">
        {/* Subject Performance */}
        <div className="col-8">
          <div className="card">
            <div className="card-title mb-3">📚 Subject-wise Average Marks</div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={subjectPerf} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
                <XAxis dataKey="subject" fontSize={11}/>
                <YAxis domain={[0,100]} fontSize={12}/>
                <Tooltip/>
                <Legend/>
                <Bar dataKey="avg"  name="Avg Marks"  fill="#6366f1" radius={[4,4,0,0]}/>
                <Bar dataKey="pass" name="Pass Rate %" fill="#10b981" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Risk Pie */}
        <div className="col-4">
          <div className="card" style={{height:'100%'}}>
            <div className="card-title mb-3">🤖 AI Risk Distribution</div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={riskData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name,value})=>`${value}`}>
                  {riskData.map((e,i)=><Cell key={i} fill={e.color}/>)}
                </Pie>
                <Tooltip/>
              </PieChart>
            </ResponsiveContainer>
            <div style={{display:'flex',flexDirection:'column',gap:8,marginTop:12}}>
              {riskData.map((r,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:8,fontSize:13}}>
                  <div style={{width:12,height:12,borderRadius:'50%',background:r.color}}/>
                  <span>{r.name}</span>
                  <span style={{marginLeft:'auto',fontWeight:700}}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
