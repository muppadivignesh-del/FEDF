import React, { useState, useEffect } from 'react';
import Layout from '../../components/shared/Layout';
import { studentAPI } from '../../services/api';
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from 'recharts';
import toast from 'react-hot-toast';

export default function StudentAttendance() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { studentAPI.getAttendance().then(r=>setData(r.data.data||[])).catch(()=>toast.error('Failed')).finally(()=>setLoading(false)); }, []);

  const overall = data.length>0 ? Math.round(data.reduce((a,s)=>a+s.percentage,0)/data.length) : 0;
  const statusColor = (p) => p>=75?'var(--success)':p>=60?'var(--warning)':'var(--danger)';

  return (
    <Layout title="My Attendance" subtitle="Subject-wise attendance overview">
      <div className="dashboard-grid">
        <div className="col-4">
          <div className="card" style={{textAlign:'center'}}>
            <div className="card-title mb-3">📊 Overall Attendance</div>
            <div style={{position:'relative',height:180}}>
              <ResponsiveContainer width="100%" height={180}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={[{value:overall,fill:statusColor(overall)}]} startAngle={90} endAngle={90-3.6*overall}>
                  <RadialBar dataKey="value" cornerRadius={10}/>
                </RadialBarChart>
              </ResponsiveContainer>
              <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',textAlign:'center'}}>
                <div style={{fontSize:32,fontWeight:800,color:statusColor(overall)}}>{overall}%</div>
                <div style={{fontSize:12,color:'var(--text-muted)'}}>Attendance</div>
              </div>
            </div>
            <div style={{marginTop:16,padding:'12px',background:overall>=75?'var(--success-soft)':'var(--danger-soft)',borderRadius:'var(--radius-sm)',fontSize:13,color:overall>=75?'var(--success)':'var(--danger)',fontWeight:600}}>
              {overall>=75?'✅ Attendance is satisfactory':'⚠️ Below 75% — Attendance at risk!'}
            </div>
          </div>
        </div>

        <div className="col-8">
          <div className="card">
            <div className="card-title mb-3">📚 Subject-wise Attendance</div>
            {loading ? <div className="loading-spinner"><div className="spinner"/></div> : (
              <div style={{display:'flex',flexDirection:'column',gap:16}}>
                {data.map((s,i)=>(
                  <div key={i}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                      <span style={{fontWeight:600,fontSize:14}}>{s.subject}</span>
                      <div style={{display:'flex',gap:16,alignItems:'center'}}>
                        <span style={{fontSize:12,color:'var(--text-muted)'}}>{s.present}/{s.total} classes</span>
                        <span style={{fontWeight:800,color:statusColor(s.percentage),fontSize:14,minWidth:40,textAlign:'right'}}>{s.percentage}%</span>
                      </div>
                    </div>
                    <div className="progress-bar" style={{width:'100%',height:10}}>
                      <div className="progress-fill" style={{width:`${s.percentage}%`,background:statusColor(s.percentage),borderRadius:5}}/>
                    </div>
                    {s.percentage < 75 && (
                      <div style={{fontSize:11,color:'var(--danger)',marginTop:4}}>
                        ⚠️ Need {Math.ceil((0.75*s.total - s.present)/0.25)} more classes to reach 75%
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
