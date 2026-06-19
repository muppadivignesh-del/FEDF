import React, { useState, useEffect } from 'react';
import Layout from '../../components/shared/Layout';
import { teacherAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function TeacherDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await teacherAPI.getDashboard();
      setData(res.data.data);
    } catch {
      toast.error('Failed to load teacher dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <Layout title="Teacher Dashboard" subtitle="Loading Overview">
      <div className="loading-spinner"><div className="spinner" /></div>
    </Layout>
  );

  const { stats, recentAttendance } = data || {};

  const statCards = [
    { icon: '👥', label: 'My Students', value: stats?.students || 0, color: 'var(--primary)', bg: 'var(--primary-soft)', path: '/teacher/students' },
    { icon: '📚', label: 'Assigned Subjects', value: stats?.subjects || 0, color: 'var(--info)', bg: 'var(--info-soft)', path: '#' },
    { icon: '📝', label: 'Active Assignments', value: stats?.assignments || 0, color: 'var(--warning)', bg: 'var(--warning-soft)', path: '/teacher/assignments' },
    { icon: '⚠️', label: 'High Risk Students', value: stats?.highRisk || 0, color: 'var(--danger)', bg: 'var(--danger-soft)', path: '/teacher/ai-risk' },
  ];

  return (
    <Layout title="Teacher Analytics Hub" subtitle="Real-time class progress and at-risk monitoring">
      
      {/* Stats Cards */}
      <div className="stats-grid">
        {statCards.map((s, i) => (
          <div className="stat-card" key={i} style={{ cursor: 'pointer' }} onClick={() => s.path !== '#' && (window.location.href = s.path)}>
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

      <div className="dashboard-grid">
        {/* Left Column: Recent Attendance Analytics */}
        <div className="col-8">
          <div className="chart-container">
            <div className="card-header" style={{ padding: 0, marginBottom: 16 }}>
              <div>
                <div className="card-title">📅 Class Attendance Analytics</div>
                <div className="card-subtitle">Daily attendance status overview (Last 7 days)</div>
              </div>
            </div>
            {recentAttendance && recentAttendance.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={recentAttendance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                  <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} />
                  <YAxis domain={[0, 100]} stroke="var(--text-muted)" fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="rate" name="Attendance Rate (%)" stroke="var(--success)" strokeWidth={3} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ padding: 60 }}>
                <div className="empty-state-icon">📅</div>
                <p>No recent attendance marks recorded.</p>
                <button className="btn btn-primary btn-sm mt-3" onClick={() => window.location.href='/teacher/attendance'}>
                  Mark Attendance Now
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Quick Classroom Tools */}
        <div className="col-4">
          <div className="card" style={{ height: '100%' }}>
            <h3 className="card-title" style={{ marginBottom: 16 }}>⚡ Instructor Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => window.location.href='/teacher/attendance'}>
                ✅ Mark Attendance
              </button>
              <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => window.location.href='/teacher/marks'}>
                🏆 Record Student Marks
              </button>
              <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => window.location.href='/teacher/assignments'}>
                📝 Publish New Assignment
              </button>
              <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => window.location.href='/teacher/messages'}>
                💬 Message Assigned Student
              </button>
            </div>
          </div>
        </div>
      </div>

    </Layout>
  );
}
