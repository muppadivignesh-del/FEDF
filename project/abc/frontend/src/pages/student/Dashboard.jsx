import React, { useState, useEffect } from 'react';
import Layout from '../../components/shared/Layout';
import { studentAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await studentAPI.getDashboard();
      setData(res.data.data);
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <Layout title="Student Dashboard" subtitle="Loading Overview">
      <div className="loading-spinner"><div className="spinner" /></div>
    </Layout>
  );

  const { student, stats, ai, notifications } = data || {};

  const gradeLetter = (score) => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  };

  const statCards = [
    { icon: '🏆', label: 'Overall Marks', value: stats?.avgMarks ? `${stats.avgMarks}%` : '0%', color: 'var(--primary)', bg: 'var(--primary-soft)' },
    { icon: '📅', label: 'Attendance', value: stats?.attendance ? `${stats.attendance}%` : '0%', color: 'var(--success)', bg: 'var(--success-soft)' },
    { icon: '📝', label: 'Assignments Done', value: `${stats?.assignmentsSubmitted || 0}/${stats?.assignmentsTotal || 0}`, color: 'var(--warning)', bg: 'var(--warning-soft)' },
    { icon: '🎓', label: 'Current Grade', value: stats?.avgMarks ? gradeLetter(stats.avgMarks) : 'N/A', color: 'var(--info)', bg: 'var(--info-soft)' },
  ];

  return (
    <Layout title={`Welcome Back, ${student?.name || 'Student'}!`} subtitle={`ID: ${student?.student_id || 'N/A'} | Class: ${student?.class || 'N/A'}-${student?.section || 'N/A'}`}>
      
      {/* Stats Cards */}
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

      <div className="dashboard-grid">
        {/* Left Col: AI Risk Assessment */}
        <div className="col-6">
          <div className="ai-card" style={{ height: '100%' }}>
            <div className="ai-card-title">🤖 AI Academic Analysis</div>
            <div style={{ marginTop: 12 }}>
              <span style={{ fontSize: 13, marginRight: 8 }}>Risk Level:</span>
              <span className={`ai-risk-badge ai-risk-${ai?.risk_level || 'low'}`}>
                {(ai?.risk_level || 'low').toUpperCase()} RISK (Score: {ai?.risk_score || 0})
              </span>
            </div>

            <div className="ai-score-row">
              <div className="ai-score-item">
                <div className="ai-score-value">{ai?.attendance_score || 0}%</div>
                <div className="ai-score-label">Attendance Score</div>
              </div>
              <div className="ai-score-item">
                <div className="ai-score-value">{ai?.performance_score || 0}%</div>
                <div className="ai-score-label">Performance Score</div>
              </div>
              <div className="ai-score-item">
                <div className="ai-score-value">{stats?.assignmentsTotal > 0 ? Math.round((stats.assignmentsSubmitted / stats.assignmentsTotal) * 100) : 100}%</div>
                <div className="ai-score-label">Submission Rate</div>
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                💡 Recommendation
              </h4>
              <p style={{ fontSize: 13, lineHeight: 1.5, color: 'rgba(255,255,255,.8)' }}>
                {ai?.recommendations || "Your academic trajectory looks solid. Maintain your present level of effort and submission frequency to secure top grades."}
              </p>
            </div>
          </div>
        </div>

        {/* Right Col: Notifications & Quick Contacts */}
        <div className="col-6">
          <div className="card" style={{ height: '100%' }}>
            <div className="card-header" style={{ padding: 0, marginBottom: 16 }}>
              <div>
                <div className="card-title">🔔 Recent Alerts & Notifications</div>
                <div className="card-subtitle">Stay updated on your schedule</div>
              </div>
            </div>
            {notifications && notifications.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {notifications.map((n) => (
                  <div key={n.id} style={{ display: 'flex', gap: 12, padding: '12px', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 20 }}>📢</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{n.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{n.message}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>{new Date(n.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '40px 0' }}>
                <div className="empty-state-icon">🔔</div>
                <p>No recent alerts available.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Strengths & Weaknesses */}
      <div className="dashboard-grid mt-4">
        <div className="col-6">
          <div className="card">
            <h3 className="card-title" style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              💪 Strengths
            </h3>
            {ai?.strengths && ai.strengths.length > 0 ? (
              <ul style={{ paddingLeft: 20, fontSize: 14, color: 'var(--text-secondary)' }}>
                {ai.strengths.map((str, idx) => <li key={idx} style={{ marginBottom: 8 }}>{str}</li>)}
              </ul>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Continuous performance validation pending.</p>
            )}
          </div>
        </div>
        <div className="col-6">
          <div className="card">
            <h3 className="card-title" style={{ color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              ⚠️ Areas to Improve
            </h3>
            {ai?.weaknesses && ai.weaknesses.length > 0 ? (
              <ul style={{ paddingLeft: 20, fontSize: 14, color: 'var(--text-secondary)' }}>
                {ai.weaknesses.map((weak, idx) => <li key={idx} style={{ marginBottom: 8 }}>{weak}</li>)}
              </ul>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No critical improvement gaps found by AI analyzer.</p>
            )}
          </div>
        </div>
      </div>

    </Layout>
  );
}
