import React from 'react';
import Layout from '../../components/shared/Layout';
import { useNavigate } from 'react-router-dom';

export default function Placeholder({ title, icon = '🛠️' }) {
  const navigate = useNavigate();

  return (
    <Layout title={title} subtitle="EduTrack AI Module">
      <div className="card text-center" style={{ padding: '80px 40px', maxWidth: 600, margin: '40px auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        <div style={{ fontSize: 64 }}>{icon}</div>
        <div>
          <h2 style={{ fontSize: 24, marginBottom: 8 }}>{title} Module</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            This section is currently under development or is being populated with real-time academic records.
          </p>
        </div>
        <div style={{ padding: '16px', background: 'var(--primary-soft)', border: '1px dashed var(--primary-light)', borderRadius: 'var(--radius)', width: '100%', fontSize: 13, color: 'var(--primary-dark)', fontWeight: 500 }}>
          🤖 Powered by EduTrack AI Decision Systems
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-primary" onClick={() => navigate(-1)}>
            ← Go Back
          </button>
          <button className="btn btn-ghost" onClick={() => navigate('/')}>
            Dashboard
          </button>
        </div>
      </div>
    </Layout>
  );
}
