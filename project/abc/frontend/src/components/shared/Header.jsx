import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { messageAPI } from '../../services/api';

export default function Header({ title, subtitle, onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await messageAPI.getNotifications();
      setNotifications(res.data.data.slice(0, 8));
      setUnread(res.data.unreadCount);
    } catch {}
  };

  const handleNotifClick = async (notif) => {
    if (!notif.is_read) {
      await messageAPI.markNotificationRead(notif.id);
      setUnread(prev => Math.max(0, prev - 1));
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
    }
  };

  const markAllRead = async () => {
    await messageAPI.markAllNotificationsRead();
    setUnread(0);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const notifIcon = (type) => ({ info: '💬', warning: '⚠️', success: '✅', error: '❌', ai_alert: '🤖' }[type] || 'ℹ️');
  const notifBg = (type) => ({ warning: '#fef3c7', ai_alert: '#eef2ff', error: '#fee2e2', success: '#d1fae5' }[type] || '#f0f9ff');

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
  const profilePath = `/${user?.role}/profile`;

  return (
    <header className="header">
      {/* Mobile menu */}
      <button
        className="header-btn"
        onClick={onMenuClick}
        style={{ display: 'none' }}
        id="menu-btn"
      >☰</button>

      <div className="header-title">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>

      <div className="header-actions">
        {/* Notifications */}
        <div className="dropdown" ref={notifRef}>
          <button className="header-btn" onClick={() => { setShowNotif(!showNotif); setShowProfile(false); }}>
            🔔
            {unread > 0 && <span className="badge">{unread > 9 ? '9+' : unread}</span>}
          </button>
          {showNotif && (
            <div className="dropdown-menu" style={{ width: 360 }}>
              <div className="dropdown-header">
                <span>Notifications {unread > 0 && <span style={{color:'var(--primary)',fontSize:'12px'}}>({unread} new)</span>}</span>
                {unread > 0 && <button onClick={markAllRead} style={{background:'none',border:'none',color:'var(--primary)',fontSize:'12px',cursor:'pointer',fontWeight:600}}>Mark all read</button>}
              </div>
              {notifications.length === 0 ? (
                <div style={{padding:'24px',textAlign:'center',color:'var(--text-muted)',fontSize:'13px'}}>No notifications</div>
              ) : notifications.map(n => (
                <div
                  key={n.id}
                  className={`notification-item${!n.is_read ? ' unread' : ''}`}
                  onClick={() => handleNotifClick(n)}
                >
                  <div className="notif-icon" style={{background: notifBg(n.type)}}>{notifIcon(n.type)}</div>
                  <div className="notif-content">
                    <div className="notif-title">{n.title}</div>
                    <div className="notif-msg">{n.message?.substring(0, 80)}{n.message?.length > 80 ? '...' : ''}</div>
                    <div className="notif-time">{new Date(n.created_at).toLocaleString()}</div>
                  </div>
                </div>
              ))}
              <div style={{padding:'10px 16px',borderTop:'1px solid var(--border)',textAlign:'center'}}>
                <button
                  onClick={() => { navigate(`/${user?.role}/notifications`); setShowNotif(false); }}
                  style={{background:'none',border:'none',color:'var(--primary)',fontSize:'12px',cursor:'pointer',fontWeight:600}}
                >View all notifications →</button>
              </div>
            </div>
          )}
        </div>

        {/* Messages shortcut */}
        <button className="header-btn" onClick={() => navigate(`/${user?.role}/messages`)} title="Messages">
          💬
        </button>

        {/* Profile */}
        <div className="dropdown" ref={profileRef}>
          <div className="header-avatar" onClick={() => { setShowProfile(!showProfile); setShowNotif(false); }}>
            {initials}
          </div>
          {showProfile && (
            <div className="dropdown-menu" style={{ width: 220, right: 0 }}>
              <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>{user?.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 2 }}>{user?.email}</div>
                <div style={{ marginTop: 6 }}>
                  <span className={`badge badge-primary`} style={{ fontSize: '10px' }}>{user?.role?.toUpperCase()}</span>
                </div>
              </div>
              <div style={{ padding: '8px' }}>
                <button onClick={() => { navigate(profilePath); setShowProfile(false); }}
                  style={{ width: '100%', padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}
                  onMouseEnter={e => e.target.style.background='var(--bg)'}
                  onMouseLeave={e => e.target.style.background='none'}
                >👤 My Profile</button>
                <button onClick={logout}
                  style={{ width: '100%', padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 8 }}
                  onMouseEnter={e => e.target.style.background='var(--danger-soft)'}
                  onMouseLeave={e => e.target.style.background='none'}
                >🚪 Logout</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
