import React from 'react';
import Layout from '../../components/shared/Layout';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DATA = [
  { name: 'Mathematics', passRate: 88, avgMarks: 74 },
  { name: 'Physics', passRate: 92, avgMarks: 81 },
  { name: 'Chemistry', passRate: 73, avgMarks: 64 },
  { name: 'English', passRate: 96, avgMarks: 85 },
];

export default function TeacherAnalytics() {
  return (
    <Layout title="Class Analytics" subtitle="Performance overview of your subjects">
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-info"><div className="stat-value text-primary">87%</div><div className="stat-label">Average Pass Rate</div></div></div>
        <div className="stat-card"><div className="stat-info"><div className="stat-value text-success">76%</div><div className="stat-label">Average Marks</div></div></div>
        <div className="stat-card"><div className="stat-info"><div className="stat-value text-warning">85%</div><div className="stat-label">Avg Attendance</div></div></div>
      </div>
      
      <div className="card">
        <div className="card-title mb-3">Performance by Subject</div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="passRate" name="Pass Rate %" fill="#10b981" />
            <Bar dataKey="avgMarks" name="Avg Marks %" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Layout>
  );
}
