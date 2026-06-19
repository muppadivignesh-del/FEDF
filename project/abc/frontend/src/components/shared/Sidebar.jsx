import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const adminNav = [
  { label: 'Overview', group: 'DASHBOARD', items: [
    { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/admin/analytics', icon: '📈', label: 'Analytics' },
  ]},
  { label: 'MANAGEMENT', group: 'MANAGEMENT', items: [
    { path: '/admin/students', icon: '🎓', label: 'Students' },
    { path: '/admin/teachers', icon: '👨‍🏫', label: 'Teachers' },
    { path: '/admin/subjects', icon: '📚', label: 'Subjects' },
  ]},
  { label: 'AI & REPORTS', group: 'AI', items: [
    { path: '/admin/ai-analysis', icon: '🤖', label: 'AI Analysis' },
    { path: '/admin/reports', icon: '📋', label: 'Reports' },
  ]},
  { label: 'COMMUNICATION', group: 'COMM', items: [
    { path: '/admin/messages', icon: '💬', label: 'Messages' },
    { path: '/admin/announcements', icon: '📢', label: 'Announcements' },
    { path: '/admin/notifications', icon: '🔔', label: 'Notifications' },
  ]},
  { label: 'ACCOUNT', group: 'ACC', items: [
    { path: '/admin/profile', icon: '👤', label: 'My Profile' },
  ]},
];

const teacherNav = [
  { label: 'OVERVIEW', group: 'DASH', items: [
    { path: '/teacher/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/teacher/analytics', icon: '📈', label: 'Class Analytics' },
  ]},
  { label: 'TEACHING', group: 'TEACH', items: [
    { path: '/teacher/students', icon: '🎓', label: 'My Students' },
    { path: '/teacher/attendance', icon: '✅', label: 'Attendance' },
    { path: '/teacher/assignments', icon: '📝', label: 'Assignments' },
    { path: '/teacher/marks', icon: '🏆', label: 'Marks & Grades' },
  ]},
  { label: 'AI INSIGHTS', group: 'AI', items: [
    { path: '/teacher/ai-risk', icon: '🤖', label: 'Risk Detection' },
  ]},
  { label: 'COMMUNICATION', group: 'COMM', items: [
    { path: '/teacher/messages', icon: '💬', label: 'Messages' },
    { path: '/teacher/notifications', icon: '🔔', label: 'Notifications' },
  ]},
  { label: 'ACCOUNT', group: 'ACC', items: [
    { path: '/teacher/profile', icon: '👤', label: 'My Profile' },
  ]},
];

const studentNav = [
  { label: 'OVERVIEW', group: 'DASH', items: [
    { path: '/student/dashboard', icon: '📊', label: 'Dashboard' },
  ]},
  { label: 'ACADEMICS', group: 'ACAD', items: [
    { path: '/student/marks', icon: '🏆', label: 'My Marks' },
    { path: '/student/attendance', icon: '✅', label: 'Attendance' },
    { path: '/student/assignments', icon: '📝', label: 'Assignments' },
    { path: '/student/performance', icon: '📈', label: 'Performance Trend' },
  ]},
  { label: 'AI INSIGHTS', group: 'AI', items: [
    { path: '/student/ai-insights', icon: '🤖', label: 'AI Insights' },
  ]},
  { label: 'COMMUNICATION', group: 'COMM', items: [
    { path: '/student/messages', icon: '💬', label: 'Messages' },
    { path: '/student/announcements', icon: '📢', label: 'Announcements' },
    { path: '/student/notifications', icon: '🔔', label: 'Notifications' },
  ]},
  { label: 'ACCOUNT', group: 'ACC', items: [
    { path: '/student/profile', icon: '👤', label: 'My Profile' },
  ]},
];

const navByRole = { admin: adminNav, teacher: teacherNav, student: studentNav };

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const nav = navByRole[user?.role] || [];

  const handleNav = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <aside className={`sidebar${open ? ' open' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🎓</div>
        <div className="sidebar-logo-text">
          <h2>EduTrack AI</h2>
          <span>Academic Management</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {nav.map(section => (
          <div key={section.group}>
            <div className="nav-section-title">{section.label}</div>
            {section.items.map(item => (
              <button
                key={item.path}
                className={`nav-item${location.pathname === item.path ? ' active' : ''}`}
                onClick={() => handleNav(item.path)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </button>
            ))}
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="name">{user?.name || 'User'}</div>
            <div className="role">{user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}</div>
          </div>
          <button
            onClick={logout}
            title="Logout"
            style={{ marginLeft:'auto', background:'none', border:'none', color:'rgba(255,255,255,.4)', cursor:'pointer', fontSize:'16px', padding:'4px' }}
          >🚪</button>
        </div>
      </div>
    </aside>
  );
}
