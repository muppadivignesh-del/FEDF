import React, { useState, useEffect } from 'react';
import Layout from '../../components/shared/Layout';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';

const RISK_COLORS = { low: '#10b981', medium: '#f59e0b', high: '#ef4444' };

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await adminAPI.getDashboard();
      setData(res.data.data);
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const runAI = async () => {
    toast.loading('Running AI analysis...');
    try {
      await adminAPI.runAIAnalysis();
      toast.dismiss();
      toast.success('AI analysis complete for all students!');
      loadData();
    } catch {
      toast.dismiss();
      toast.error('AI analysis failed');
    }
  };

  if (loading) return (
    <Layout title="Admin Dashboard" subtitle="System Overview">
      <div className="loading-spinner"><div className="spinner" /></div>
    </Layout>
  );

  const { stats, riskDistribution, recentStudents, attendanceToday } = data || {};

  const statCards = [
    { icon: '🎓', label: 'Total Students', value: stats?.students || 0, color: '#4f46e5', bg: '#eef2ff' },
    { icon: '👨‍🏫', label: 'Total Teachers', value: stats?.teachers || 0, color: '#0ea5e9', bg: '#e0f2fe' },
    { icon: '📚', label: 'Active Subjects', value: stats?.subjects || 0, color: '#10b981', bg: '#d1fae5' },
    { icon: '💬', label: 'Unread Messages', value: stats?.unreadMessages || 0, color: '#f59e0b', bg: '#fef3c7' },
  ];

  const riskData = riskDistribution?.map(r => ({
    name: r.risk_level?.charAt(0).toUpperCase() + r.risk_level?.slice(1) + ' Risk',
    value: parseInt(r.count),
    color: RISK_COLORS[r.risk_level] || '#6366f1',
  })) || [];

  const attPct = attendanceToday?.total > 0
    ? Math.round((attendanceToday.present / attendanceToday.total) * 100) : 0;

  return (
    <Layout title="Admin Dashboard" subtitle="System overview and analytics">
      {/* Stats */}
      <div className="stats-grid">
        {statCards.map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-icon" style={{ background: s.bg }}>
              <span style={{ fontSize: 22 }}>{s.icon}</span>
            </div>
            <div className="stat-info">
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Today's Attendance Quick View */}
      {attendanceToday && (
        <div className="card mb-4">
          <div className="card-header">
            <div>
              <div className="card-title">Today's Attendance</div>
              <div className="card-subtitle">{new Date().toLocaleDateString('en-US', { weekday:'long',year:'numeric',month:'long',day:'numeric' })}</div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={runAI}>🤖 Run AI Analysis</button>
          </div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {[
              { label: 'Present', value: attendanceToday.present || 0, color: 'var(--success)', bg: 'var(--success-soft)' },
              { label: 'Absent', value: attendanceToday.absent || 0, color: 'var(--danger)', bg: 'var(--danger-soft)' },
              { label: 'Total Sessions', value: attendanceToday.total || 0, color: 'var(--primary)', bg: 'var(--primary-soft)' },
              { label: 'Attendance Rate', value: `${attPct}%`, color: attPct >= 75 ? 'var(--success)' : 'var(--danger)', bg: attPct >= 75 ? 'var(--success-soft)' : 'var(--danger-soft)' },
            ].map((item, i) => (
              <div key={i} style={{ padding: '12px 20px', background: item.bg, borderRadius: 'var(--radius-sm)', flex: '1', minWidth: 100, textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: item.color }}>{item.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginTop: 4 }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="dashboard-grid">
        {/* Risk Distribution */}
        <div className="col-4">
          <div className="chart-container" style={{ height: '100%' }}>
            <div className="card-header">
              <div>
                <div className="card-title">🤖 AI Risk Distribution</div>
                <div className="card-subtitle">Student risk levels</div>
              </div>
            </div>
            {riskData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={riskData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name,value}) => `${name}: ${value}`} labelLine={false}>
                    {riskData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ padding: 40 }}>
                <div className="empty-state-icon">🤖</div>
                <p>Run AI analysis to see risk distribution</p>
                <button className="btn btn-primary btn-sm mt-3" onClick={runAI}>Run Now</button>
              </div>
            )}
            {riskData.length > 0 && (
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 8, flexWrap: 'wrap' }}>
                {riskData.map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: r.color }} />
                    <span>{r.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Students */}
        <div className="col-8">
          <div className="table-container">
            <div className="table-header">
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>👥 Recently Enrolled Students</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Latest registrations</div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => window.location.href='/admin/students'}>View All</button>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Class</th>
                    <th>Section</th>
                    <th>Enrolled</th>
                  </tr>
                </thead>
                <tbody>
                  {recentStudents?.length > 0 ? recentStudents.map((s, i) => (
                    <tr key={i}>
                      <td><strong>{s.name}</strong></td>
                      <td style={{ color: 'var(--text-muted)' }}>{s.email}</td>
                      <td><span className="badge badge-primary">{s.class}</span></td>
                      <td>{s.section}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(s.created_at).toLocaleDateString()}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5} className="text-center" style={{ padding: 32, color: 'var(--text-muted)' }}>No students yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card mt-4">
        <div className="card-title mb-3">⚡ Quick Actions</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: '➕ Add Student', path: '/admin/students', color: 'btn-primary' },
            { label: '👨‍🏫 Add Teacher', path: '/admin/teachers', color: 'btn-secondary' },
            { label: '📚 Add Subject', path: '/admin/subjects', color: 'btn-ghost' },
            { label: '📢 Announcement', path: '/admin/announcements', color: 'btn-ghost' },
            { label: '📊 View Analytics', path: '/admin/analytics', color: 'btn-ghost' },
          ].map((a, i) => (
            <button key={i} className={`btn ${a.color}`} onClick={() => window.location.href = a.path}>
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </Layout>
  );
}
