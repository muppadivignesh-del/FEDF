import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}! 👋`);
      navigate(`/${user.role}/dashboard`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (email, password) => {
    setForm({ email, password });
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}! 👋`);
      navigate(`/${user.role}/dashboard`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left Panel */}
      <div className="auth-left">
        <div style={{ maxWidth: 420 }}>
          <span className="auth-logo">🎓</span>
          <h1 className="auth-brand">EduTrack AI</h1>
          <p className="auth-tagline">
            AI-Powered Student Performance Analysis & Academic Management System
          </p>
          <div className="auth-features">
            {[
              { icon: '🤖', text: 'AI-Based Risk Detection & Performance Analysis' },
              { icon: '📊', text: 'Real-time Analytics & Interactive Dashboards' },
              { icon: '🔔', text: 'Smart Notifications & Messaging System' },
              { icon: '📋', text: 'Comprehensive Reports & Academic Tracking' },
              { icon: '🔐', text: 'JWT Authentication & Role-Based Access Control' },
            ].map((f, i) => (
              <div className="auth-feature" key={i}>
                <div className="auth-feature-icon">{f.icon}</div>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-right">
        <div className="auth-box">
          <h2 className="auth-form-title">Welcome Back 👋</h2>
          <p className="auth-form-subtitle">Sign in to your EduTrack AI account</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="you@edutrack.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-control"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',
                    background:'none',border:'none',cursor:'pointer',fontSize:'16px',color:'var(--text-muted)'
                  }}
                >{showPass ? '🙈' : '👁️'}</button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '15px', marginTop: 8 }}
            >
              {loading ? (
                <span style={{display:'flex',alignItems:'center',gap:8}}>
                  <span className="spinner" style={{width:16,height:16,borderWidth:2}} />
                  Signing in...
                </span>
              ) : '🚀 Sign In'}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="demo-accounts">
            <h4>🎮 Demo Accounts</h4>
            {[
              { role: 'Admin', email: 'admin@edutrack.com', pass: 'Admin@123' },
              { role: 'Teacher', email: 'teacher@edutrack.com', pass: 'Teacher@123' },
              { role: 'Student', email: 'student@edutrack.com', pass: 'Student@123' },
            ].map(d => (
              <div className="demo-account" key={d.role}>
                <span className="role">{d.role}</span>
                <span className="creds">{d.email}</span>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => demoLogin(d.email, d.pass)}
                  style={{ padding: '3px 10px', fontSize: '11px' }}
                >Use</button>
              </div>
            ))}
          </div>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: '12px', color: 'var(--text-muted)' }}>
            © 2024 EduTrack AI. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
